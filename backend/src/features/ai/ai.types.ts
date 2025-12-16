/**
 * Tipos para a feature de IA
 * @module features/ai
 */

export interface SessionObservation {
    data: string;
    programa?: string;
    terapeutaNome?: string;
    observacoes: string;
}

export interface GenerateSummaryRequest {
    observations: SessionObservation[];
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

export interface AIErrorResponse {
    success: false;
    error: string;
}
