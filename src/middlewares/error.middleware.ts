import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): Response {
  // Erros de validacao (zod) - dados de entrada invalidos
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.flatten().fieldErrors,
    });
  }

  // Erros conhecidos do Prisma (ex: violacao de unicidade, registro nao encontrado)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Já existe um registro com esses dados',
        errors: err.meta,
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado',
      });
    }
  }

  // Erros esperados da aplicacao
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Erros inesperados
  // eslint-disable-next-line no-console
  console.error('Erro não tratado:', err);

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(env.isDevelopment && err instanceof Error ? { stack: err.stack } : {}),
  });
}
