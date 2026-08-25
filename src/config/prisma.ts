import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Evita a criacao de multiplas instancias do PrismaClient durante o
// hot-reload em desenvolvimento (cada reload reutiliza a mesma conexao).
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (env.isDevelopment) {
  global.__prisma__ = prisma;
}
