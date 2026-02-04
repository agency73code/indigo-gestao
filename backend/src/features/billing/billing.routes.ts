import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as BillingController from './billing.controller.js';

const router: Router = Router();

router.use(auth);
router.get('/lancamentos', BillingController.listBilling);
router.get('/resumo', BillingController.getBillingSummary);
router.get('/arquivos/:fileId/download', BillingController.downloadBillingFile);
router.post('/lancamentos/:launchId/aprovar', BillingController.approveLaunch);

export { router as billingRoutes };