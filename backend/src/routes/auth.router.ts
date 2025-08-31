import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateToken, definePassword } from '../controllers/auth.controller.js';
import { passwordSchema, tokenParamSchema } from '../schemas/password.schema.js'
import { validateBody, validateParams } from '../middleware/validation.middleware.js'

const router: ExpressRouter = Router();

router.get('/password-reset/validate/:token', validateToken);

router.patch('/password-reset/:token',
    validateParams(tokenParamSchema),
    validateBody(passwordSchema),
    definePassword);

export default router;
