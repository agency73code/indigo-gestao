import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateToken, definePassword } from '../controllers/auth.controller.js';

const router: ExpressRouter = Router();

router.get('/validar-token/:token', validateToken);

router.patch('/definir-senha/:token', definePassword);

export default router;
