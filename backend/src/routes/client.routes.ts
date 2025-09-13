import { Router } from "express";
import type { Router as ExpressRouter } from 'express';
import { create, getById, list } from "../controllers/client.controller.js";
import { validateBody } from "../middleware/validation.middleware.js";
import { clientSchema } from "../schemas/client.schema.js";
import { requireAbility } from "../middleware/requireAbility.js";
import { auth } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.get('/', list);
router.get('/:id', getById);
router.post("/cadastrar", auth, requireAbility('manage', 'Cadastro'), validateBody(clientSchema), create);

export default router;