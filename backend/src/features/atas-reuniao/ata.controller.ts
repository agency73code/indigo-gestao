/**
 * Controller para Atas de Reunião
 * @module features/atas-reuniao
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError.js';
import { AIServiceError } from '../ai/ai.errors.js';
import { gerarResumoSchema } from './ata.schema.js';
import * as AtaService from './ata.service.js';

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
