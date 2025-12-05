import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { overview } from '../controllers/cards.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/overview', auth, overview);

export default router;
