import express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import routes from './routes/index.js';
import cookieParser from 'cookie-parser';

const app: Express = express();

app.use(helmet()); // Remove headers que expõem tecnologias
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }),
);

app.use(compression()); // Comprime resposta para economizar banda

// Rate Limiting (proteção contra spam/DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limita cada IP a 100 requisições por janela
    message: {
        error: 'Too many requests',
        message: 'Please try again later.',
    },
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;

// SERVIDOR
if (process.env.NODE_ENV !== 'test') {
    const PORT = env.PORT;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
}
