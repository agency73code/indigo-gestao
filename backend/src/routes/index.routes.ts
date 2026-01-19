import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import therapistRoutes from './therapist.routes.js';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js';
import filesRoutes from './files.routes.js';
import cardsRoutes from './cards.routes.js';
import ocpRoutes from './ocp.routes.js';
import linksRoutes from './links.routes.js';
import metadataRoutes from './metadata.routes.js';
import genericsRoutes from './generics.routes.js';
import reportsRoutes from './reports.routes.js';
import aiRoutes from '../features/ai/ai.routes.js';
import anamneseRoutes from './anamnese.routes.js';
import atasReuniaoRoutes from '../features/atas-reuniao/ata.routes.js';

const router: ExpressRouter = Router();

router.use('/terapeutas', therapistRoutes);
router.use('/clientes', clientRoutes);
router.use('/usuarios', genericsRoutes);
router.use('/auth', authRoutes);
router.use('/arquivos', filesRoutes);
router.use('/cards', cardsRoutes);
router.use('/ocp', ocpRoutes);
router.use('/links', linksRoutes);
router.use('/metadata', metadataRoutes);
router.use('/relatorios', reportsRoutes);
router.use('/ai', aiRoutes);
router.use('/anamneses', anamneseRoutes);
router.use('/atas-reuniao', atasReuniaoRoutes);

export default router;
