import Router, { type IRoute, type IRouter } from 'express';
import { createTherapist } from '../controllers/therapist.controller.js';

const router: IRouter = Router();

router.post('/cadastrar', createTherapist);

export default router;