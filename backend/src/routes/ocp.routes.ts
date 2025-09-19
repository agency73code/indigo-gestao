import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as OcpController from '../controllers/ocp.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/clients', auth, OcpController.listTherapistClients);
router.get('/clients/:clientId/programs', OcpController.listClientPrograms);
router.get('/programs/:programId', OcpController.getProgramById);
router.get('/programs/:programId/sessions', OcpController.getSessionByProgram);
router.post('/create', OcpController.create);

export default router;