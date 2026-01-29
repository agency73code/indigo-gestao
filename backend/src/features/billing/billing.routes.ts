import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as BillingController from './billing.controller.js';

const router: Router = Router();

router.get('/arquivos/:fileId/download', auth, BillingController.downloadBillingFile);

export { router as billingRoutes };