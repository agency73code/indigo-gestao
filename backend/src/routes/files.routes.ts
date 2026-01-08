import { Router } from 'express';
import * as FileController from '../features/file/files.controller.js';
import { upload } from '../config/multer.js';

const router: Router = Router();

// Rotas principais (mantêm os caminhos originais, mas usam a nova lógica)
router.get('/', FileController.listFiles);
router.get('/:storageId/view', FileController.viewFile);
router.get('/:storageId/download', FileController.downloadFile);
router.get('/getAvatar', FileController.getAvatar);

// nova rota (genérica)
router.post('/r2', upload.any(), FileController.uploadGenericToR2);

// legado
router.post('/', upload.any(), FileController.uploadFile);
router.delete('/:id', FileController.deleteFile);

export default router;
