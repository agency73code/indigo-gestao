import Router, {} from 'express';
import { createTherapist } from '../controllers/therapist.controller.js';
const router = Router();
router.post('/cadastrar', createTherapist);
export default router;
//# sourceMappingURL=therapist.router.js.map