/**
 * Tipos específicos para Sessão de Musicoterapia
 * Baseado na estrutura de Terapia Ocupacional
 */

export type MusiPerformanceType = 'nao-desempenhou' | 'desempenhou-com-ajuda' | 'desempenhou';

export type MusiSessionAttempt = {
    id: string;
    attemptNumber: number;
    activityId: string;
    activityLabel: string;
    type: MusiPerformanceType;
    timestamp: string;
    durationMinutes?: number;
    participacao?: number; // 0-5: 0=Não participa, 5=Supera expectativas
    suporte?: number; // 1-5: 1=Sem suporte, 5=Máximo físico
};

export type MusiSessionSummary = {
    desempenhou: number;
    desempenhouComAjuda: number;
    naoDesempenhou: number;
    totalAttempts: number;
    avgParticipacao: number | null; // Média de participação (0-5)
    avgSuporte: number | null; // Média de suporte (1-5)
};

export type SessionFile = {
    id: string;
    file: File;
    name: string;
    preview?: string;
};

export type MusiSessionState = {
    patientId: string | null;
    programId: string | null;
    attempts: MusiSessionAttempt[];
    summary: MusiSessionSummary;
    notes?: string;
    files?: SessionFile[];
};

export type MusiPredominantResult = 'verde' | 'laranja' | 'vermelho';

export type { Patient } from '@/features/programas/consultar-programas/types';
export type { ProgramListItem } from '@/features/programas/consultar-programas/types';

export type MusiProgramDetail = {
    id: string;
    name: string | null | undefined;
    patientId: string;
    patientName: string;
    therapistId: string;
    therapistName: string;
    goalTitle: string;
    goalDescription?: string | null;
    shortTermGoalDescription?: string | null;
    activitiesApplicationDescription?: string | null;
    currentPerformanceLevel?: string | null;
    status: string;
    criteria?: string | null;
    prazoInicio?: string;
    prazoFim?: string;
    activities: MusiActivity[];
};

export type MusiActivity = {
    id: string;
    label: string;
    description: string;
    metodos?: string;
    tecnicasProcedimentos?: string;
    active: boolean;
    order: number;
};
