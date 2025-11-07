import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as LinkController from '../controllers/links.controller.js';
import * as SuperLinkController from '../features/links/supervision-link/supervisionLink.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.use(auth);

router.get('/getAllClients', LinkController.getAllClients);
router.get('/getAllTherapists', LinkController.getAllTherapists);
router.get('/getAllLinks', LinkController.getAllLinks);
router.post('/createLink', LinkController.createLink);
router.post('/endLink', LinkController.endLink);
router.post('/archiveLink', LinkController.archiveLink);
router.post('/transferResponsible', LinkController.transferResponsible);
router.patch('/updateLink', LinkController.updateLink);

router.post('/createSupervisionLink', SuperLinkController.createSupervisionLinkController);
router.post('/getAllSupervisionLinks', SuperLinkController.getAllSupervisionLinksController);
router.post("/endSupervisionLink", SuperLinkController.endSupervisionLinkController);
router.post("/archiveSupervisionLink", SuperLinkController.archiveSupervisionLinkController);
router.patch("/updateSupervisionLink", SuperLinkController.UpdateSupervisionLinkController);

export default router;