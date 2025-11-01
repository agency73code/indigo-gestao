import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as GenericsController from '../features/generics/generics.controller.js';

const router: ExpressRouter = Router();

router.get('/:id', GenericsController.getUserInfos);

export default router;