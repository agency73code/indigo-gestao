/**
 * Serviço mock para gráficos de evolução de TO
 */

import type { SerieLinha } from '../../../relatorio-geral/types';

export async function fetchToStimulusChart(
    programId: string,
    stimulusId: string,
): Promise<SerieLinha[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('📊 Retornando gráfico MOCK de TO para:', programId, stimulusId);
    
    // Retornar dados mock no formato SerieLinha[]
    // Para TO mapeamos:
    // - acerto -> % de "Desempenhou"
    // - independencia -> % de "Desempenhou com Ajuda"
    // - (100 - acerto) -> % de "Não Desempenhou" (calculado no componente)
    const mockData: SerieLinha[] = [
        { x: '01/11', acerto: 60, independencia: 30 },  // 60% desempenhou, 30% com ajuda, 10% não desempenhou
        { x: '05/11', acerto: 70, independencia: 20 },  // 70% desempenhou, 20% com ajuda, 10% não desempenhou  
        { x: '10/11', acerto: 75, independencia: 15 },  // 75% desempenhou, 15% com ajuda, 10% não desempenhou
        { x: '15/11', acerto: 80, independencia: 12 },  // 80% desempenhou, 12% com ajuda, 8% não desempenhou
        { x: '20/11', acerto: 85, independencia: 10 },  // 85% desempenhou, 10% com ajuda, 5% não desempenhou
    ];
    
    return mockData;
}
