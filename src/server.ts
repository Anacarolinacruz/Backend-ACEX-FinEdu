import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor FinEdu rodando em http://localhost:${env.PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Ambiente: ${env.NODE_ENV}`);
});

async function shutdown(signal: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} recebido. Encerrando servidor...`);

  server.close(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Servidor encerrado com sucesso');
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});
