/**
 * Tipos específicos para Terapia Ocupacional
 */

import type { SessionListItem } from '../../../detalhe-ocp/types';

/**
 * Resumo de desempenho por atividade (objetivo específico) em uma sessão
 */
export type ToActivitySummary = {
    activityId: string;
    activityName: string;
    counts: {
        naoDesempenhou: number;      // erro
        desempenhouComAjuda: number; // ajuda/prompted
        desempenhou: number;         // independente
    };
    total: number;
    // Status predominante é calculado no componente, não precisa vir do backend
};

/**
 * SessionListItem estendido para TO com dados de atividades
 */
export type ToSessionListItem = SessionListItem & {
    activitiesSummary?: ToActivitySummary[];
};
