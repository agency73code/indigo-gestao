import type { Request, Response, NextFunction } from 'express';
import * as TherapistService from '../features/therapist/therapist.service.js';
import * as TherapistNormalizer from '../features/therapist/therapist.normalizer.js';
import { sendWelcomeEmail } from '../utils/mail.util.js';
import { therapistSchema } from '../schemas/therapist.schema.js';
import { fetchBrazilianBanks } from '../utils/brazilApi.util.js';

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

        res.status(201).json({
            success: true,
            message: 'Terapeuta cadastrado com sucesso!',
            id: therapist.id,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTherapistReport(req: Request, res: Response, next: NextFunction) {
    try {
        const therapistId = req.user?.id;
        const data = await TherapistService.getTherapistReport(therapistId!);
        res.json({ data });
    } catch (err) {
        next(err);
    }
}

export async function listBanks(req: Request, res: Response, next: NextFunction) {
    try {
        const banks = await fetchBrazilianBanks();
        res.json({ data: banks });
    } catch (error) {
        next(error);
    }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const { therapistId } = req.params;
        if (!therapistId)
            return res
                .status(400)
                .json({ success: false, message: 'ID do terapeuta é obrigatório!' });

        const therapist = await TherapistService.getById(therapistId);
        if (!therapist)
            return res.status(400).json({ success: false, message: 'Terapeuta não encontrado!' });

        const normalized = TherapistNormalizer.normalizeTherapistForm(therapist);

        res.json(normalized);
    } catch (error) {
        next(error);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const { therapistId } = req.params;
        if (!therapistId) {
            return res
                .status(400)
                .json({ success: false, message: 'ID do terapeuta é obrigatório!' });
        }

        const parsed = therapistSchema.parse(TherapistNormalizer.emptyStringsToNull(req.body));
        if (Object.keys(parsed).length === 0) {
            return res
                .status(400)
                .json({ success: false, message: 'Nenhum dado fornecido para atualização' });
        }

        if (Array.isArray(parsed.formacao)) {
            parsed.formacao = parsed.formacao[0];
        }

        const updated = await TherapistService.update(therapistId, parsed);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Terapeuta não encontrado' });
        }

        const normalized = TherapistNormalizer.normalizeTherapistForm(updated);

        return res.json({
            success: true,
            message: 'Terapeuta atualizado com sucesso!',
            data: normalized,
        });
    } catch (error) {
        next(error);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const therapistId = req.user?.id;
        if (!therapistId) {
            return res
                .status(400)
                .json({ success: false, message: 'ID do terapeuta é obrigatório!' });
        }

        // Cria um objeto de filtros sem undefined
        const filters: TherapistListFilters = {};

        if (typeof req.query.q === 'string') filters.q = req.query.q;
        if (typeof req.query.sort === 'string') filters.sort = req.query.sort;
        if (typeof req.query.page === 'string') filters.page = Number(req.query.page);
        if (typeof req.query.pageSize === 'string') filters.pageSize = Number(req.query.pageSize);

        const result = await TherapistService.list(therapistId, filters);
        const items = result.items.map(TherapistNormalizer.normalizeTherapistSession);

        if (!filters.page && !filters.pageSize) {
            return res.json(items);
        }

        res.json({
            items,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: result.totalPages,
        });
    } catch (error) {
        next(error);
    }
}

export interface TherapistListFilters {
    q?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
}
