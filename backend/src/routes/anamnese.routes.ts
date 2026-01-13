import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import * as AnamneseController from '../controllers/anamnese.controller.js';
import { upload } from '../config/multer.js';

const router: ExpressRouter = Router();
router.use(auth);

router.post('/', upload.any(), AnamneseController.create);
router.get('/', AnamneseController.list);
router.get('/:id', AnamneseController.getAnamneseById);
router.get('/:id/exames-previos/:arquivoId/download', AnamneseController.downloadExamePrevioArquivo);
router.patch('/:id', upload.any(), AnamneseController.updateAnamneseById);

export default router;