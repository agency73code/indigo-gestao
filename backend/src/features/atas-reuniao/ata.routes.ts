import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as AtaController from './ata.controller.js';
import { ataUpload } from './ata.multer.js';

const router: ExpressRouter = Router();

router.use(auth);

// ============================================
// ROTAS DE IA
// ============================================

/** Gera resumo completo da ata */
router.post('/ai/summary', AtaController.handleGerarResumo);

/** Gera resumo para WhatsApp */
router.post('/ai/whatsapp-summary', AtaController.handleGerarResumoWhatsApp);

// ============================================
// ROTAS CRUD (futuro - quando tiver tabela no banco)
// ============================================

router.get('/terapeutas', AtaController.therapistsList);
router.get('/terapeuta/:userId', AtaController.therapistData);
router.get('/', AtaController.list);
router.get('/:id', AtaController.getById);
router.post('/', ataUpload.any(), AtaController.create);
router.patch('/:id', ataUpload.any(), AtaController.update);
router.post('/:id/finalizar', AtaController.finalizeAtaById);
// router.put('/:id', auth, AtaController.update);

export default router;
