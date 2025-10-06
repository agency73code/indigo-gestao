import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as LinksController from '../controllers/links.controller.js';

const router: ExpressRouter = Router();

router.get('/getAllClients', LinksController.getAllClients);
router.get('/getAllTherapists', LinksController.getAllTherapists);
router.get('/getAllLinks', LinksController.getAllLinks);

export default router;