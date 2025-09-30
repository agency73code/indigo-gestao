import type { Request, Response, NextFunction } from 'express';
import * as TherapistService from '../features/therapist/therapist.service.js';
import * as TherapistNormalizer from '../features/therapist/therapist.normalizer.js'
import { sendWelcomeEmail } from '../utils/mail.util.js';
import { therapistSchema } from '../schemas/therapist.schema.js';

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = therapistSchema.parse(req.body);
        const therapist = await TherapistService.create(parsed);

        await sendWelcomeEmail({
            to: therapist.email,
            name: therapist.nome,
            token: therapist.token_redefinicao!,
        }).catch((error) => {
            console.error('Erro ao enviar email de boas-vindas:', error);
        });

        res.status(201).json({ success: true, message: 'Terapeuta cadastrado com sucesso!' });  
    } catch (error) {
        next(error);
    }
}

export async function getTherapistReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await TherapistService.getTherapistReport();
    res.json({ data })
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const { therapistId } = req.params;
        if (!therapistId) return res.status(400).json({ success: false, message: 'ID do terapeuta é obrigatório!' });

        const therapist = await TherapistService.getById(therapistId);
        if (!therapist) return res.status(400).json({ success: false, message: 'Terapeuta não encontrado!' });

        const normalized = TherapistNormalizer.normalizeTherapistForm(therapist);
        
        res.json(normalized);
    } catch (error) {
        next(error);
    }
} 

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const therapists = await TherapistService.list();
        const normalized = therapists.map(TherapistNormalizer.normalizeTherapistSession);
        res.json(normalized);
    } catch (error) {
        next(error);
    }
}