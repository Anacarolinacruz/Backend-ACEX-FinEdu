/// <reference types="node" />

import 'dotenv/config';

import { prisma } from '../src/config/prisma';
import {
  reconcileCourseProgress,
} from '../src/services/course.service';

const courseIds = [
  'seed-curso-financas-basicas',
  'seed-curso-reserva-emergencia',
  'seed-curso-como-investir',
];

async function main() {
  // Valida todas as trilhas antes de iniciar a ativação.
  for (const courseId of courseIds) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        isPublished: true,
        lessons: {
          where: { content: { not: '' } },
          select: { id: true },
        },
        quizQuestions: {
          where: { lessonId: null },
          select: {
            id: true,
            options: {
              select: { isCorrect: true },
            },
          },
        },
      },
    });

    if (!course || !course.isPublished) {
      throw new Error(
        `Trilha inexistente ou não publicada: ${courseId}`,
      );
    }

    if (
      course.lessons.length !== 3 ||
      course.quizQuestions.length !== 3
    ) {
      throw new Error(
        `"${course.title}" precisa ter três aulas e três perguntas.`,
      );
    }

    for (const question of course.quizQuestions) {
      const correctOptions = question.options.filter(
        (option) => option.isCorrect,
      ).length;

      if (
        question.options.length !== 3 ||
        correctOptions !== 1
      ) {
        throw new Error(
          `Confira as alternativas da pergunta: ${question.id}`,
        );
      }
    }
  }

  for (const courseId of courseIds) {
    // Inclui usuários com progresso de trilha, aula ou questionário.
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            courseProgress: {
              some: { courseId },
            },
          },
          {
            lessonProgress: {
              some: {
                lesson: { courseId },
              },
            },
          },
          {
            quizAttempts: {
              some: {
                question: { courseId },
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { hasFinalQuiz: true },
    });

    let totalXpAwarded = 0;

    for (const user of users) {
      const result = await reconcileCourseProgress(
        user.id,
        courseId,
      );

      totalXpAwarded += result.xpAwarded;
    }

    console.log({
      courseId,
      usuariosProcessados: users.length,
      xpConcedidoNestaExecucao: totalXpAwarded,
    });
  }

  console.log(
    'Questionários ativados e progressos sincronizados.',
  );
}

void main()
  .catch((error) => {
    console.error('Falha na ativação:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  