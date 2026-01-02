import type { Request, Response, NextFunction } from 'express';
import * as anamneseService from '../features/anamnese/anamnese.service.js';
import { AnamneseSchema } from '../schemas/anamnese.schema.js';

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = AnamneseSchema.parse(req.body);

        if (!payload?.cabecalho?.clienteId || !payload?.cabecalho?.profissionalId) {
            return res.status(400).json({
                success: false,
                message: 'clienteId e profissionalId são obrigatórios.',
            });
        }

        const created = await anamneseService.create(payload);

        return res.status(201).json({
            success: true,
            data: created,
            message: 'Anamnese criada com sucesso.',
        });
    } catch (err) {
        next(err);
    }
}