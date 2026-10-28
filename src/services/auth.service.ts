import { createHash, randomBytes } from 'node:crypto';
import { sendPasswordResetEmail } from './mail.service';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import {
  hashPassword,
  comparePassword,
} from '../utils/password';
import { signAccessToken } from '../utils/token';
import { parseDurationToMs } from '../utils/duration';

import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

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

// Cria a sessão e gera o token de autenticação.
async function createSessionForUser(
  userId: string,
  context: RequestContext,
) {
  const expiresAt = new Date(
    Date.now() + parseDurationToMs(env.JWT_EXPIRES_IN),
  );

  const session = await prisma.session.create({
    data: {
      userId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    },
  });

  const accessToken = signAccessToken({
    sub: userId,
    sid: session.id,
  });

  return { accessToken, expiresAt };
}

// Cadastro de usuário.
export async function registerUser(
  input: RegisterInput,
  context: RequestContext,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

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

  const { accessToken, expiresAt } =
    await createSessionForUser(user.id, context);

  return { user, accessToken, expiresAt };
}

// Login do usuário.
export async function loginUser(
  input: LoginInput,
  context: RequestContext,
) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Mensagem genérica para não confirmar se o e-mail existe.
  if (!user) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const isPasswordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const { accessToken, expiresAt } =
    await createSessionForUser(user.id, context);

  const { passwordHash: _passwordHash, ...publicUser } = user;

  return { user: publicUser, accessToken, expiresAt };
}

// Revoga a sessão atual.
export async function logoutUser(
  sessionId: string,
): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

// Consulta os dados públicos do usuário.
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

// Redefine a senha usando um token temporário de recuperação.
export async function resetPassword(
  input: ResetPasswordInput,
): Promise<void> {
  const tokenHash = createHash('sha256')
    .update(input.token)
    .digest('hex');

  const resetToken =
    await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= new Date()
  ) {
    throw ApiError.unauthorized(
      'Link de recuperação inválido ou expirado. Solicite um novo link.',
    );
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction(async (tx) => {
    const now = new Date();

    // Consome o token somente se ainda estiver válido e não utilizado.
    const consumed =
      await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          usedAt: now,
        },
      });

    if (consumed.count !== 1) {
      throw ApiError.unauthorized(
        'Link de recuperação inválido ou expirado. Solicite um novo link.',
      );
    }

    // Salva a nova senha criptografada.
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Invalida os demais links de recuperação do usuário.
    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    // Revoga as sessões existentes após a troca da senha.
    await tx.session.updateMany({
      where: {
        userId: resetToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });
  });
}
export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true },
  });

  // Não informa ao solicitante se o e-mail está cadastrado.
  if (!user) {
    return;
  }

  const token = randomBytes(32).toString('hex');

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  const expiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000,
  );

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = new URL(env.FRONTEND_URL);

  // O App.tsx será ajustado para abrir a tela usando esse parâmetro.
  resetUrl.searchParams.set('resetToken', token);

  try {
    await sendPasswordResetEmail(
      user.email,
      resetUrl.toString(),
    );
  } catch {
    // Invalida o token se não houver confirmação do envio.
    await prisma.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Não expõe detalhes SMTP nem a existência da conta na resposta.
    console.error('Falha ao enviar e-mail de recuperação de senha.');
  }
}
// Altera a senha e encerra as sessões do usuário.
export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw ApiError.unauthorized(
      'Sua sessão é inválida. Faça login novamente.',
    );
  }

  const currentPasswordValid = await comparePassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordValid) {
    // Usa conflito para não confundir senha incorreta com sessão expirada
    // no tratamento de HTTP 401 já existente no frontend.
    throw ApiError.conflict('A senha atual está incorreta.');
  }

  const samePassword = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (samePassword) {
    throw ApiError.conflict(
      'A nova senha deve ser diferente da senha atual.',
    );
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction(async (tx) => {
    // Atualiza somente se a senha não mudou durante a verificação.
    const updated = await tx.user.updateMany({
      where: {
        id: userId,
        passwordHash: user.passwordHash,
      },
      data: {
        passwordHash,
      },
    });

    if (updated.count !== 1) {
      throw ApiError.conflict(
        'A senha foi alterada durante a operação. Faça login novamente.',
      );
    }

    const now = new Date();

    // Invalida links de recuperação ainda não utilizados.
    await tx.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    // Encerra todas as sessões existentes, incluindo a atual.
    await tx.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });
  });
}