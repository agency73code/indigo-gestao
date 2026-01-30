import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as BillingController from './billing.controller.js';

const router: Router = Router();

router.use(auth);
router.get('/arquivos/:fileId/download', BillingController.downloadBillingFile);
router.get('/lancamentos', BillingController.listBilling);

export { router as billingRoutes };