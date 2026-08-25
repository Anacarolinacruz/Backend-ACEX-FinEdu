import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/token';
import { prisma } from '../config/prisma';

/**
 * Middleware de autenticacao (PB04).
 *
 * 1. Extrai o token Bearer do cabecalho Authorization;
 * 2. Valida a assinatura/expiracao do JWT;
 * 3. Confirma que a sessao correspondente ainda existe, nao foi revogada
 *    (logout) e nao expirou no banco de dados;
 * 4. Anexa `req.user` para uso nos controllers seguintes.
 */
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token de autenticação não informado');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Token inválido ou expirado');
  }

  const session = await prisma.session.findUnique({ where: { id: payload.sid } });

  if (!session || session.userId !== payload.sub) {
    throw ApiError.unauthorized('Sessão inválida');
  }

  if (session.revokedAt) {
    throw ApiError.unauthorized('Sessão encerrada. Faça login novamente.');
  }

  if (session.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthorized('Sessão expirada. Faça login novamente.');
  }

  req.user = { id: payload.sub, sessionId: payload.sid };
  next();
});
