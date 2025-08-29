import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateToken, definePassword } from '../controllers/auth.controller.js';
import { passwordSchema, tokenParamSchema } from '../schemas/password.schema.js'
import { validateBody, validateParams } from '../middleware/validation.middleware.js'

const router: ExpressRouter = Router();

router.get('/validar-token/:token', validateToken);

router.patch('/definir-senha/:token',
    validateParams(tokenParamSchema),
    validateBody(passwordSchema),
    definePassword);

export default router;
