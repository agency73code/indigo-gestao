import { Router } from 'express';
import * as FileController from '../features/file/files.controller.js';
import { upload } from '../config/multer.js';
import { auth } from '../middleware/auth.middleware.js';

const router: Router = Router();

// Rotas principais (mantêm os caminhos originais, mas usam a nova lógica)
router.get('/', auth, FileController.listFiles);
router.get('/:id/view', auth, FileController.viewFile);
router.get('/sessoes/:id/download', auth, FileController.downloadSessionFile);
router.get('/:id/download', auth, FileController.downloadFile);
router.get('/getAvatar', auth, FileController.getAvatar);

// nova rota (genérica)
router.post('/r2', auth, upload.any(), FileController.uploadGenericToR2);

// legado
router.post('/', auth, upload.any(), FileController.uploadFile);
router.delete('/:id', auth, FileController.deleteFile);

export default router;
