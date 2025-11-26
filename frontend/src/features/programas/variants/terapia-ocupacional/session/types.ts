/**
 * Tipos específicos para Sessão de Terapia Ocupacional
 * 
 * 🔧 CONVENÇÃO DE NOMENCLATURA:
 * - ToPerformanceType (kebab-case): Usado em API e identificadores React
 * - ToSessionSummary (camelCase): Usado em estado JavaScript e contadores
 * 
 * A conversão entre formatos é feita automaticamente pelos helpers em constants.ts
 * Terminologia TO: Desempenhou | Desempenhou com Ajuda | Não Desempenhou
 */

export type ToPerformanceType = 'nao-desempenhou' | 'desempenhou-com-ajuda' | 'desempenhou';

export type ToSessionAttempt = {
    id: string;
    attemptNumber: number;
    activityId: string; // Em TO usamos "atividade" ao invés de "estímulo"
    activityLabel: string;
    type: ToPerformanceType; // kebab-case para compatibilidade com HTML/CSS
    timestamp: string;
    durationMinutes?: number;
};

/**
 * Sumário de sessão usando camelCase (convenção JavaScript)
 * Os services convertem automaticamente de/para kebab-case da API
 */
export type ToSessionSummary = {
    desempenhou: number;             // Convertido de 'desempenhou' (API)
    desempenhouComAjuda: number;     // Convertido de 'desempenhou-com-ajuda' (API)
    naoDesempenhou: number;          // Convertido de 'nao-desempenhou' (API)
    totalAttempts: number;           // total de tentativas da sessão
};

export type SessionFile = {
    id: string;
    file: File;
    name: string;
    preview?: string;
};

export type ToSessionState = {
    patientId: string | null;
    programId: string | null;
    attempts: ToSessionAttempt[];
    summary: ToSessionSummary;
    notes?: string; // Observações da sessão
    files?: SessionFile[]; // Arquivos anexados à sessão
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
