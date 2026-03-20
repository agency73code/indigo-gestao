import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as GenericsController from '../features/generics/generics.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/:id', auth, GenericsController.getUserInfos);

export default router;
