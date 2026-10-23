/// <reference types="node" />

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedCourses } from './seed-courses';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedCourses(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('Falha ao atualizar os cursos:', error);
  process.exitCode = 1;
});