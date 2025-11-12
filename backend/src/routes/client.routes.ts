import { Router } from "express";
import type { Router as ExpressRouter } from 'express';
import * as ClientController from "../controllers/client.controller.js";
import { requireAbility } from "../middleware/requireAbility.js";
import { auth } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.get('/', auth, ClientController.list);
router.get('/clientesativos', auth, ClientController.countActiveClients);
router.get('/relatorios', ClientController.getClientReport);
router.get('/:id', auth, ClientController.getById);
router.patch('/:id', auth, requireAbility('update', 'Cadastro'), ClientController.update);
router.post('/cadastrar', auth, requireAbility('create', 'Cadastro'), ClientController.create);

export default router;