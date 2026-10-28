import { z } from 'zod';

// Regras de senha: minimo 8 caracteres, ao menos 1 minuscula, 1 maiuscula e 1 numero.
const passwordSchema = z
  .string({ required_error: 'A senha é obrigatória' })
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número');

// Campos conforme a tela de cadastro do frontend (SignupScreen.tsx):
// nome completo, e-mail, idade, senha e confirmação de senha.
export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'O nome é obrigatório' })
      .trim()
      .min(2, 'O nome deve ter no mínimo 2 caracteres')
      .max(100, 'O nome deve ter no máximo 100 caracteres'),
    email: z
      .string({ required_error: 'O e-mail é obrigatório' })
      .trim()
      .toLowerCase()
      .email('Informe um e-mail válido'),
    age: z.coerce
      .number({ required_error: 'A idade é obrigatória', invalid_type_error: 'A idade deve ser um número' })
      .int('A idade deve ser um número inteiro')
      .min(13, 'É necessário ter no mínimo 13 anos para se cadastrar')
      .max(120, 'Informe uma idade válida'),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: 'A confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Campos conforme a tela de login do frontend (LoginScreen.tsx): e-mail e senha.
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido'),
  password: z.string({ required_error: 'A senha é obrigatória' }).min(1, 'A senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;
// Solicitação do link de recuperação.
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido'),
});

export type ForgotPasswordInput =
  z.infer<typeof forgotPasswordSchema>;

// Redefinição da senha usando o token recebido por e-mail.
export const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: 'O token é obrigatório' })
      .regex(/^[a-f0-9]{64}$/, 'Link de recuperação inválido'),
    password: passwordSchema,
    confirmPassword: z.string({
      required_error: 'A confirmação de senha é obrigatória',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput =
  z.infer<typeof resetPasswordSchema>;

  // Alteração de senha do usuário autenticado.
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: 'A senha atual é obrigatória',
      })
      .min(1, 'Informe a senha atual')
      .max(72, 'A senha atual deve ter no máximo 72 caracteres'),

    password: passwordSchema,

    confirmPassword: z.string({
      required_error: 'A confirmação de senha é obrigatória',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['password'],
  });

export type ChangePasswordInput =
  z.infer<typeof changePasswordSchema>;