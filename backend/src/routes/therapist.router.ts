import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { 
    createTherapist, 
    getTherapists, 
    getTherapistById 
} from '../controllers/therapist.controller.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { therapistSchema, therapistIdSchema } from '../schemas/therapist.schema.js';

const router: ExpressRouter = Router();

router.get('/', getTherapists);

router.get('/:id', 
    validateParams(therapistIdSchema),
    getTherapistById
);

router.post('/cadastrar', 
    validateBody(therapistSchema), 
    createTherapist
);

export default router;