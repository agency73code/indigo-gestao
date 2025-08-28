import type { Request, Response, NextFunction } from 'express';
import { 
    saveTherapist,
    findTherapistById,
    getTherapistsList,
    updateTherapist,
    deleteTherapist,
    getTherapistsStatistics
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
            token: therapist.token_redefinicao!
        }).catch(error => {
            console.error('Erro ao enviar email de boas-vindas:', error);
        });
        
        res.status(201).json({
            message: "Terapeuta cadastrado com sucesso!",
            data: {
                id: therapist.id,
                nome: therapist.nome,
                email: therapist.email,
                data_entrada: therapist.data_entrada
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        
        const result = await getTherapistsList(page, limit, search);

        res.json({
            message: "Terapeutas encontrados",
            data: result.therapists,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

export async function getTherapistById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "ID é obrigatório"
            });
        }

        const therapist = await findTherapistById(id);

        if (!therapist) {
            return res.status(404).json({ 
                error: "Terapeuta não encontrado" 
            });
        }

        res.json({
            message: "Terapeuta encontrado",
            data: therapist
        });
    } catch (error) {
        next(error);
    }
}

export async function updateTherapistById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "ID é obrigatório"
            });
        }

        const data = req.body;
        const updatedTherapist = await updateTherapist(id, data);

        res.json({
            message: 'Terapeuta atualizado com sucesso',
            data: updatedTherapist
        });
    } catch (error: any) {
        if (error.message === 'Terapeuta não encontrado.') {
            return res.status(404).json({
                error: error.message
            })
        }

        if (error.message.includes('já está em uso')) {
            return res.status(409).json({
                error: error.message
            });
        }

        console.error('Erro ao atualizar terapeuta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        })
    }
}