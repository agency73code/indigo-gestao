/**
 * Rotas da API de IA
 * @module features/ai
 */

import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { handleGenerateSummary } from './ai.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.post('/generate-summary', auth, handleGenerateSummary);

export default router;
