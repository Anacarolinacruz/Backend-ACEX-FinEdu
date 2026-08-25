import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API FinEdu operacional',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);

export default router;
