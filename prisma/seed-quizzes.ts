/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QuestionContent {
  question: string;
  options: [string, string, string];
  correctIndex: number;
  explanation: string;
}

interface CourseQuiz {
  courseId: string;
  questions: QuestionContent[];
}

const quizzes: CourseQuiz[] = [
  {
    courseId: 'seed-curso-financas-basicas',
    questions: [
      {
        question:
          'Qual destas opções é normalmente uma despesa variável?',
        options: [
          'Aluguel',
          'Parcela fixa de um curso',
          'Gastos com lazer',
        ],
        correctIndex: 2,
        explanation:
          'O gasto com lazer varia conforme as escolhas do mês.',
      },
      {
        question:
          'Uma pessoa recebe R$ 2.000 e gasta R$ 1.700. Qual é seu saldo?',
        options: ['R$ 200', 'R$ 300', 'R$ 700'],
        correctIndex: 1,
        explanation:
          'R$ 2.000 menos R$ 1.700 é igual a R$ 300.',
      },
      {
        question:
          'Uma meta de R$ 1.200 para 6 meses exige quanto por mês, sem rendimentos?',
        options: ['R$ 100', 'R$ 200', 'R$ 600'],
        correctIndex: 1,
        explanation:
          'R$ 1.200 dividido por 6 é igual a R$ 200 por mês.',
      },
    ],
  },
  {
    courseId: 'seed-curso-reserva-emergencia',
    questions: [
      {
        question:
          'Qual é a principal função de uma reserva de emergência?',
        options: [
          'Financiar compras por impulso',
          'Proteger você de despesas inesperadas',
          'Buscar o maior retorno possível',
        ],
        correctIndex: 1,
        explanation:
          'A reserva serve como proteção para imprevistos.',
      },
      {
        question:
          'Se suas despesas essenciais são de R$ 1.000 e sua meta é de 3 meses, qual o valor?',
        options: ['R$ 1.000', 'R$ 2.000', 'R$ 3.000'],
        correctIndex: 2,
        explanation:
          'R$ 1.000 multiplicado por 3 é igual a R$ 3.000.',
      },
      {
        question:
          'Para juntar R$ 2.400 em 12 meses, quanto guardar mensalmente, sem rendimentos?',
        options: ['R$ 100', 'R$ 200', 'R$ 400'],
        correctIndex: 1,
        explanation:
          'R$ 2.400 dividido por 12 é igual a R$ 200 por mês.',
      },
    ],
  },
  {
    courseId: 'seed-curso-como-investir',
    questions: [
      {
        question:
          'Um investimento com possibilidade de maior retorno necessariamente dará mais lucro?',
        options: [
          'Sim',
          'Não',
          'Apenas no curto prazo',
        ],
        correctIndex: 1,
        explanation:
          'Maior retorno potencial não é garantia de lucro.',
      },
      {
        question: 'O que significa liquidez?',
        options: [
          'Facilidade de transformar um investimento em dinheiro disponível',
          'Garantia de rentabilidade',
          'Quantidade de investimentos na carteira',
        ],
        correctIndex: 0,
        explanation:
          'Liquidez envolve a facilidade de converter o ativo em dinheiro.',
      },
      {
        question:
          'Qual é uma das principais funções da diversificação?',
        options: [
          'Eliminar completamente os riscos',
          'Garantir lucro',
          'Reduzir a concentração de risco',
        ],
        correctIndex: 2,
        explanation:
          'A diversificação reduz a dependência de uma única exposição, sem eliminar riscos.',
      },
    ],
  },
];

async function main() {
  await prisma.$transaction(
    async (tx) => {
      // Confere as trilhas antes de cadastrar as perguntas.
      for (const quiz of quizzes) {
        const course = await tx.course.findUnique({
          where: { id: quiz.courseId },
          select: {
            id: true,
            title: true,
            lessons: {
              where: { content: { not: '' } },
              select: { id: true },
            },
          },
        });

        if (!course) {
          throw new Error(
            `Trilha não encontrada: ${quiz.courseId}`,
          );
        }

        if (course.lessons.length !== 3) {
          throw new Error(
            `A trilha "${course.title}" precisa ter exatamente 3 aulas com conteúdo.`,
          );
        }

        for (const [index, item] of quiz.questions.entries()) {
          const questionId =
            `${quiz.courseId}-quiz-${index + 1}`;
const questionData = {
  question: item.question,
  explanation: item.explanation,
  order: index + 1,
  course: {
    connect: {
      id: quiz.courseId,
    },
  },
};

await tx.quizQuestion.upsert({
  where: { id: questionId },

  create: {
    id: questionId,
    ...questionData,
  },

  update: {
    ...questionData,
    lesson: {
      disconnect: true,
    },
  },
});

          for (const [optionIndex, text] of item.options.entries()) {
            const optionId =
              `${questionId}-option-${optionIndex + 1}`;

            const optionData = {
              questionId,
              text,
              order: optionIndex + 1,
              isCorrect: optionIndex === item.correctIndex,
            };

            await tx.quizOption.upsert({
              where: { id: optionId },
              create: {
                id: optionId,
                ...optionData,
              },
              update: optionData,
            });
          }
        }
      }
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  console.log(
    'Questionários cadastrados: 3 trilhas, 9 perguntas e 27 alternativas.',
  );
}

void main()
  .catch((error) => {
    console.error('Falha ao cadastrar questionários:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });