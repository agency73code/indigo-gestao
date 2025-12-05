/**
 * Mock de dados de gráfico para desenvolvimento
 * Simula dados de evolução de objetivos ao longo do tempo
 * Formato: Desempenhou / Desempenhou com Ajuda / Não Desempenhou
 */

import type { SerieLinha } from '@/features/programas/relatorio-geral/types';

// Mock de dados de gráfico para o programa geral
export const mockMusiProgramChartData: SerieLinha[] = [
    { x: '01/11', acerto: 3, independencia: 6 },
    { x: '05/11', acerto: 4, independencia: 5 },
    { x: '08/11', acerto: 5, independencia: 5 },
    { x: '12/11', acerto: 6, independencia: 4 },
    { x: '15/11', acerto: 7, independencia: 4 },
    { x: '19/11', acerto: 8, independencia: 3 },
    { x: '22/11', acerto: 9, independencia: 3 },
    { x: '26/11', acerto: 10, independencia: 2 },
    { x: '29/11', acerto: 11, independencia: 2 },
    { x: '02/12', acerto: 12, independencia: 1 },
    { x: '05/12', acerto: 13, independencia: 1 },
    { x: '08/12', acerto: 14, independencia: 1 },
];

// Mock de dados de gráfico para objetivo específico 1
export const mockMusiStimulus1ChartData: SerieLinha[] = [
    { x: '01/11', acerto: 1, independencia: 3 },
    { x: '05/11', acerto: 2, independencia: 3 },
    { x: '08/11', acerto: 2, independencia: 3 },
    { x: '12/11', acerto: 3, independencia: 2 },
    { x: '15/11', acerto: 4, independencia: 2 },
    { x: '19/11', acerto: 5, independencia: 2 },
    { x: '22/11', acerto: 6, independencia: 1 },
    { x: '26/11', acerto: 7, independencia: 1 },
    { x: '29/11', acerto: 8, independencia: 1 },
    { x: '02/12', acerto: 9, independencia: 0 },
    { x: '05/12', acerto: 10, independencia: 0 },
    { x: '08/12', acerto: 11, independencia: 0 },
];

// Mock de dados de gráfico para objetivo específico 2
export const mockMusiStimulus2ChartData: SerieLinha[] = [
    { x: '01/11', acerto: 2, independencia: 3 },
    { x: '05/11', acerto: 3, independencia: 3 },
    { x: '08/11', acerto: 4, independencia: 2 },
    { x: '12/11', acerto: 4, independencia: 2 },
    { x: '15/11', acerto: 5, independencia: 2 },
    { x: '19/11', acerto: 6, independencia: 2 },
    { x: '22/11', acerto: 7, independencia: 1 },
    { x: '26/11', acerto: 8, independencia: 1 },
    { x: '29/11', acerto: 9, independencia: 1 },
    { x: '02/12', acerto: 10, independencia: 0 },
    { x: '05/12', acerto: 11, independencia: 0 },
    { x: '08/12', acerto: 12, independencia: 0 },
];

// Mock de dados de gráfico para objetivo específico 3
export const mockMusiStimulus3ChartData: SerieLinha[] = [
    { x: '01/11', acerto: 1, independencia: 3 },
    { x: '05/11', acerto: 2, independencia: 3 },
    { x: '08/11', acerto: 3, independencia: 3 },
    { x: '12/11', acerto: 4, independencia: 2 },
    { x: '15/11', acerto: 5, independencia: 2 },
    { x: '19/11', acerto: 6, independencia: 2 },
    { x: '22/11', acerto: 7, independencia: 2 },
    { x: '26/11', acerto: 7, independencia: 2 },
    { x: '29/11', acerto: 8, independencia: 2 },
    { x: '02/12', acerto: 9, independencia: 1 },
    { x: '05/12', acerto: 10, independencia: 1 },
    { x: '08/12', acerto: 11, independencia: 1 },
];

// Mock de dados de gráfico para objetivo específico 4
export const mockMusiStimulus4ChartData: SerieLinha[] = [
    { x: '01/11', acerto: 2, independencia: 3 },
    { x: '05/11', acerto: 3, independencia: 2 },
    { x: '08/11', acerto: 4, independencia: 2 },
    { x: '12/11', acerto: 5, independencia: 2 },
    { x: '15/11', acerto: 6, independencia: 2 },
    { x: '19/11', acerto: 7, independencia: 1 },
    { x: '22/11', acerto: 8, independencia: 1 },
    { x: '26/11', acerto: 9, independencia: 1 },
    { x: '29/11', acerto: 10, independencia: 1 },
    { x: '02/12', acerto: 11, independencia: 0 },
    { x: '05/12', acerto: 12, independencia: 0 },
    { x: '08/12', acerto: 13, independencia: 0 },
];

// Mapa de dados por stimulus ID
export const mockMusiStimulusChartDataMap: Record<string, SerieLinha[]> = {
    'stim-1': mockMusiStimulus1ChartData,
    'stim-2': mockMusiStimulus2ChartData,
    'stim-3': mockMusiStimulus3ChartData,
    'stim-4': mockMusiStimulus4ChartData,
};
