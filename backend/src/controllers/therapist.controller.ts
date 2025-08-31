import type { Request, Response, NextFunction } from 'express';
import {
    saveTherapist
} from '../models/therapist.model.js';
import { sendWelcomeEmail } from '../utils/mail.util.js';
import type { TherapistCreateData } from '../models/therapist.model.js';

export async function createTherapist(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body as TherapistCreateData;
        const therapist = await saveTherapist(data);

        sendWelcomeEmail({
            to: therapist.email,
            name: therapist.nome,
            token: therapist.token_redefinicao!,
        }).catch((error) => {
            console.error('Erro ao enviar email de boas-vindas:', error);
        });

        res.status(201).json({
            message: 'Terapeuta cadastrado com sucesso!',
            data: {
                id: therapist.id,
                nome: therapist.nome,
                email: therapist.email,
                data_entrada: therapist.data_entrada,
            },
        });
    } catch (error) {
        next(error);
    }
}
