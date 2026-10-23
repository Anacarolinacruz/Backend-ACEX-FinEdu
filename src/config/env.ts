import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(3333),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL é obrigatória'),

  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),

  JWT_EXPIRES_IN: z.string().default('1d'),

  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .min(4)
    .max(15)
    .default(12),

  CORS_ORIGIN: z.string().default('*'),

  // Endereço do frontend usado no link de recuperação.
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL deve ser uma URL válida')
    .default('http://localhost:5173'),

  // Validade do link de recuperação em minutos.
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce
    .number()
    .int()
    .min(1)
    .max(60)
    .default(15),

  // Configurações de envio de e-mail.
  // Opcionais nesta etapa para permitir iniciar o backend
  // antes de configurar o serviço.
  SMTP_HOST: z.string().trim().min(1).optional(),

  SMTP_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(587),

  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  SMTP_USER: z.string().trim().min(1).optional(),

  SMTP_PASS: z.string().min(1).optional(),

  MAIL_FROM: z
    .string()
    .email('MAIL_FROM deve ser um e-mail válido')
    .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Variaveis de ambiente invalidas ou ausentes:');

  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = {
  ...parsed.data,

  isProduction: parsed.data.NODE_ENV === 'production',

  isDevelopment: parsed.data.NODE_ENV === 'development',

  corsOrigins: parsed.data.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim()),
};