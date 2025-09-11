import { Router } from "express";
import type { Router as ExpressRouter } from 'express';
import { create, getById, list } from "../controllers/client.controller.js";

const router: ExpressRouter = Router();

router.get('/', list);
router.get('/:id', getById);
router.post("/cadastrar", create);

export default router;