/**
 * Controller para endpoints de IA
 * Responsável por receber requests, validar e retornar responses
 * @module features/ai
 */

import type { Request, Response } from 'express';
import { generateClinicalSummary, generateProntuarioSummary } from './ai.service.js';
import type { GenerateSummaryRequest, GenerateProntuarioSummaryRequest } from './ai.types.js';
import { AIServiceError } from './ai.errors.js';

export async function handleGenerateSummary(req: Request, res: Response) {
    try {
        const { observations, patientName, area, periodLabel } =
            req.body as GenerateSummaryRequest;

        // Validação básica
        if (!observations || !Array.isArray(observations) || observations.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nenhuma observação fornecida. É necessário ter observações de sessão para gerar o resumo.',
            });
        }

        if (!patientName) {
            return res.status(400).json({
                success: false,
                error: 'Nome do paciente é obrigatório.',
            });
        }

        // Chama o serviço
        const result = await generateClinicalSummary({
            observations,
            patientName,
            area: area || 'Não especificada',
            periodLabel: periodLabel || 'Período não especificado',
        });

        return res.json(result);
    } catch (error) {
        if (error instanceof AIServiceError) {
            if (error.code === 'AI_EMPTY_RESPONSE') {
                return res.status(502).json({
                    success: false,
                    error: 'Não foi possível gerar o resumo automaticamente. Tente novamente.',
                });
            }

            if (error.code === 'AI_CONFIG_ERROR') {
                return res.status(500).json({
                    success: false,
                    error: 'Serviço de IA indisponível. Contate o suporte.',
                });
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Erro ao processar solicitação de IA.',
        });
    }
}

/**
 * Handler para gerar resumo de evoluções de prontuário psicológico
 */
export async function handleGenerateProntuarioSummary(req: Request, res: Response) {
    try {
        const { evolutions, patientName, therapistName, periodLabel } =
            req.body as GenerateProntuarioSummaryRequest;

        // Validação básica
        if (!evolutions || !Array.isArray(evolutions) || evolutions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nenhuma evolução fornecida. É necessário ter evoluções registradas para gerar o resumo.',
            });
        }

        if (!patientName) {
            return res.status(400).json({
                success: false,
                error: 'Nome do paciente é obrigatório.',
            });
        }

        if (!therapistName) {
            return res.status(400).json({
                success: false,
                error: 'Nome do terapeuta é obrigatório.',
            });
        }

        // Chama o serviço
        const result = await generateProntuarioSummary({
            evolutions,
            patientName,
            therapistName,
            periodLabel: periodLabel || 'Período não especificado',
        });

        return res.json(result);
    } catch (error) {
        if (error instanceof AIServiceError) {
            if (error.code === 'AI_EMPTY_RESPONSE') {
                return res.status(502).json({
                    success: false,
                    error: 'Não foi possível gerar o resumo automaticamente. Tente novamente.',
                });
            }

            if (error.code === 'AI_CONFIG_ERROR') {
                return res.status(500).json({
                    success: false,
                    error: 'Serviço de IA indisponível. Contate o suporte.',
                });
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Erro ao processar solicitação de IA.',
        });
    }
}
