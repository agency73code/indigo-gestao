import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { listTherapistClients } from '../controllers/ocp.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/clients', auth, listTherapistClients);

export default router;