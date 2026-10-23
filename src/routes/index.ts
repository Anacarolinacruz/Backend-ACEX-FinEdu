import { Router } from 'express';

import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import goalRoutes from './goal.routes';
import marketRoutes from './market.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API FinEdu operacional',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/trails', courseRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/goals', goalRoutes);
router.use('/market', marketRoutes);

export default router;