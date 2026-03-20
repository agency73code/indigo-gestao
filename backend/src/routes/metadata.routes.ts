import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import * as metadataController from '../controllers/metadata.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router: ExpressRouter = Router();

router.get('/profissional', auth, metadataController.getProfessionalMetadata);

export default router;
