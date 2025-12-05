import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';
import * as ReportController from '../features/reports/report.controller.js';

const router: ExpressRouter = Router();
router.use(auth);

router.post('/', upload.single('pdf'), ReportController.saveReport);
router.get('/', ReportController.listReports);
router.get('/:id', ReportController.getReport);
router.delete('/:id', ReportController.deleteReport);

export default router;
