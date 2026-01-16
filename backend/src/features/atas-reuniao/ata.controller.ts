import type { Request, Response, NextFunction } from 'express';
import '../../types/express.d.js';
import { AppError } from '../../errors/AppError.js';
import { AIServiceError } from '../ai/ai.errors.js';
import { ataIdSchema, createAtaPayloadSchema, gerarResumoSchema, listAtaSchema, listTherapistSchema } from './ata.schema.js';
import * as AtaService from './ata.service.js';
import { parseAtaAnexos } from './utils/ata.anexos.js';

/**
 * POST /atas-reuniao/ai/summary
 * Gera resumo completo da ata
 */
export async function handleGerarResumo(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const parsed = gerarResumoSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(
                'VALIDATION_ERROR',
                parsed.error.issues.map(e => e.message).join(', '),
                400
            );
        }

        const summary = await AtaService.gerarResumoCompleto(parsed.data);

        return res.json({ summary });
    } catch (error) {
        if (error instanceof AIServiceError) {
            return handleAIError(error, res);
        }
        next(error);
    }
}

/**
 * POST /atas-reuniao/ai/whatsapp-summary
 * Gera resumo curto para WhatsApp
 */
export async function handleGerarResumoWhatsApp(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const parsed = gerarResumoSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(
                'VALIDATION_ERROR',
                parsed.error.issues.map(e => e.message).join(', '),
                400
            );
        }

        const summary = await AtaService.gerarResumoWhatsApp(parsed.data);

        return res.json({ summary });
    } catch (error) {
        if (error instanceof AIServiceError) {
            return handleAIError(error, res);
        }
        next(error);
    }
}

export async function therapistsList(req: Request, res: Response, next: NextFunction) {
    try {
        const { atividade } = listTherapistSchema.parse(req.query);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Não autenticado' });
        const data = await AtaService.therapistsList(userId, atividade);
        
        res.status(200).json(data);
    } catch(err) {
        next(err);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        }

        const parsed = listAtaSchema.parse(req.query);

        const result = await AtaService.list(req.user.id, {
            q: parsed.q,
            finalidade: parsed.finalidade,
            dataInicio: parsed.data_inicio,
            dataFim: parsed.data_fim,
            clienteId: parsed.cliente_id,
            orderBy: parsed.order_by,
            page: parsed.page,
            pageSize: parsed.page_size,
        });

        return res.json({
            items: result.items,
            total: result.total,
            page: result.page,
            page_size: result.pageSize,
            total_pages: result.totalPages,
        });
    } catch (err) {
        next(err);
    }
}

export async function therapistData(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(401).json({ message: 'Não autenticado' });
        const data = await AtaService.therapistData(userId);
        
        res.status(200).json(data);
    } catch(err) {
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        }

        // payload: string -> JSON -> Zod
        const raw = req.body?.payload;
        if (typeof raw !== 'string' || raw.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Campo payload é obrigatório' });
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw) as unknown;
        } catch {
            return res.status(400).json({ success: false, message: 'Payload inválido (JSON malformado)' })
        }

        const payload = createAtaPayloadSchema.parse(parsed);

        // files: multer
        const files = Array.isArray(req.files) ? req.files: [];

        // anexo names
        const anexos = parseAtaAnexos(files, req.body);

        // service
        const created = await AtaService.create({
            payload,
            anexos,
        });

        return res.status(201).json(created)
    } catch(err) {
        next(err);
    }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: ataId } = ataIdSchema.parse(req.params);
        const userId = req.user?.id;
        if (!userId) return res.status(404).json({ message: 'Não autenticado' });

        const result = await AtaService.getById(ataId);
        if (!result) return res.status(401).json({ message: 'Ata não identificada' });

        return res.status(200).json({ success: true, data: result});
    } catch (err) {
        next(err)
    }
}

// ============================================
// HELPERS
// ============================================

function handleAIError(error: AIServiceError, res: Response) {
    if (error.code === 'AI_EMPTY_RESPONSE') {
        return res.status(502).json({
            success: false,
            error: 'Não foi possível gerar o resumo. Tente novamente.',
        });
    }

    if (error.code === 'AI_CONFIG_ERROR') {
        return res.status(500).json({
            success: false,
            error: 'Serviço de IA indisponível.',
        });
    }

    return res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação de IA.',
    });
}
