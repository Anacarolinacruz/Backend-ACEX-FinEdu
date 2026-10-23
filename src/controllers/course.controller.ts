import { Request } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import * as service from '../services/course.service';

const idSchema = z.string().trim().min(1).max(150);
function userId(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}
export const list = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { message: 'Trilhas carregadas', data: { trails: await service.listCourses(userId(req)) } });
});
export const detail = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { message: 'Trilha carregada', data: { trail: await service.getCourse(userId(req), idSchema.parse(req.params.courseId)) } });
});
export const lesson = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { message: 'Aula carregada', data: { lesson: await service.getLesson(userId(req), idSchema.parse(req.params.lessonId)) } });
});
export const complete = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { message: 'Aula concluída', data: await service.completeLesson(userId(req), idSchema.parse(req.params.lessonId)) });
});
const answerSchema = z.object({
  selectedOptionId: idSchema,
});

// Consulta o questionário da trilha.
export const quiz = asyncHandler(async (req, res) => {
  const courseId = idSchema.parse(req.params.courseId);

  const result = await service.getCourseQuiz(
    userId(req),
    courseId,
  );

  return sendSuccess(res, 200, {
    message: 'Questionário carregado',
    data: { quiz: result },
  });
});

// Corrige a alternativa selecionada e atualiza progresso e XP.
export const answer = asyncHandler(async (req, res) => {
  const courseId = idSchema.parse(req.params.courseId);
  const questionId = idSchema.parse(req.params.questionId);
  const input = answerSchema.parse(req.body);

  const result = await service.answerCourseQuestion(
    userId(req),
    courseId,
    questionId,
    input.selectedOptionId,
  );

  return sendSuccess(res, 200, {
    message: result.correct
      ? 'Resposta correta'
      : 'Resposta incorreta. Confira a explicação e tente novamente.',
    data: result,
  });
});