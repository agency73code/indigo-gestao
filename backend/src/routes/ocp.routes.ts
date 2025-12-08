import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as OlpController from '../features/olp/olp.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';

const router: ExpressRouter = Router();

router.use(auth);

router.get('/clients', OlpController.listTherapistClients);
router.get('/clients/:clientId', OlpController.getClientById);
router.get('/clients/:clientId/programs', OlpController.listClientPrograms);
router.get('/clients/:clientId/sessions', OlpController.listSessionsByClient);
router.get('/programs/:programId', OlpController.getProgramById);
router.get('/programs/:programId/sessions', OlpController.getSessionByProgram);
router.get('/sessions/:programId', OlpController.getProgramId);
router.get('/reports/kpis/:filters', OlpController.getKpis);
router.get('/reports/filters/programs', OlpController.getProgramsReport);
router.get('/reports/filters/stimulus', OlpController.getStimulusReport);
router.get('/reports/attention-stimuli', OlpController.getAttentionStimuli);
router.post('/create', OlpController.createProgram);
router.post('/programs/:programId/sessions', OlpController.createSession);
router.patch('/programs/:programId', OlpController.updateProgram);

// TO
router.post('/to/programs/:programId/sessions', upload.any(), OlpController.createAreaSession);

// Physiotherapy
router.post('/physiotherapy/programs/:programId/sessions', upload.any(), OlpController.createAreaSession);
router.post('/physiotherapy/sessions/calculatePhysioKpis', OlpController.physioKpis);

export default router;
