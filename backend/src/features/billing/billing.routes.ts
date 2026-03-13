import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { requireAbility } from '../../middleware/requireAbility.js';
import * as BillingController from './billing.controller.js';
import { upload } from '../../config/multer.js';

const router: Router = Router();

router.use(auth);
router.get('/lancamentos', BillingController.listBilling);
router.get('/resumo', BillingController.getBillingSummary);
router.get('/arquivos/:fileId/download', BillingController.downloadBillingFile);
router.post('/lancamentos/:launchId/aprovar', requireAbility('manage', 'Faturamento'), BillingController.approveLaunch);
router.post('/lancamentos/:launchId/rejeitar', requireAbility('manage', 'Faturamento'), BillingController.rejectLaunch);
router.post('/aprovar-lote', requireAbility('manage', 'Faturamento'), BillingController.approveReleases);
router.put('/lancamentos/:launchId/corrigir', upload.any(), BillingController.correctBillingRelease);

export { router as billingRoutes };