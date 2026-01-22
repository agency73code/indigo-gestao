/**
 * Serviço para integração com API de IA para Prontuário Psicológico
 * @module features/programas/variants/psicoterapia/services
 */

import { authFetch } from '@/lib/http';
import { psicoterapiaServiceConfig } from './psicoterapia.config';

export interface ProntuarioEvolutionForAI {
    numeroSessao: number;
    data: string;
    descricaoSessao: string;
}

export interface GenerateProntuarioSummaryParams {
    evolutions: ProntuarioEvolutionForAI[];
    patientName: string;
    therapistName: string;
    periodLabel: string;
}

export interface GenerateProntuarioSummaryResponse {
    success: boolean;
    summary: string;
    disclaimer: string;
    sessionsUsed: number;
}

// ============================================
// MOCK PARA IA
// ============================================

function generateMockSummary(params: GenerateProntuarioSummaryParams): GenerateProntuarioSummaryResponse {
    const { evolutions, patientName, periodLabel } = params;
    
    return {
        success: true,
        summary: `## Resumo do Acompanhamento Psicológico\n\n` +
            `**Paciente:** ${patientName}\n` +
            `**Período:** ${periodLabel}\n` +
            `**Total de Sessões:** ${evolutions.length}\n\n` +
            `### Evolução Observada\n\n` +
            `O paciente demonstrou progresso significativo ao longo das sessões, ` +
            `com melhora na capacidade de expressão emocional e desenvolvimento de ` +
            `estratégias de enfrentamento mais adaptativas.\n\n` +
            `### Principais Temas Trabalhados\n\n` +
            `- Autoconhecimento e regulação emocional\n` +
            `- Relacionamentos interpessoais\n` +
            `- Manejo de ansiedade\n\n` +
            `### Recomendações\n\n` +
            `Manutenção do acompanhamento com frequência semanal.`,
        disclaimer: 'Este é um resumo gerado por MOCK para desenvolvimento. ' +
            'Em produção, será gerado pela API de IA.',
        sessionsUsed: evolutions.length,
    };
}

// ============================================
// API REAL
// ============================================

/**
 * Chama a API do backend para gerar um resumo das evoluções com IA
 */
export async function generateProntuarioSummaryWithAI(
    params: GenerateProntuarioSummaryParams
): Promise<GenerateProntuarioSummaryResponse> {
    const { apiBase, useMockIA } = psicoterapiaServiceConfig;
    
    // Se mock IA estiver ativo, retorna mock
    if (useMockIA) {
        // Simula delay de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        return generateMockSummary(params);
    }
    
    const response = await authFetch(`${apiBase}/ai/generate-prontuario-summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao gerar resumo com IA');
    }

    return response.json();
}

/**
 * Formata a data para exibição
 */
export function formatDateForSummary(date: string): string {
    try {
        return new Date(date).toLocaleDateString('pt-BR');
    } catch {
        return date;
    }
}

/**
 * Calcula o período das evoluções
 */
export function calculatePeriodLabel(evolutions: ProntuarioEvolutionForAI[]): string {
    if (evolutions.length === 0) return 'Sem evoluções';
    if (evolutions.length === 1) {
        return formatDateForSummary(evolutions[0].data);
    }
    
    const sorted = [...evolutions].sort((a, b) => 
        new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    
    const primeira = formatDateForSummary(sorted[0].data);
    const ultima = formatDateForSummary(sorted[sorted.length - 1].data);
    
    return `${primeira} a ${ultima}`;
}
