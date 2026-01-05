import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import * as AnamneseController from '../controllers/anamnese.controller.js';

const router: ExpressRouter = Router();

router.post('/', auth, AnamneseController.create);
router.get('/', auth, AnamneseController.list);

export default router;