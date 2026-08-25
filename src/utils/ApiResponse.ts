import { Response } from 'express';

interface SuccessPayload<T> {
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

/**
 * Envelope padronizado para todas as respostas de sucesso da API:
 * { success: true, message, data, meta? }
 */
export function sendSuccess<T>(res: Response, statusCode: number, payload: SuccessPayload<T>): Response {
  return res.status(statusCode).json({
    success: true,
    message: payload.message,
    data: payload.data ?? null,
    ...(payload.meta ? { meta: payload.meta } : {}),
  });
}
