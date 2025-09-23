import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as OcpController from '../controllers/ocp.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/clients', auth, OcpController.listTherapistClients);
router.get("/clients/:clientId", auth, OcpController.getClientById);
router.get('/clients/:clientId/programs', auth, OcpController.listClientPrograms);
router.get('/clients/:clientId/sessions', auth, OcpController.listSessionsByClient);
router.get('/programs/:programId', auth, OcpController.getProgramById);
router.get('/programs/:programId/sessions', auth, OcpController.getSessionByProgram);
router.get('/sessions/:programId', auth, OcpController.getProgramId);
router.get('/reports/kpis/:filters', OcpController.getKpis);
router.get('/reports/filters/programs', OcpController.getProgramsReport);
router.get('/reports/filters/stimulus', OcpController.getStimulusReport);
router.post('/create', auth, OcpController.createProgram);
router.post('/programs/:programId/sessions', auth, OcpController.createSession);
router.patch('/programs/:programId', auth, OcpController.updateProgram);

export default router;