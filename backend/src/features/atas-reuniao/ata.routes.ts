/**
 * Rotas para Atas de Reunião
 * @module features/atas-reuniao
 */

import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as AtaController from './ata.controller.js';

const router: ExpressRouter = Router();

// ============================================
// ROTAS DE IA
// ============================================

/** Gera resumo completo da ata */
router.post('/ai/summary', auth, AtaController.handleGerarResumo);

/** Gera resumo para WhatsApp */
router.post('/ai/whatsapp-summary', auth, AtaController.handleGerarResumoWhatsApp);

// ============================================
// ROTAS CRUD (futuro - quando tiver tabela no banco)
// ============================================

// router.get('/', auth, AtaController.list);
// router.get('/:id', auth, AtaController.getById);
// router.post('/', auth, AtaController.create);
// router.put('/:id', auth, AtaController.update);
// router.delete('/:id', auth, AtaController.remove);

export default router;
