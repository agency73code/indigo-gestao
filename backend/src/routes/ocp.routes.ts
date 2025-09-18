import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as ocp from '../controllers/ocp.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/clients', auth, ocp.listTherapistClients);
router.post('/create', ocp.create);

export default router;