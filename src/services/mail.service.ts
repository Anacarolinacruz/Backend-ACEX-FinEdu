import * as nodemailer from 'nodemailer';
import { env } from '../config/env';

function createMailTransport() {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    !env.MAIL_FROM
  ) {
    throw new Error(
      'Configure SMTP_HOST, SMTP_USER, SMTP_PASS e MAIL_FROM no backend.',
    );
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    requireTLS: !env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

// Verifica conexão e autenticação, sem enviar e-mail.
export async function verifyMailConnection(): Promise<void> {
  const transport = createMailTransport();

  await transport.verify();
}

// Envia o link de recuperação.
export async function sendPasswordResetEmail(
  recipient: string,
  resetUrl: string,
): Promise<void> {
  const transport = createMailTransport();

  await transport.sendMail({
    from: {
      name: 'FinEdu',
      address: env.MAIL_FROM!,
    },
    to: recipient,
    subject: 'FinEdu — Recuperação de senha',
    text: [
      'Olá!',
      '',
      'Recebemos uma solicitação para redefinir sua senha no FinEdu.',
      '',
      'Acesse o link abaixo para cadastrar uma nova senha:',
      resetUrl,
      '',
      `O link é válido por ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutos e pode ser utilizado uma única vez.`,
      '',
      'Se você não solicitou a alteração, ignore este e-mail.',
      '',
      'Equipe FinEdu',
    ].join('\n'),
  });
}