import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as TherapistController  from '../controllers/therapist.controller.js';
// import { validateBody } from '../middleware/validation.middleware.js';
// import { therapistSchema } from '../schemas/therapist.schema.js';
import { requireAbility } from '../middleware/requireAbility.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/', auth, TherapistController.list);
router.get('/relatorio', auth, TherapistController.getTherapistReport);
router.get('/bancos', auth, TherapistController.listBanks);
router.get('/:therapistId', auth, TherapistController.getById);
router.patch('/:therapistId', auth, requireAbility('manage', 'Cadastro'), TherapistController.update);
router.post('/cadastrar', auth, requireAbility('manage', 'Cadastro'), TherapistController.create);

export default router;
