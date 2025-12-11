/**
 * Serviço de relatórios para Musicoterapia
 * 
 * Usa a mesma estrutura de dados e cálculos de Terapia Ocupacional (TO)
 * pois ambas seguem o mesmo modelo de desempenho:
 * - Desempenhou (independente)
 * - Desempenhou com Ajuda
 * - Não Desempenhou
 * 
 * Componentes específicos de Musicoterapia:
 * - Participação (0-5): Nível de engajamento nas atividades
 * - Suporte (1-5): Nível de suporte necessário
 */

import type { Sessao } from '@/features/programas/consulta-sessao/types';
import type { SerieLinha } from '@/features/relatorios/gerar-relatorio/types';
import type { MusiParticipacaoData, MusiSuporteData, MusiKpisData, MusiEvolutionData, MusiAttentionActivityItem } from '../components/musi';
import type { ToAutonomyData } from '../components/to/ToAutonomyByCategoryChart';
import { 
    mockMusiParticipacaoDefault, 
    mockMusiSuporteDefault,
    mockMusiKpisDefault,
    mockMusiPerformanceLineDefault,
    mockMusiAttentionActivitiesDefault,
    mockMusiAutonomyByCategoryDefault,
    mockMusiEvolutionDefault,
} from '../mocks/musi-relatorio.mock';
import {
    prepareToPerformanceLineData,
    prepareToAutonomyByCategory,
} from './to-report.service';

// ==========================================
// CONFIGURAÇÃO DE MOCK
// ==========================================

/**
 * Flag para usar dados mockados
 * Quando true, retorna dados simulados em vez de processar sessões
 * 
 * ATENÇÃO: Alterar para false quando o backend estiver implementado
 */
const USE_MOCK_DATA = true;

// ==========================================
// FUNÇÕES COM SUPORTE A MOCK
// ==========================================

/**
 * Calcula KPIs para Musicoterapia
 * Inclui médias de participação e suporte em vez de tempo
 * Retorna mock quando USE_MOCK_DATA está ativo
 */
export function calculateMusiKpis(_sessoes: Sessao[]): MusiKpisData {
    if (USE_MOCK_DATA) {
        return mockMusiKpisDefault;
    }
    
    // TODO: Implementar cálculo real quando backend estiver pronto
    // Precisa calcular:
    // - desempenhou, desempenhouComAjuda, naoDesempenhou
    // - avgParticipacao (média de participação 0-5)
    // - avgSuporte (média de suporte 1-5)
    // - atividadesTotal, sessoesTotal
    return mockMusiKpisDefault;
}

/**
 * Prepara dados de evolução de desempenho (gráfico de linhas)
 * Retorna mock quando USE_MOCK_DATA está ativo
 */
export function prepareMusiPerformanceLineData(sessoes: Sessao[]): SerieLinha[] {
    if (USE_MOCK_DATA) {
        return mockMusiPerformanceLineDefault;
    }
    return prepareToPerformanceLineData(sessoes);
}

/**
 * Prepara dados de evolução de participação e suporte ao longo do tempo
 * Retorna mock quando USE_MOCK_DATA está ativo
 * 
 * Este gráfico mostra como a participação e o suporte evoluíram nas sessões.
 * Ideal: participação subindo (mais engajamento) e suporte descendo (mais independência)
 */
export function prepareMusiEvolutionData(_sessoes: Sessao[]): MusiEvolutionData[] {
    if (USE_MOCK_DATA) {
        return mockMusiEvolutionDefault;
    }
    
    // TODO: Implementar cálculo real quando backend estiver pronto
    // Agrupar por data e calcular médias de participação e suporte
    return mockMusiEvolutionDefault;
}

/**
 * Prepara dados de atividades que precisam de atenção
 * Inclui participação e suporte específicos de Musicoterapia
 * Retorna mock quando USE_MOCK_DATA está ativo
 */
export function prepareMusiAttentionActivities(_sessoes: Sessao[]): MusiAttentionActivityItem[] {
    if (USE_MOCK_DATA) {
        return mockMusiAttentionActivitiesDefault;
    }
    
    // TODO: Implementar cálculo real quando backend estiver pronto
    // Precisa agregar por atividade e calcular médias de participação/suporte
    return mockMusiAttentionActivitiesDefault;
}

/**
 * Prepara dados de autonomia por categoria
 * Retorna mock quando USE_MOCK_DATA está ativo
 */
export function prepareMusiAutonomyByCategory(sessoes: Sessao[]): ToAutonomyData[] {
    if (USE_MOCK_DATA) {
        return mockMusiAutonomyByCategoryDefault;
    }
    return prepareToAutonomyByCategory(sessoes);
}

/**
 * Calcula a média de participação a partir das sessões de Musicoterapia
 * 
 * Escala de Participação (0-5):
 * 0 - Não participa
 * 1 - Percebe, mas não participa 
 * 2 - Percebe, tenta participar, mas não consegue
 * 3 - Participa, mas não como esperado  
 * 4 - Participa conforme esperado
 * 5 - Participa e supera as expectativas
 * 
 * @param sessoes - Array de sessões de musicoterapia
 * @returns Dados de participação ou mock se USE_MOCK_DATA estiver ativo
 */
export function prepareMusiParticipacaoData(sessoes: Sessao[]): MusiParticipacaoData | null {
    // Retornar dados mockados se a flag estiver ativa
    if (USE_MOCK_DATA) {
        return mockMusiParticipacaoDefault;
    }

    const participacoes: number[] = [];

    sessoes.forEach((sessao) => {
        sessao.registros.forEach((registro) => {
            // O campo participacao vem nos registros de musicoterapia
            if (registro.participacao !== undefined && registro.participacao !== null) {
                participacoes.push(registro.participacao);
            }
        });
    });

    if (participacoes.length === 0) {
        return null;
    }

    const soma = participacoes.reduce((acc, val) => acc + val, 0);
    const media = soma / participacoes.length;

    // Calcular tendência comparando primeira e segunda metade do período
    let tendencia: number | undefined;
    if (participacoes.length >= 4) {
        const metade = Math.floor(participacoes.length / 2);
        const primeiraParte = participacoes.slice(0, metade);
        const segundaParte = participacoes.slice(metade);
        
        const mediaPrimeira = primeiraParte.reduce((a, b) => a + b, 0) / primeiraParte.length;
        const mediaSegunda = segundaParte.reduce((a, b) => a + b, 0) / segundaParte.length;
        
        tendencia = mediaSegunda - mediaPrimeira;
    }

    return {
        media,
        tendencia,
        totalRegistros: participacoes.length,
    };
}

/**
 * Calcula a média de suporte a partir das sessões de Musicoterapia
 * 
 * Escala de Suporte (1-5):
 * 1 - Sem suporte (independente)
 * 2 - Mínimo (verbal)
 * 3 - Visual  
 * 4 - Moderado (Parcialmente físico)
 * 5 - Máximo (totalmente físico)
 * 
 * NOTA: Para suporte, MENOR é MELHOR (1 = independente)
 * 
 * @param sessoes - Array de sessões de musicoterapia
 * @returns Dados de suporte ou mock se USE_MOCK_DATA estiver ativo
 */
export function prepareMusiSuporteData(sessoes: Sessao[]): MusiSuporteData | null {
    // Retornar dados mockados se a flag estiver ativa
    if (USE_MOCK_DATA) {
        return mockMusiSuporteDefault;
    }

    const suportes: number[] = [];

    sessoes.forEach((sessao) => {
        sessao.registros.forEach((registro) => {
            // O campo suporte vem nos registros de musicoterapia
            if (registro.suporte !== undefined && registro.suporte !== null) {
                suportes.push(registro.suporte);
            }
        });
    });

    if (suportes.length === 0) {
        return null;
    }

    const soma = suportes.reduce((acc, val) => acc + val, 0);
    const media = soma / suportes.length;

    // Calcular tendência comparando primeira e segunda metade do período
    // Para suporte, tendência NEGATIVA é BOA (menos suporte = melhor)
    let tendencia: number | undefined;
    if (suportes.length >= 4) {
        const metade = Math.floor(suportes.length / 2);
        const primeiraParte = suportes.slice(0, metade);
        const segundaParte = suportes.slice(metade);
        
        const mediaPrimeira = primeiraParte.reduce((a, b) => a + b, 0) / primeiraParte.length;
        const mediaSegunda = segundaParte.reduce((a, b) => a + b, 0) / segundaParte.length;
        
        tendencia = mediaSegunda - mediaPrimeira;
    }

    return {
        media,
        tendencia,
        totalRegistros: suportes.length,
    };
}
