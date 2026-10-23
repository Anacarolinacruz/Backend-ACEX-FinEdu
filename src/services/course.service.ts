import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

type Transaction = Prisma.TransactionClient;

const includeForUser = (userId: string) => ({
  lessons: {
    where: { content: { not: '' } },
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      title: true,
      order: true,
      durationSeconds: true,
      userProgress: {
        where: { userId },
        select: {
          completed: true,
          completedAt: true,
        },
      },
    },
  },
  quizQuestions: {
    where: { lessonId: null },
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      attempts: {
        where: { userId },
        select: { isCorrect: true },
      },
    },
  },
});

type CourseWithLessons = Prisma.CourseGetPayload<{
  include: ReturnType<typeof includeForUser>;
}>;

// Calcula progresso sem expor perguntas ou gabaritos.
export function presentCourse(course: CourseWithLessons) {
  const { quizQuestions, ...courseData } = course;

  const lessons = course.lessons.map(
    ({ userProgress, ...lesson }) => ({
      ...lesson,
      completed: userProgress[0]?.completed ?? false,
      completedAt: userProgress[0]?.completedAt ?? null,
    }),
  );

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(
    (lesson) => lesson.completed,
  ).length;

  const totalQuestions = quizQuestions.length;

  const answeredQuestions = quizQuestions.filter(
    (question) => question.attempts.length > 0,
  ).length;

  const correctQuestions = quizQuestions.filter(
    (question) =>
      question.attempts.some((attempt) => attempt.isCorrect),
  ).length;

  const allLessonsCompleted =
    totalLessons > 0 && completedLessons === totalLessons;

  const quizConfigured =
    totalLessons === 3 && totalQuestions === 3;

  const quizPassed =
    course.hasFinalQuiz &&
    quizConfigured &&
    correctQuestions >= 2;

  const completed = course.hasFinalQuiz
    ? quizConfigured &&
      allLessonsCompleted &&
      answeredQuestions === 3 &&
      quizPassed
    : allLessonsCompleted;

  const progressPercent = course.hasFinalQuiz
    ? Math.min(
        100,
        completedLessons * 20 +
          answeredQuestions * 10 +
          (completed ? 10 : 0),
      )
    : totalLessons > 0
      ? Math.floor((completedLessons / totalLessons) * 100)
      : 0;

  return {
    ...courseData,
    lessons,
    totalLessons,
    completedLessons,
    totalQuestions,
    answeredQuestions,
    correctQuestions,
    progressPercent,
    quizUnlocked:
      course.hasFinalQuiz &&
      quizConfigured &&
      allLessonsCompleted,
    quizPassed,
    status: completed
      ? 'COMPLETED'
      : completedLessons > 0 || answeredQuestions > 0
        ? 'IN_PROGRESS'
        : 'NOT_STARTED',
    nextLessonId:
      lessons.find((lesson) => !lesson.completed)?.id ?? null,
  };
}

// Repete operações quando ocorrer conflito de concorrência.
async function runTransaction<T>(
  operation: (tx: Transaction) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 30000,
      });
    } catch (error) {
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2034', 'P2002'].includes(error.code);

      if (retryable && attempt < 2) {
        continue;
      }

      throw error;
    }
  }

  throw ApiError.conflict(
    'Não foi possível salvar o progresso. Tente novamente.',
  );
}

// A chave única impede conceder a mesma recompensa novamente.
async function grantReward(
  tx: Transaction,
  userId: string,
  rewardKey: string,
  amount: number,
): Promise<number> {
  const existing = await tx.xpReward.findUnique({
    where: {
      userId_rewardKey: { userId, rewardKey },
    },
    select: { id: true },
  });

  if (existing) return 0;

  await tx.xpReward.create({
    data: { userId, rewardKey, amount },
  });

  await tx.user.update({
    where: { id: userId },
    data: {
      xp: { increment: amount },
    },
  });

  return amount;
}

// Sincroniza progresso e recompensas da trilha.
async function syncCourse(
  tx: Transaction,
  userId: string,
  courseId: string,
) {
  const course = await tx.course.findUniqueOrThrow({
    where: { id: courseId },
    include: includeForUser(userId),
  });

  const summary = presentCourse(course);
  let xpAwarded = 0;

  if (course.hasFinalQuiz) {
    if (
      summary.totalLessons !== 3 ||
      summary.totalQuestions !== 3
    ) {
      throw ApiError.conflict(
        'Esta trilha precisa ter três aulas e três perguntas configuradas.',
      );
    }

    for (const lesson of summary.lessons) {
      if (lesson.completed) {
        xpAwarded += await grantReward(
          tx,
          userId,
          `lesson:${lesson.id}`,
          20,
        );
      }
    }

    for (const question of course.quizQuestions) {
      const correct = question.attempts.some(
        (attempt) => attempt.isCorrect,
      );

      if (correct) {
        xpAwarded += await grantReward(
          tx,
          userId,
          `question:${question.id}`,
          10,
        );
      }
    }

    if (summary.status === 'COMPLETED') {
      xpAwarded += await grantReward(
        tx,
        userId,
        `course:${courseId}:completion`,
        10,
      );
    }
  }

  const existingProgress =
    await tx.userCourseProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

  const completedAt =
    summary.status === 'COMPLETED'
      ? existingProgress?.completedAt ?? new Date()
      : null;

  await tx.userCourseProgress.upsert({
    where: {
      userId_courseId: { userId, courseId },
    },
    create: {
      userId,
      courseId,
      progressPercent: summary.progressPercent,
      completedAt,
    },
    update: {
      progressPercent: summary.progressPercent,
      completedAt,
    },
  });

  const rewardKeys = [
    ...summary.lessons.map(
      (lesson) => `lesson:${lesson.id}`,
    ),
    ...course.quizQuestions.map(
      (question) => `question:${question.id}`,
    ),
    `course:${courseId}:completion`,
  ];

  const rewards = await tx.xpReward.aggregate({
    where: {
      userId,
      rewardKey: { in: rewardKeys },
    },
    _sum: { amount: true },
  });

  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
    },
  });

  return {
    course: {
      ...summary,
      xpEarned: rewards._sum.amount ?? 0,
      maxXp: course.hasFinalQuiz ? 100 : null,
    },
    xpAwarded,
    user,
  };
}

export async function listCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      lessons: {
        some: { content: { not: '' } },
      },
    },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    include: includeForUser(userId),
  });

  return courses.map((course) => {
    const { lessons, ...summary } = presentCourse(course);
    return summary;
  });
}

export async function getCourse(
  userId: string,
  courseId: string,
) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: includeForUser(userId),
  });

  if (!course) {
    throw ApiError.notFound('Trilha não encontrada');
  }

  return presentCourse(course);
}

export async function getLesson(
  userId: string,
  lessonId: string,
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      content: { not: '' },
      course: { isPublished: true },
    },
    select: {
      id: true,
      courseId: true,
      title: true,
      order: true,
      durationSeconds: true,
      content: true,
    },
  });

  if (!lesson) {
    throw ApiError.notFound('Aula não encontrada');
  }

  const course = await getCourse(userId, lesson.courseId);

  const index = course.lessons.findIndex(
    (item) => item.id === lesson.id,
  );

  if (index < 0) {
    throw ApiError.notFound(
      'Aula não encontrada nesta trilha',
    );
  }

  return {
    ...lesson,
    contentFormat: 'markdown',
    courseTitle: course.title,
    completed: course.lessons[index].completed,
    completedAt: course.lessons[index].completedAt,
    previousLessonId: course.lessons[index - 1]?.id ?? null,
    nextLessonId: course.lessons[index + 1]?.id ?? null,
  };
}

export async function completeLesson(
  userId: string,
  lessonId: string,
) {
  return runTransaction(async (tx) => {
    const lesson = await tx.lesson.findFirst({
      where: {
        id: lessonId,
        content: { not: '' },
        course: { isPublished: true },
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!lesson) {
      throw ApiError.notFound('Aula não encontrada');
    }

    const existing = await tx.userLessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    const alreadyCompleted = existing?.completed ?? false;

    const completedAt = alreadyCompleted
      ? existing?.completedAt ?? new Date()
      : new Date();

    await tx.userLessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt,
      },
      update: {
        completed: true,
        completedAt,
      },
    });

    const result = await syncCourse(
      tx,
      userId,
      lesson.courseId,
    );

    return {
      lessonId,
      completed: true,
      completedAt,
      alreadyCompleted,
      ...result,
    };
  });
}

// Retorna as perguntas sem isCorrect ou explicações do gabarito.
export async function getCourseQuiz(
  userId: string,
  courseId: string,
) {
  const course = await getCourse(userId, courseId);

  if (!course.hasFinalQuiz) {
    throw ApiError.notFound(
      'Esta trilha não possui questionário final.',
    );
  }

  if (!course.quizUnlocked) {
    throw ApiError.conflict(
      'Conclua as três aulas para acessar o questionário.',
    );
  }

  const questions = await prisma.quizQuestion.findMany({
    where: {
      courseId,
      lessonId: null,
    },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      question: true,
      order: true,
      options: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          text: true,
          order: true,
        },
      },
      attempts: {
        where: { userId },
        select: { isCorrect: true },
      },
    },
  });

  return {
    courseId,
    courseTitle: course.title,
    questions: questions.map(
      ({ attempts, ...question }) => ({
        ...question,
        answered: attempts.length > 0,
        correct: attempts.some(
          (attempt) => attempt.isCorrect,
        ),
      }),
    ),
  };
}

// Valida a resposta e atualiza progresso e XP na mesma transação.
export async function answerCourseQuestion(
  userId: string,
  courseId: string,
  questionId: string,
  selectedOptionId: string,
) {
  return runTransaction(async (tx) => {
    const course = await tx.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
        hasFinalQuiz: true,
      },
      include: includeForUser(userId),
    });

    if (!course) {
      throw ApiError.notFound(
        'Trilha com questionário não encontrada.',
      );
    }

    if (!presentCourse(course).quizUnlocked) {
      throw ApiError.conflict(
        'Conclua as três aulas para responder ao questionário.',
      );
    }

    const question = await tx.quizQuestion.findFirst({
      where: {
        id: questionId,
        courseId,
        lessonId: null,
      },
      select: {
        id: true,
        explanation: true,
      },
    });

    if (!question) {
      throw ApiError.notFound('Pergunta não encontrada');
    }

    const option = await tx.quizOption.findFirst({
      where: {
        id: selectedOptionId,
        questionId,
      },
      select: {
        id: true,
        isCorrect: true,
      },
    });

    if (!option) {
      throw ApiError.notFound('Alternativa não encontrada');
    }

    const previousCorrect = await tx.quizAttempt.findFirst({
      where: {
        userId,
        questionId,
        isCorrect: true,
      },
      select: { id: true },
    });

    if (previousCorrect) {
      const result = await syncCourse(
        tx,
        userId,
        courseId,
      );

      return {
        questionId,
        correct: true,
        alreadyCorrect: true,
        explanation: question.explanation,
        ...result,
      };
    }

    await tx.quizAttempt.create({
      data: {
        userId,
        questionId,
        selectedOptionId,
        isCorrect: option.isCorrect,
      },
    });

    const result = await syncCourse(
      tx,
      userId,
      courseId,
    );

    return {
      questionId,
      correct: option.isCorrect,
      alreadyCorrect: false,
      explanation: question.explanation,
      ...result,
    };
  });
}

// Usada para adequar os progressos anteriores à nova regra.
export async function reconcileCourseProgress(
  userId: string,
  courseId: string,
) {
  return runTransaction(async (tx) => {
    const course = await tx.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: { id: true },
    });

    if (!course) {
      throw ApiError.notFound('Trilha não encontrada');
    }

    return syncCourse(tx, userId, courseId);
  });
}