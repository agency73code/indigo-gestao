import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as OlpController from '../features/olp/olp.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';
import * as psychotherapy from '../features/olp/psychotherapy/psychotherapy.controller.js';

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
router.post('/programs/:programId/sessions', upload.any(), OlpController.createAreaSession);
router.patch('/programs/:programId', OlpController.updateProgram);

// TO
router.post('/to/programs/:programId/sessions', upload.any(), OlpController.createAreaSession);
router.post('/to/sessions/calculateOccupationalKpis', OlpController.occupationalKpis);

// Physiotherapy
router.post('/physiotherapy/programs/:programId/sessions', upload.any(), OlpController.createAreaSession);
router.post('/physiotherapy/sessions/calculatePhysioKpis', OlpController.physioKpis);

// Musictherapy
router.post('/musictherapy/programs/:programId/sessions', upload.any(), OlpController.createAreaSession);
router.post('/musictherapy/sessions/calculateMusicKpis', OlpController.musicKpis);
router.get('/musictherapy/programs/graficMusicDetails', OlpController.getMusicTherapyEvolutionChart);

// psychotherapy
router.post('/prontuarios-psicologicos', psychotherapy.createPsychotherapyRecord);
router.get('/prontuarios-psicologicos/cliente/:clientId', psychotherapy.searchMedicalRecordByClient);
router.get('/prontuarios-psicologicos', psychotherapy.listMedicalRecords);
router.get('/prontuarios-psicologicos/:medicalRecordId', psychotherapy.searchMedicalRecordById);
router.post('/prontuarios-psicologicos/:medicalRecordId/evolucoes', psychotherapy.createEvolution);
export default router;
