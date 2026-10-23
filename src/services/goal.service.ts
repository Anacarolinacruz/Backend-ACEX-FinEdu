import type { Goal } from '@prisma/client';

import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

import type {
  CreateGoalInput,
  UpdateGoalInput,
} from '../validators/goal.validator';

function presentGoal(goal: Goal) {
  return {
    id: goal.id,
    title: goal.title,
    emoji: goal.emoji,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    monthlyAmount: goal.monthlyAmount.toNumber(),
    deadline: goal.deadline.toISOString().slice(0, 10),
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

export async function listGoals(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [
      { deadline: 'asc' },
      { id: 'asc' },
    ],
  });

  return goals.map(presentGoal);
}

export async function createGoal(
  userId: string,
  input: CreateGoalInput,
) {
  const goal = await prisma.goal.create({
    data: {
      userId,
      title: input.title,
      emoji: input.emoji,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount,
      monthlyAmount: input.monthlyAmount,
      deadline: new Date(
        `${input.deadline}T00:00:00.000Z`,
      ),
    },
  });

  return presentGoal(goal);
}

export async function updateGoal(
  userId: string,
  goalId: string,
  input: UpdateGoalInput,
) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.goal.updateMany({
      where: {
        id: goalId,
        userId,
      },
      data: {
        title: input.title,
        emoji: input.emoji,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount,
        monthlyAmount: input.monthlyAmount,
        deadline:
          input.deadline !== undefined
            ? new Date(
                `${input.deadline}T00:00:00.000Z`,
              )
            : undefined,
      },
    });

    if (result.count !== 1) {
      throw ApiError.notFound('Meta não encontrada');
    }

    const goal = await tx.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw ApiError.notFound('Meta não encontrada');
    }

    return presentGoal(goal);
  });
}

export async function deleteGoal(
  userId: string,
  goalId: string,
): Promise<void> {
  const result = await prisma.goal.deleteMany({
    where: {
      id: goalId,
      userId,
    },
  });

  if (result.count !== 1) {
    throw ApiError.notFound('Meta não encontrada');
  }
}