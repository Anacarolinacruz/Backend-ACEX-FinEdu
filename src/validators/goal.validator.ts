import { z } from 'zod';

const moneySchema = z
  .number({
    required_error: 'Informe o valor',
    invalid_type_error: 'Informe um valor numérico',
  })
  .finite('Informe um valor válido')
  .min(0, 'O valor não pode ser negativo')
  .max(9999999999.99, 'O valor excede o limite permitido')
  .refine(
    (value) =>
      Math.abs(value * 100 - Math.round(value * 100)) < 0.0001,
    'Utilize no máximo duas casas decimais',
  );

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Informe a data no formato AAAA-MM-DD',
  )
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, 'Informe uma data válida');

const goalFields = {
  title: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),

  emoji: z
    .string()
    .trim()
    .min(1, 'Escolha um ícone')
    .max(20, 'Ícone inválido'),

  targetAmount: moneySchema.refine(
    (value) => value > 0,
    'O valor desejado deve ser maior que zero',
  ),

  currentAmount: moneySchema,
  monthlyAmount: moneySchema,
  deadline: dateSchema,
};

export const createGoalSchema = z
  .object({
    ...goalFields,
    emoji: goalFields.emoji.default('🎯'),
    currentAmount: goalFields.currentAmount.default(0),
  })
  .strict();

export const updateGoalSchema = z
  .object(goalFields)
  .partial()
  .strict()
  .refine(
    (input) => Object.keys(input).length > 0,
    'Informe pelo menos um campo para atualizar',
  );

export const goalIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(150);

export type CreateGoalInput = z.infer<
  typeof createGoalSchema
>;

export type UpdateGoalInput = z.infer<
  typeof updateGoalSchema
>;