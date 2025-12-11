/**
 * Mock de dados de gráficos para Musicoterapia
 * 
 * Os dados correspondem às sessões mockadas:
 * - 15/11: 60% acerto, 35% independência (session-musi-005)
 * - 18/11: 65% acerto, 42% independência (session-musi-004)
 * - 22/11: 70% acerto, 48% independência (session-musi-003)
 * - 25/11: 75% acerto, 60% independência (session-musi-002)
 * - 28/11: 85% acerto, 70% independência (session-musi-001)
 */

import type { SerieLinha } from '../../../relatorio-geral/types';

/**
 * Gera dados mock de evolução geral para gráfico de linha
 * Reflete a progressão real das sessões do programa
 */
export function getMockMusiChartData(): SerieLinha[] {
    return [
        { x: '15/11', acerto: 60, independencia: 35 },
        { x: '18/11', acerto: 65, independencia: 42 },
        { x: '22/11', acerto: 70, independencia: 48 },
        { x: '25/11', acerto: 75, independencia: 60 },
        { x: '28/11', acerto: 85, independencia: 70 },
    ];
}

/**
 * Gera dados mock por estímulo/atividade específica
 * Cada atividade tem sua própria curva de evolução
 */
export function getMockMusiStimulusChart(stimulusId: string): SerieLinha[] {
    // Dados diferenciados por tipo de atividade
    const chartsData: Record<string, SerieLinha[]> = {
        'stim-1': [ // Compreender conceitos espaciais - Boa evolução
            { x: '15/11', acerto: 65, independencia: 40 },
            { x: '18/11', acerto: 70, independencia: 50 },
            { x: '22/11', acerto: 78, independencia: 60 },
            { x: '25/11', acerto: 82, independencia: 70 },
            { x: '28/11', acerto: 90, independencia: 80 },
        ],
        'stim-2': [ // Desenvolver coordenação motora - Evolução moderada
            { x: '15/11', acerto: 55, independencia: 30 },
            { x: '18/11', acerto: 60, independencia: 42 },
            { x: '22/11', acerto: 65, independencia: 50 },
            { x: '25/11', acerto: 72, independencia: 58 },
            { x: '28/11', acerto: 78, independencia: 70 },
        ],
        'stim-3': [ // Estimular comunicação verbal - Progresso gradual
            { x: '15/11', acerto: 50, independencia: 35 },
            { x: '18/11', acerto: 58, independencia: 40 },
            { x: '22/11', acerto: 65, independencia: 48 },
            { x: '25/11', acerto: 72, independencia: 60 },
            { x: '28/11', acerto: 75, independencia: 60 },
        ],
        'stim-4': [ // Promover regulação emocional - Início recente
            { x: '15/11', acerto: 45, independencia: 20 },
            { x: '18/11', acerto: 52, independencia: 28 },
            { x: '22/11', acerto: 58, independencia: 45 },
            { x: '25/11', acerto: 65, independencia: 52 },
            { x: '28/11', acerto: 70, independencia: 58 },
        ],
    };
    
    return chartsData[stimulusId] || getMockMusiChartData();
}
