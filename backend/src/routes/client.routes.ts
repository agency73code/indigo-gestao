import { Router } from "express";
import type { Router as ExpressRouter } from 'express';
import { createClienteController } from "../controllers/client.controller.js";

const router: ExpressRouter = Router();

router.post("/cadastrar", createClienteController);

export default router;