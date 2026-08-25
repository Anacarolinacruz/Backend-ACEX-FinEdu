import { PrismaClient, CourseLevel, MaterialType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Populando dados de referencia...');

  const achievements = [
    { code: 'PRIMEIRA_AULA', title: 'Primeira Aula', description: 'Complete sua primeira aula', icon: '🎓' },
    { code: 'SEQUENCIA_7_DIAS', title: 'Sequência de 7 dias', description: 'Mantenha 7 dias consecutivos', icon: '🔥' },
    { code: 'PRIMEIRA_META', title: 'Primeira Meta', description: 'Crie sua primeira meta financeira', icon: '🎯' },
    { code: 'INVESTIDOR_INICIANTE', title: 'Investidor Iniciante', description: 'Complete o curso de investimentos', icon: '📈' },
    { code: 'MESTRE_FINANCEIRO', title: 'Mestre Financeiro', description: 'Complete todos os cursos', icon: '👑' },
    { code: 'SEQUENCIA_30_DIAS', title: 'Sequência de 30 dias', description: 'Mantenha 30 dias consecutivos', icon: '💯' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement,
    });
  }

  const financasBasicas = await prisma.course.upsert({
    where: { id: 'seed-curso-financas-basicas' },
    update: {},
    create: {
      id: 'seed-curso-financas-basicas',
      title: 'Educação Financeira Básica',
      description: 'Aprenda os fundamentos para controlar suas finanças',
      level: CourseLevel.INICIANTE,
      durationMinutes: 150,
      colorHex: '#4ADE80',
    },
  });

  const outrosCursos = [
    {
      id: 'seed-curso-reserva-emergencia',
      title: 'Reserva de Emergência',
      description: 'Como e por que construir sua segurança financeira',
      level: CourseLevel.INICIANTE,
      durationMinutes: 105,
      colorHex: '#22C55E',
    },
    {
      id: 'seed-curso-como-investir',
      title: 'Como Investir',
      description: 'Primeiros passos no mundo dos investimentos',
      level: CourseLevel.INTERMEDIARIO,
      durationMinutes: 195,
      colorHex: '#10B981',
    },
    {
      id: 'seed-curso-controle-gastos',
      title: 'Controle de Gastos',
      description: 'Técnicas para organizar e reduzir despesas',
      level: CourseLevel.INICIANTE,
      durationMinutes: 90,
      colorHex: '#34D399',
    },
    {
      id: 'seed-curso-renda-fixa',
      title: 'Renda Fixa',
      description: 'Entenda CDB, Tesouro Direto e muito mais',
      level: CourseLevel.INTERMEDIARIO,
      durationMinutes: 165,
      colorHex: '#6EE7B7',
    },
    {
      id: 'seed-curso-renda-variavel',
      title: 'Renda Variável',
      description: 'Ações, FIIs e estratégias avançadas',
      level: CourseLevel.AVANCADO,
      durationMinutes: 240,
      colorHex: '#4ADE80',
    },
  ];

  for (const curso of outrosCursos) {
    await prisma.course.upsert({ where: { id: curso.id }, update: {}, create: curso });
  }

  const aula3 = await prisma.lesson.upsert({
    where: { courseId_order: { courseId: financasBasicas.id, order: 3 } },
    update: {},
    create: {
      courseId: financasBasicas.id,
      title: 'Planejamento Financeiro Pessoal',
      order: 3,
      durationSeconds: 18 * 60 + 20,
    },
  });

  await prisma.material.createMany({
    data: [
      {
        lessonId: aula3.id,
        title: 'Planilha de Orçamento Pessoal',
        type: MaterialType.PDF,
        fileUrl: 'https://example.com/materiais/planilha-orcamento.pdf',
        sizeKb: 245,
      },
      {
        lessonId: aula3.id,
        title: 'Guia Completo de Educação Financeira',
        type: MaterialType.PDF,
        fileUrl: 'https://example.com/materiais/guia-educacao-financeira.pdf',
        sizeKb: 1200,
      },
      {
        lessonId: aula3.id,
        title: 'Exercícios Práticos',
        type: MaterialType.PDF,
        fileUrl: 'https://example.com/materiais/exercicios-praticos.pdf',
        sizeKb: 340,
      },
    ],
    skipDuplicates: true,
  });

  const questoes = [
    {
      question: 'Qual é o primeiro passo para ter controle financeiro?',
      order: 1,
      options: [
        { text: 'Investir em ações', isCorrect: false },
        { text: 'Fazer um orçamento mensal', isCorrect: true },
        { text: 'Comprar um carro', isCorrect: false },
        { text: 'Pedir empréstimo', isCorrect: false },
      ],
    },
    {
      question: 'Qual porcentagem da renda é recomendada para reserva de emergência?',
      order: 2,
      options: [
        { text: '5% a 10%', isCorrect: false },
        { text: '10% a 20%', isCorrect: true },
        { text: '20% a 30%', isCorrect: false },
        { text: '50% ou mais', isCorrect: false },
      ],
    },
    {
      question: 'O que é educação financeira?',
      order: 3,
      options: [
        { text: 'Apenas aprender a investir', isCorrect: false },
        { text: 'Saber economizar dinheiro', isCorrect: false },
        { text: 'Conhecimento para gerir finanças de forma consciente', isCorrect: true },
        { text: 'Ter muito dinheiro', isCorrect: false },
      ],
    },
  ];

  for (const q of questoes) {
    const existing = await prisma.quizQuestion.findFirst({ where: { lessonId: aula3.id, order: q.order } });

    if (existing) continue;

    await prisma.quizQuestion.create({
      data: {
        lessonId: aula3.id,
        question: q.question,
        order: q.order,
        options: { create: q.options },
      },
    });
  }

  console.log('Dados de referencia criados com sucesso.');
}

main()
  .catch((error) => {
    console.error('Erro ao popular dados:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
