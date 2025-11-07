import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as TherapistController  from '../controllers/therapist.controller.js';
// import { validateBody } from '../middleware/validation.middleware.js';
// import { therapistSchema } from '../schemas/therapist.schema.js';
import { requireAbility } from '../middleware/requireAbility.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.use(auth);

router.get('/', requireAbility('manage', 'Cadastro'), TherapistController.list);
router.get('/relatorio', TherapistController.getTherapistReport);
router.get('/bancos', TherapistController.listBanks);
router.get('/:therapistId', TherapistController.getById);
router.patch('/:therapistId', requireAbility('manage', 'Cadastro'), TherapistController.update);
router.post('/cadastrar', requireAbility('manage', 'Cadastro'), TherapistController.create);

export default router;
