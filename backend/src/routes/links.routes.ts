import { Router } from 'express';
import { Router as ExpressRouter } from 'express';
import * as LinksController from '../controllers/links.controller.js';

const router: ExpressRouter = Router();

router.get('/getAllClients', LinksController.getAllClients);

export default router;