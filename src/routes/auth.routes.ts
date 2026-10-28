import { Router } from 'express';

import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  authController.register,
);

router.post(
  '/login',
  authRateLimiter,
  authController.login,
);

router.post(
  '/forgot-password',
  authRateLimiter,
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  authRateLimiter,
  authController.resetPassword,
);

router.post(
  '/change-password',
  requireAuth,
  authRateLimiter,
  authController.changePassword,
);

router.post(
  '/logout',
  requireAuth,
  authController.logout,
);

router.get(
  '/me',
  requireAuth,
  authController.me,
);

export default router;