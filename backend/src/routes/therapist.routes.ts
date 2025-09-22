import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { create, list, getById } from '../controllers/therapist.controller.js';
// import { validateBody } from '../middleware/validation.middleware.js';
// import { therapistSchema } from '../schemas/therapist.schema.js';
import { requireAbility } from '../middleware/requireAbility.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/', auth, list);
router.get('/:id', auth, getById);
router.post('/cadastrar', auth, requireAbility('manage', 'Cadastro'), create);

export default router;
