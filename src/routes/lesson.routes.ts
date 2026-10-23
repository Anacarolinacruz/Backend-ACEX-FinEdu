import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as controller from '../controllers/course.controller';
const router = Router();
router.use(requireAuth);
router.get('/:lessonId', controller.lesson);
router.post('/:lessonId/complete', controller.complete);
export default router;
