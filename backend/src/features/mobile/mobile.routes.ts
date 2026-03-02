import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as MobileController from './mobile.controller.js';

const router: Router = Router();

router.use(auth);

router.get('/bootstrap/base', MobileController.getBootstrapBase);
router.get('/bootstrap/programas', MobileController.getBootstrapPrograms);
router.get('/bootstrap/estimulos', MobileController.getBootstrapStimuli);
router.get('/bootstrap/sessoes', MobileController.getBootstrapSessions);

export { router as mobileRoutes };