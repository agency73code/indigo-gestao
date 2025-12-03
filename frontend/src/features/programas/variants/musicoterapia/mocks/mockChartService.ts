/**
 * Mock de dados de gráficos para Musicoterapia
 */

import type { SerieLinha } from '../../../relatorio-geral/types';

/**
 * Gera dados mock de evolução geral para gráfico de linha
 */
export function getMockMusiChartData(): SerieLinha[] {
    return [
        { x: '15/11', acerto: 60, independencia: 35 },
        { x: '18/11', acerto: 65, independencia: 40 },
        { x: '22/11', acerto: 70, independencia: 45 },
        { x: '25/11', acerto: 75, independencia: 50 },
        { x: '28/11', acerto: 85, independencia: 60 },
    ];
}

/**
 * Gera dados mock por estímulo específico
 */
export function getMockMusiStimulusChart(stimulusId: string): SerieLinha[] {
    // Simula dados diferentes por estímulo
    const baseData = getMockMusiChartData();
    const modifier = stimulusId.charCodeAt(stimulusId.length - 1) % 10;
    
    return baseData.map(point => ({
        ...point,
        acerto: Math.min(100, point.acerto + modifier),
        independencia: Math.min(100, point.independencia + modifier),
    }));
}
