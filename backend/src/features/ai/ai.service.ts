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
    const { observations, patientName, area, periodLabel } = params;

    // Formata observações para o prompt
    const observationsText = formatObservationsForPrompt(observations);

    // Monta o prompt do usuário
    const userPrompt = buildUserPrompt({
        patientName,
        area,
        periodLabel,
        observationsCount: observations.length,
        observationsText,
    });

    // Chama a API da OpenAI
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: CLINICAL_SUMMARY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.3, // Baixa temperatura para respostas mais consistentes e factuais
    });

    const summary = completion.choices[0]?.message?.content || '';

    return {
        success: true,
        summary,
        disclaimer: AI_DISCLAIMER,
        observationsUsed: observations.length,
    };
}
