import type { Request, Response } from 'express';
import * as GenericsService from './generics.service.js';

export async function getUserInfos(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
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
