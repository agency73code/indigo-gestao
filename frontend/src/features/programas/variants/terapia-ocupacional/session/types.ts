// Tipos específicos para Sessão de Terapia Ocupacional
// Terminologia TO: Desempenhou | Desempenhou com Ajuda | Não Desempenhou

export type ToPerformanceType = 'nao-desempenhou' | 'desempenhou-com-ajuda' | 'desempenhou';

export type ToSessionAttempt = {
    id: string;
    attemptNumber: number;
    activityId: string; // Em TO usamos "atividade" ao invés de "estímulo"
    activityLabel: string;
    type: ToPerformanceType;
    timestamp: string;
};

export type ToSessionSummary = {
    desempenhou: number;             // Quantidade de tentativas onde desempenhou
    desempenhouComAjuda: number;     // Quantidade de tentativas onde desempenhou com ajuda
    naoDesempenhou: number;          // Quantidade de tentativas onde não desempenhou
    totalAttempts: number;           // total de tentativas da sessão
};

export type ToSessionState = {
    patientId: string | null;
    programId: string | null;
    attempts: ToSessionAttempt[];
    summary: ToSessionSummary;
    notes?: string; // Observações da sessão
};

// Tipo para resultado predominante (usado no status)
export type ToPredominantResult = 'verde' | 'laranja' | 'vermelho';

// Reutilizando tipos existentes do sistema
export type { Patient } from '@/features/programas/consultar-programas/types';
export type { ProgramListItem } from '@/features/programas/consultar-programas/types';

// Tipo específico para Programa TO (com estrutura de atividades)
export type ToProgramDetail = {
    id: string;
    name: string | null | undefined;
    patientId: string;
    patientName: string;
    therapistId: string;
    therapistName: string;
    goalTitle: string;
    goalDescription?: string | null;
    shortTermGoalDescription?: string | null;
    activitiesApplicationDescription?: string | null; // Descrição da aplicação das atividades
    status: string;
    criteria?: string | null; // Critério de maestria
    currentPerformanceLevel?: string | null; // Nível atual de desempenho
    prazoInicio?: string;
    prazoFim?: string;
    activities: ToActivity[]; // Atividades ao invés de estímulos
};

// Atividade (Objetivo Específico) em TO
export type ToActivity = {
    id: string;
    label: string; // Componente de desempenho/tarefa
    description: string; // Descrição do objetivo específico
    active: boolean;
    order: number;
};
