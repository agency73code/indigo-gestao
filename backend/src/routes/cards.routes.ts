import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { overview } from '../controllers/cards.controller.js';

const router: ExpressRouter = Router();

router.get('/overview', overview);

export default router;