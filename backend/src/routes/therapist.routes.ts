import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { create, list, getById } from '../controllers/therapist.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { therapistSchema } from '../schemas/therapist.schema.js';

const router: ExpressRouter = Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/cadastrar', validateBody(therapistSchema), create);

export default router;
