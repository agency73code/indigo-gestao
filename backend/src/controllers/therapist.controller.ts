import type { Request, Response, NextFunction } from 'express';
import * as therapistService from '../features/therapist/therapist.service.js';
import { sendWelcomeEmail } from '../utils/mail.util.js';

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID inválido' });

        const data = await therapistService.getById(id);
        if (!data) return res.status(404).json({ success: false, message: 'Terapeuta não encontrado' });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await therapistService.list();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const therapist = await therapistService.create(req.body);

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