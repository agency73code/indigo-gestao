import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { createTherapist } from '../controllers/therapist.controller.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import {
    therapistSchema,
    therapistIdSchema,
    therapistUpdateSchema,
} from '../schemas/therapist.schema.js';

const router: ExpressRouter = Router();

//router.get('/', getTherapists);

//router.get('/:id', validateParams(therapistIdSchema), getTherapistById);

router.post('/cadastrar', validateBody(therapistSchema), createTherapist);

// router.put(
//     '/:id',
//     validateParams(therapistIdSchema),
//     validateBody(therapistUpdateSchema),
//     updateTherapistById,
// );

export default router;
