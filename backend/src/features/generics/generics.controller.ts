import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { uuidParam } from '../../schemas/utils/uuid.js';
import * as GenericsService from './generics.service.js';

export async function getUserInfos(req: Request, res: Response) {
    let id: string;
    try {
        id = uuidParam.parse(req.params.id);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: 'ID inválido.' });
        }
        throw error;
    }

    if (req.user.id !== id) {
        return res.status(403).json({ error: 'Acesso negado.' });
    }

    try {
        const user = await GenericsService.getUserInfos(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const { tipo, nome, dataNascimento } = user;

        return res.json({
            id,
            nome,
            dataNascimento,
            tipo,
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({ error: 'Falha ao buscar usuário.' });
    }
}
