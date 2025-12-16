/**
 * Controller para endpoints de IA
 * Responsável por receber requests, validar e retornar responses
 * @module features/ai
 */

import type { Request, Response } from 'express';
import { generateClinicalSummary } from './ai.service.js';
import type { GenerateSummaryRequest } from './ai.types.js';

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

        // Log para auditoria (MVP - depois pode ir para banco)
        console.log(`[AI] Gerando resumo clínico - Paciente: ${patientName}, Área: ${area}, Observações: ${observations.length}`);

        // Chama o serviço
        const result = await generateClinicalSummary({
            observations,
            patientName,
            area: area || 'Não especificada',
            periodLabel: periodLabel || 'Período não especificado',
        });

        console.log(`[AI] Resumo gerado com sucesso para ${patientName}`);

        return res.json(result);
    } catch (error) {
        console.error('[AI] Erro ao gerar resumo:', error);

        // Verifica se é erro da API OpenAI
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return res.status(500).json({
                    success: false,
                    error: 'Erro de configuração do serviço de IA. Contate o suporte.',
                });
            }
            if (error.message.includes('rate limit')) {
                return res.status(429).json({
                    success: false,
                    error: 'Limite de requisições atingido. Tente novamente em alguns minutos.',
                });
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Erro ao processar solicitação de IA. Tente novamente.',
        });
    }
}
