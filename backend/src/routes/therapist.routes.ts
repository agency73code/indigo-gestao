import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { createTherapist, listTherapists, getTherapistById } from '../controllers/therapist.controller.js';
//import { validateBody } from '../middleware/validation.middleware.js';

const router: ExpressRouter = Router();

router.get('/', listTherapists);
router.get('/:id', getTherapistById);
//router.post('/cadastrar', validateBody(therapistSchema), createTherapist);
router.post('/cadastrar', createTherapist);

export default router;
