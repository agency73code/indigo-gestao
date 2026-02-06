import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as TherapistController from '../controllers/therapist.controller.js';
import { requireAbility } from '../middleware/requireAbility.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.use(auth);
router.get('/', requireAbility('read', 'Consultar'), TherapistController.list);
router.get('/relatorio', TherapistController.getTherapistReport);
router.get('/bancos', TherapistController.listBanks);
router.get('/:therapistId', TherapistController.getById);
router.get('/:therapistId/sumario', TherapistController.fetchTherapistSummaryById);
router.patch('/:therapistId', requireAbility('manage', 'Cadastro'), TherapistController.update);
router.post('/cadastrar', requireAbility('manage', 'Cadastro'), TherapistController.create);

export default router;
