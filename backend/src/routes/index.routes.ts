import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import therapistRoutes from './therapist.routes.js';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js'

const router: ExpressRouter = Router();

router.use('/terapeutas', therapistRoutes);
router.use('/clientes', clientRoutes);
// router.use('/agendamentos', appointmentRouter);
router.use('/auth', authRoutes);

router.get('/', (req, res) => {
    res.json({
        message: 'API Indigo Gestão',
        version: '1.0.0',
        status: 'online',
        routes: {
            terapeutas: '/api/terapeutas',
            clientes: '/api/clientes',
            // agendamentos: '/api/agendamentos',
            auth: '/api/auth',
            health: '/health',
        },
    });
});

export default router;
