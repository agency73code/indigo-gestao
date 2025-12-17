/**
 * Serviço de integração com OpenAI
 * Lógica de negócio isolada do controller
 * @module features/ai
 */

import OpenAI from 'openai';
import type { SessionObservation, GenerateSummaryResponse } from './ai.types.js';
import {
    CLINICAL_SUMMARY_SYSTEM_PROMPT,
    buildUserPrompt,
    formatObservationsForPrompt,
    AI_DISCLAIMER,
} from './ai.prompts.js';
import { AIServiceError } from './ai.errors.js';

// Inicializa cliente OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateClinicalSummary(params: {
    observations: SessionObservation[];
    patientName: string;
    area: string;
    periodLabel: string;
}): Promise<GenerateSummaryResponse> {
    if (!process.env.OPENAI_API_KEY) {
        throw new AIServiceError(
            'AI_CONFIG_ERROR',
            'OPENAI_API_KEY não configurada'
        );
    }

    const { observations, patientName, area, periodLabel } = params;

    /**
     * 🔒 LIMITE DE TAMANHO
     *
     * - validar tamanho total das observações
     * - medir caracteres ou tokens aproximados
     * - decidir estratégia:
     *   - falhar com erro controlado
     *   - ou iniciar chunking / resumo em camadas
     *
     * Motivo:
     * proteger custo, tempo de resposta e limite de contexto do modelo.
     */
    // ex: validateInputSize(observations);

    // Formata observações para o prompt
    const observationsText = formatObservationsForPrompt(observations);

    /**
     * 🧩 CHUNKING / RESUMO EM CAMADAS
     *
     * Se observationsText ultrapassar o limite aceitável:
     * - dividir por período / sessão
     * - gerar resumos parciais
     * - consolidar em um resumo final
     *
     */
    // ex: const observationsText = buildChunkedSummary(observations);

    // Monta o prompt do usuário
    const userPrompt = buildUserPrompt({
        patientName,
        area,
        periodLabel,
        observationsCount: observations.length,
        observationsText,
    });

    /**
     * ⏱️ TIMEOUT
     *
     * A chamada à OpenAI deve ter timeout explícito para evitar:
     * - requisições penduradas
     * - workers bloqueados
     * - degradação do backend
     *
     * Idealmente usando AbortController ou config do client.
     */
    // ex: const controller = new AbortController();

    /**
     * 🔁 RETRY CONTROLADO
     *
     * Em caso de erro transitório (timeout, 5xx):
     * - tentar novamente 1 vez
     * - nunca retry cego
     * - nunca retry em erro de input
     *
     * Motivo:
     * evitar duplicação de custo e loops silenciosos.
     */
    // ex: await retryOnce(() => openai.chat.completions.create(...));

    // Chama a API da OpenAI
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: CLINICAL_SUMMARY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.3, // Baixa temperatura para respostas mais consistentes e factuais
        // signal: controller.signal, // usado com AbortController
    });

    const summary = completion.choices[0]?.message?.content || '';

    if (summary.trim().length === 0) {
        throw new AIServiceError(
            'AI_EMPTY_RESPONSE',
            'Resposta vazia do modelo'
        );
    }

    return {
        success: true,
        summary,
        disclaimer: AI_DISCLAIMER,
        observationsUsed: observations.length,
    };
}
