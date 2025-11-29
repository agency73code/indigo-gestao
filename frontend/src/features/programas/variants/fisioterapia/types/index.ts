/**
 * Tipos específicos para Fisioterapia
 */

import type { SessionListItem } from '../../../detalhe-ocp/types';

/**
 * Resumo de desempenho por atividade (objetivo específico) em uma sessão
 */
export type FisioActivitySummary = {
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
 * SessionListItem estendido para Fisio com dados de atividades
 */
export type FisioSessionListItem = SessionListItem & {
    activitiesSummary?: FisioActivitySummary[];
};
