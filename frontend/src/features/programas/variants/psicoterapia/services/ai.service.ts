/**
 * Serviço para integração com API de IA para Prontuário Psicológico
 * @module features/programas/variants/psicoterapia/services
 */

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

/**
 * Chama a API do backend para gerar um resumo das evoluções com IA
 */
export async function generateProntuarioSummaryWithAI(
    params: GenerateProntuarioSummaryParams
): Promise<GenerateProntuarioSummaryResponse> {
    const response = await fetch('/api/ai/generate-prontuario-summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar resumo com IA');
    }

    return data;
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
