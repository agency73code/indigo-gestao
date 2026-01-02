import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import * as AnamneseController from '../controllers/anamnese.controller.js';

const router: ExpressRouter = Router();

router.post('/', auth, AnamneseController.create);

export default router;