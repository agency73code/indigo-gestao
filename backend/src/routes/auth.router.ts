import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { validateToken, definePassword, validateLogin, me } from '../controllers/auth.controller.js';
import { passwordSchema, tokenParamSchema } from '../schemas/password.schema.js'
import { validateBody, validateParams } from '../middleware/validation.middleware.js'
import { auth } from '../middleware/auth.middleware.js'

const router: ExpressRouter = Router();

router.get('/password-reset/validate/:token', validateToken);
router.get('/me', auth, me);

router.patch('/password-reset/:token',
    validateParams(tokenParamSchema),
    validateBody(passwordSchema),
    definePassword);

router.post('/login', validateLogin);

export default router;
