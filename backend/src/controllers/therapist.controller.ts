import type { Request, Response, NextFunction } from 'express';
import { sendWelcomeEmail } from '../utils/mail.util.js';
import type { TherapistCreateData } from '../features/therapist/therapist.types.js';
import { createTherapistBase } from '../features/therapist/therapist.mapper.js';
import { prisma } from '../config/database.js';

export async function createTherapist(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body as TherapistCreateData;
        const therapist = await createTherapistBase(prisma, data);

        await sendWelcomeEmail({
            to: therapist.email,
            name: therapist.nome,
            token: therapist.token_redefinicao!,
        }).catch((error) => {
            console.error('Erro ao enviar email de boas-vindas:', error);
        });

        res.status(201).json({
            success: true,
            message: 'Terapeuta cadastrado com sucesso!'
        });
    } catch (error) {
        next(error);
    }
}
