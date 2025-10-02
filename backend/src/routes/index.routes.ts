import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import therapistRoutes from './therapist.routes.js';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js';
import filesRoutes from './files.routes.js';
import cardsRoutes from './cards.routes.js';
import ocpRoutes from './ocp.routes.js';
import linksRoutes from './links.routes.js';

const router: ExpressRouter = Router();

router.use('/terapeutas', therapistRoutes);
router.use('/clientes', clientRoutes);
router.use('/auth', authRoutes);
router.use('/arquivos', filesRoutes);
router.use('/cards', cardsRoutes);
router.use('/ocp', ocpRoutes);
router.use('/links', linksRoutes);

export default router;
