import express from 'express';
import therapistRouter from './routes/therapist.router.js'

const app = express();

// Middleware globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/terapeutas', therapistRouter);

// Servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});