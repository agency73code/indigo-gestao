import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as LinkController from '../controllers/links.controller.js';
import * as SuperLinkController from '../features/links/supervision-link/supervisionLink.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { requireAbility } from '../middleware/requireAbility.js';
import { auditMiddleware } from '../utils/auditContext.js';

const router: ExpressRouter = Router();
router.use(auth);
router.use(auditMiddleware);

router.get('/clientOptions', LinkController.getClientOptions);
router.get('/clients', LinkController.listClients);
router.get('/therapists/select', LinkController.selectTherapists);
router.get('/therapists/list', LinkController.listTherapists);
router.get('/getAllLinks', LinkController.getAllLinks);
router.post('/createLink', requireAbility('manage', 'Cadastro'), LinkController.createLink);
router.post('/endLink', requireAbility('manage', 'Cadastro'), LinkController.endLink);
router.post('/archiveLink', requireAbility('manage', 'Cadastro'), LinkController.archiveLink);
router.post('/transferResponsible', requireAbility('manage', 'Cadastro'), LinkController.transferResponsible);
router.patch('/updateLink', requireAbility('manage', 'Cadastro'), LinkController.updateLink);

router.post('/createSupervisionLink', requireAbility('manage', 'Cadastro'), SuperLinkController.createSupervisionLinkController);
router.post('/getAllSupervisionLinks', SuperLinkController.getAllSupervisionLinksController);
router.post('/endSupervisionLink', requireAbility('manage', 'Cadastro'), SuperLinkController.endSupervisionLinkController);
router.post('/archiveSupervisionLink', requireAbility('manage', 'Cadastro'), SuperLinkController.archiveSupervisionLinkController);
router.patch('/updateSupervisionLink', requireAbility('manage', 'Cadastro'), SuperLinkController.UpdateSupervisionLinkController);

export default router;
