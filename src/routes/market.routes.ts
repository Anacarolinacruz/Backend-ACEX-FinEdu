import { Router } from 'express';

import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { getMarketRates } from '../services/market.service';

const router = Router();

router.use(requireAuth);

router.get(
  '/rates',
  asyncHandler(async (_req, res) => {
    const rates = await getMarketRates();

    return sendSuccess(res, 200, {
      message: 'Referências de mercado consultadas',
      data: { rates },
    });
  }),
);

export default router;