import { Router } from "express";
import type { Router as ExpressRouter } from 'express';
import { createClienteController, getClientById, listClients } from "../controllers/client.controller.js";

const router: ExpressRouter = Router();

router.get('/', listClients);
router.get('/:id', getClientById);
router.post("/cadastrar", createClienteController);

export default router;