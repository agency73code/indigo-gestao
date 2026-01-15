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

// Tipos para Prontuário Psicológico
export interface ProntuarioEvolution {
    numeroSessao: number;
    data: string;
    descricaoSessao: string;
}

export interface GenerateProntuarioSummaryRequest {
    evolutions: ProntuarioEvolution[];
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

export interface AIErrorResponse {
    success: false;
    error: string;
}
