import { PrismaClient, CourseLevel } from '@prisma/client';
import { trailContent } from './course-content';

export async function seedCourses(prisma: PrismaClient) {
  for (const [index, trail] of trailContent.entries()) {
    await prisma.$transaction(async tx => {
      const data = {
        title: trail.title, description: trail.description, colorHex: trail.colorHex,
        level: CourseLevel.INICIANTE, order: index + 1, isPublished: true,
        durationMinutes: trail.lessons.length * 5,
      };
      await tx.course.upsert({ where: { id: trail.id }, update: data, create: { id: trail.id, ...data } });
      for (const [lessonIndex, [title, objective, explanation, example, exercise]] of trail.lessons.entries()) {
        const content = `# ${title}\n\n## Objetivo\n${objective}\n\n## Conteúdo\n${explanation}\n\n## Exemplo\n${example}\n\n## Atividade prática\n${exercise}\n\n## Resumo\nRevise o objetivo da aula e explique o conceito com suas palavras.\n`;
        const lesson = { title, content, durationSeconds: 300, videoUrl: null };
        await tx.lesson.upsert({
          where: { courseId_order: { courseId: trail.id, order: lessonIndex + 1 } },
          update: lesson,
          create: { courseId: trail.id, order: lessonIndex + 1, ...lesson },
        });
      }
    });
  }
  console.log('3 trilhas e 9 aulas em texto cadastradas/atualizadas.');
}


