import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';

function getRequestContext(req: Request) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

// POST /api/v1/auth/register (PB03)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, expiresAt } = await authService.registerUser(input, getRequestContext(req));

  return sendSuccess(res, 201, {
    message: 'Conta criada com sucesso',
    data: { user, accessToken, expiresAt },
  });
});

// POST /api/v1/auth/login (PB04)
export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, expiresAt } = await authService.loginUser(input, getRequestContext(req));

  return sendSuccess(res, 200, {
    message: 'Login realizado com sucesso',
    data: { user, accessToken, expiresAt },
  });
});

// POST /api/v1/auth/logout (PB05)
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  await authService.logoutUser(req.user.sessionId);

  return sendSuccess(res, 200, { message: 'Logout realizado com sucesso' });
});

// GET /api/v1/auth/me (rota protegida, usada para validar PB04 e alimentar o frontend)
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const user = await authService.getUserById(req.user.id);

  return sendSuccess(res, 200, { message: 'Usuário autenticado', data: { user } });
});
