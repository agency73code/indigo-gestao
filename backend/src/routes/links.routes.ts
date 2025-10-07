import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as LinkController from '../controllers/links.controller.js';

const router: ExpressRouter = Router();

router.get('/getAllClients', LinkController.getAllClients);
router.get('/getAllTherapists', LinkController.getAllTherapists);
router.get('/getAllLinks', LinkController.getAllLinks);
router.post('/createLink', LinkController.createLink);
router.post('/endLink', LinkController.endLink);
router.post('/archiveLink', LinkController.archiveLink);
router.post('/transferResponsible', LinkController.transferResponsible);
router.patch('/updateLink', LinkController.updateLink);

export default router;