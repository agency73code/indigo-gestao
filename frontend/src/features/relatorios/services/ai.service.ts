/**
 * Serviço para integração com API de IA
 * @module features/relatorios/services
 */

export interface GenerateSummaryParams {
    observations: Array<{
        data: string;
        programa?: string;
        terapeutaNome?: string;
        observacoes: string;
    }>;
    patientName: string;
    area: string;
    periodLabel: string;
}

export interface GenerateSummaryResponse {
    success: boolean;
    summary: string;
    disclaimer: string;
    observationsUsed: number;
}

/**
 * Chama a API do backend para gerar um resumo clínico com IA
 */
export async function generateClinicalSummaryWithAI(
    params: GenerateSummaryParams
): Promise<GenerateSummaryResponse> {
    const response = await fetch('/api/ai/generate-summary', {
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
