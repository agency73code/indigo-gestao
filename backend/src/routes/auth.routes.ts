import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import {
    validateToken,
    definePassword,
    validateLogin,
    me,
    requestPasswordReset,
    logout,
    requestLastPasswordChange,
    refreshAccessToken,
} from '../controllers/auth.controller.js';
import {
    forgotPasswordBodySchema,
    passwordSchema,
    tokenParamSchema,
} from '../schemas/password.schema.js';
import { loginSchema } from '../schemas/login.schema.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { auth } from '../middleware/auth.middleware.js';
import { logoutBodySchema, refreshTokenBodySchema } from '../schemas/refresh-token.schema.js';

const router: ExpressRouter = Router();

router.get('/password-reset/validate/:token', validateToken);
router.get('/me', auth, me);
router.post('/login', validateBody(loginSchema), validateLogin);
router.post('/refresh', validateBody(refreshTokenBodySchema), refreshAccessToken);
router.post('/logout', validateBody(logoutBodySchema), logout);
router.post('/forgot-password', validateBody(forgotPasswordBodySchema), requestPasswordReset);
router.patch(
    '/password-reset/:token',
    validateParams(tokenParamSchema),
    validateBody(passwordSchema),
    definePassword,
);
router.get('/password-info', auth, requestLastPasswordChange);

export default router;
