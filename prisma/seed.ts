import { PrismaClient } from '@prisma/client';
import { seedCourses } from './seed-courses';
const prisma = new PrismaClient();
async function main() {
  const achievements = [
    { code: 'PRIMEIRA_AULA', title: 'Primeira Aula', description: 'Complete sua primeira aula', icon: '🎓' },
    { code: 'SEQUENCIA_7_DIAS', title: 'Sequência de 7 dias', description: 'Mantenha 7 dias consecutivos', icon: '🔥' },
    { code: 'PRIMEIRA_META', title: 'Primeira Meta', description: 'Crie sua primeira meta financeira', icon: '🎯' },
    { code: 'INVESTIDOR_INICIANTE', title: 'Investidor Iniciante', description: 'Complete o curso de investimentos', icon: '📈' },
    { code: 'MESTRE_FINANCEIRO', title: 'Mestre Financeiro', description: 'Complete todos os cursos', icon: '👑' },
    { code: 'SEQUENCIA_30_DIAS', title: 'Sequência de 30 dias', description: 'Mantenha 30 dias consecutivos', icon: '💯' },
  ];
  for (const achievement of achievements) {
    await prisma.achievement.upsert({ where: { code: achievement.code }, update: {}, create: achievement });
  }
  await seedCourses(prisma);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
