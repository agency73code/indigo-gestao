import type { Request, Response, NextFunction } from 'express';
import * as anamneseService from '../features/anamnese/anamnese.service.js';
import { AnamneseSchema } from '../schemas/anamnese.schema.js';
import { anamneseListSchema } from '../schemas/queries/anamnese.schema.js';
import type { AnamneseListFilters } from '../features/anamnese/anamnese.types.js';

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

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, message: 'ID do terapeuta é obrigatório!' });
        }

        const parsed = anamneseListSchema.parse(req.query);
        const filters: AnamneseListFilters = {
            q: parsed.q,
            sort: parsed.sort,
            page: parsed.page,
            pageSize: parsed.pageSize,
        };

        const result = await anamneseService.list(req.user.id, filters);

        return res.json({
            items: result.items,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: result.totalPages,
        });
    } catch (err) {
        next(err);
    }
}