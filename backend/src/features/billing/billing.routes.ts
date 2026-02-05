import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as BillingController from './billing.controller.js';
import { upload } from '../../config/multer.js';

const router: Router = Router();

router.use(auth);
router.get('/lancamentos', BillingController.listBilling);
router.get('/resumo', BillingController.getBillingSummary);
router.get('/arquivos/:fileId/download', BillingController.downloadBillingFile);
router.post('/lancamentos/:launchId/aprovar', BillingController.actionLaunch);
router.post('/lancamentos/:launchId/rejeitar', BillingController.actionLaunch);
router.put('/lancamentos/:launchId/corrigir', upload.any(), BillingController.correctBillingRelease);

export { router as billingRoutes };