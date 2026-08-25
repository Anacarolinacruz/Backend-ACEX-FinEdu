import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken } from '../utils/token';
import { parseDurationToMs } from '../utils/duration';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  age: true,
  investorProfile: true,
  xp: true,
  level: true,
  streak: true,
  onboardingCompletedAt: true,
  createdAt: true,
} as const;

interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

async function createSessionForUser(userId: string, context: RequestContext) {
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_EXPIRES_IN));

  const session = await prisma.session.create({
    data: {
      userId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    },
  });

  const accessToken = signAccessToken({ sub: userId, sid: session.id });

  return { accessToken, expiresAt };
}

export async function registerUser(input: RegisterInput, context: RequestContext) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw ApiError.conflict('Este e-mail já está cadastrado');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      age: input.age,
      passwordHash,
    },
    select: PUBLIC_USER_SELECT,
  });

  const { accessToken, expiresAt } = await createSessionForUser(user.id, context);

  return { user, accessToken, expiresAt };
}

export async function loginUser(input: LoginInput, context: RequestContext) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Mensagem propositalmente genérica: evita confirmar se o e-mail existe.
  if (!user) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const { accessToken, expiresAt } = await createSessionForUser(user.id, context);

  const { passwordHash: _passwordHash, ...publicUser } = user;

  return { user: publicUser, accessToken, expiresAt };
}

export async function logoutUser(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });

  if (!user) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  return user;
}
