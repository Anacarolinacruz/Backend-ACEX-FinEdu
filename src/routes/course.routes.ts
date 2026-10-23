import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as controller from '../controllers/course.controller';

const router = Router();

// Todas as rotas abaixo exigem usuário autenticado.
router.use(requireAuth);

// Lista as trilhas.
router.get('/', controller.list);

// Carrega o questionário final.
router.get('/:courseId/quiz', controller.quiz);

// Corrige uma resposta e atualiza progresso e XP.
router.post(
  '/:courseId/quiz/:questionId/answer',
  controller.answer,
);

// Carrega os detalhes da trilha.
router.get('/:courseId', controller.detail);

export default router;