import { Router } from 'express';

import { requireAuth } from '../middlewares/auth.middleware';
import * as controller from '../controllers/goal.controller';

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:goalId', controller.update);
router.delete('/:goalId', controller.remove);

export default router;