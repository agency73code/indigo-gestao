import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as metadataController from '../controllers/metadata.controller.js';

const router: ExpressRouter = Router();

router.get('/profissional', metadataController.getProfessionalMetadata);

export default router;
