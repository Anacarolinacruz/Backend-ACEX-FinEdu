import type { Request } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

import {
  createGoalSchema,
  updateGoalSchema,
  goalIdSchema,
} from '../validators/goal.validator';

import * as service from '../services/goal.service';

function authenticatedUserId(req: Request): string {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  return req.user.id;
}

export const list = asyncHandler(async (req, res) => {
  const goals = await service.listGoals(
    authenticatedUserId(req),
  );

  return sendSuccess(res, 200, {
    message: 'Metas carregadas',
    data: { goals },
  });
});

export const create = asyncHandler(async (req, res) => {
  const input = createGoalSchema.parse(req.body);

  const goal = await service.createGoal(
    authenticatedUserId(req),
    input,
  );

  return sendSuccess(res, 201, {
    message: 'Meta criada com sucesso',
    data: { goal },
  });
});

export const update = asyncHandler(async (req, res) => {
  const goalId = goalIdSchema.parse(req.params.goalId);
  const input = updateGoalSchema.parse(req.body);

  const goal = await service.updateGoal(
    authenticatedUserId(req),
    goalId,
    input,
  );

  return sendSuccess(res, 200, {
    message: 'Meta atualizada com sucesso',
    data: { goal },
  });
});

export const remove = asyncHandler(async (req, res) => {
  const goalId = goalIdSchema.parse(req.params.goalId);

  await service.deleteGoal(
    authenticatedUserId(req),
    goalId,
  );

  return sendSuccess(res, 200, {
    message: 'Meta excluída com sucesso',
    data: { id: goalId },
  });
});