/**
 * Rotas da API de IA
 * @module features/ai
 */

import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { handleGenerateSummary, handleGenerateProntuarioSummary } from './ai.controller.js';
import { auth } from '../../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

// Resumo de relatórios clínicos
router.post('/generate-summary', auth, handleGenerateSummary);

// Resumo de evoluções de prontuário psicológico
router.post('/generate-prontuario-summary', auth, handleGenerateProntuarioSummary);

export default router;
