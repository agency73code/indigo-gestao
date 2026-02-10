import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as ClientController from '../controllers/client.controller.js';
import { requireAbility } from '../middleware/requireAbility.js';
import { auth } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';

const router: ExpressRouter = Router();
router.use(auth);

router.get('/', ClientController.list);
router.get('/clientesativos', ClientController.countActiveClients);
router.get('/relatorios', ClientController.getClientReport);
router.get('/:id', ClientController.getById);
router.patch('/:id', requireAbility('update', 'Cadastro'), upload.any(), ClientController.update);
router.post('/cadastrar', requireAbility('create', 'Cadastro'), ClientController.create);

export default router;
