export type SessionAttemptType = 'error' | 'prompted' | 'independent';

export type SessionAttempt = {
    id: string;
    attemptNumber: number;
    stimulusId: string;
    stimulusLabel: string;
    type: SessionAttemptType;
    timestamp: string;
};

export type SessionSummary = {
    overallAccuracy: number;      // % de acertos (independent)
    independenceRate: number;     // % de independência (independent)
    totalAttempts: number;        // total de tentativas da sessão
};

export type SessionState = {
    patientId: string | null;
    programId: string | null;
    attempts: SessionAttempt[];
    summary: SessionSummary;
    notes?: string; // Observações da sessão
};

// Reutilizando tipos existentes
export type { Patient } from '@/features/programas/consultar-programas/types';
export type { ProgramDetail } from '@/features/programas/detalhe-ocp/types';
export type { ProgramListItem } from '@/features/programas/consultar-programas/types';