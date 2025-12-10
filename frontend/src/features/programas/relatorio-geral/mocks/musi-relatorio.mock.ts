/**
 * Mocks específicos para relatórios de Musicoterapia
 * 
 * Este arquivo contém dados simulados para os gráficos específicos
 * de Musicoterapia: Participação (0-5) e Suporte (1-5)
 * 
 * Escala de Participação (0-5):
 * 0 - Não participa
 * 1 - Percebe, mas não participa 
 * 2 - Percebe, tenta participar, mas não consegue
 * 3 - Participa, mas não como esperado  
 * 4 - Participa conforme esperado
 * 5 - Participa e supera as expectativas
 * 
 * Escala de Suporte (1-5):
 * 1 - Independente
 * 2 - Supervisão
 * 3 - Mínimo físico
 * 4 - Moderado físico
 * 5 - Máximo físico
 */

import type { MusiParticipacaoData, MusiSuporteData, MusiKpisData, MusiEvolutionData, MusiAttentionActivityItem } from '../components/musi';
import type { ToAutonomyData } from '../components/to/ToAutonomyByCategoryChart';
import type { SerieLinha } from '@/features/relatorios/gerar-relatorio/types';

// ==========================================
// TIPOS DE KPIS PARA MUSICOTERAPIA
// ==========================================

// Re-exportar tipo do componente
export type { MusiKpisData } from '../components/musi';

// ==========================================
// MOCKS DE KPIS
// ==========================================

/**
 * Mock padrão de KPIs para Musicoterapia
 */
export const mockMusiKpisDefault: MusiKpisData = {
    desempenhou: 156,
    desempenhouComAjuda: 89,
    naoDesempenhou: 34,
    avgParticipacao: 3.8,
    avgSuporte: 2.2,
    atividadesTotal: 18,
    sessoesTotal: 24,
};

/**
 * Mock de KPIs com bom desempenho
 */
export const mockMusiKpisBom: MusiKpisData = {
    desempenhou: 245,
    desempenhouComAjuda: 52,
    naoDesempenhou: 18,
    avgParticipacao: 4.5,
    avgSuporte: 1.5,
    atividadesTotal: 22,
    sessoesTotal: 32,
};

/**
 * Mock de KPIs com desempenho regular
 */
export const mockMusiKpisRegular: MusiKpisData = {
    desempenhou: 98,
    desempenhouComAjuda: 112,
    naoDesempenhou: 65,
    avgParticipacao: 2.8,
    avgSuporte: 3.2,
    atividadesTotal: 15,
    sessoesTotal: 18,
};

// ==========================================
// MOCKS DE PERFORMANCE LINE (EVOLUÇÃO)
// ==========================================

/**
 * Mock padrão de dados de evolução (SerieLinha)
 * Mostra uma progressão típica de melhoria
 */
export const mockMusiPerformanceLineDefault: SerieLinha[] = [
    { x: '01/10', acerto: 45, independencia: 28 },
    { x: '03/10', acerto: 52, independencia: 35 },
    { x: '08/10', acerto: 58, independencia: 42 },
    { x: '10/10', acerto: 62, independencia: 48 },
    { x: '15/10', acerto: 68, independencia: 55 },
    { x: '17/10', acerto: 72, independencia: 60 },
    { x: '22/10', acerto: 78, independencia: 68 },
    { x: '24/10', acerto: 82, independencia: 75 },
    { x: '29/10', acerto: 85, independencia: 80 },
    { x: '01/11', acerto: 88, independencia: 84 },
];

/**
 * Mock de evolução com progresso excelente
 */
export const mockMusiPerformanceLineExcelente: SerieLinha[] = [
    { x: '01/10', acerto: 55, independencia: 40 },
    { x: '05/10', acerto: 68, independencia: 58 },
    { x: '10/10', acerto: 78, independencia: 72 },
    { x: '15/10', acerto: 85, independencia: 82 },
    { x: '20/10', acerto: 92, independencia: 90 },
    { x: '25/10', acerto: 95, independencia: 94 },
];

/**
 * Mock de evolução com dificuldades
 */
export const mockMusiPerformanceLineAtencao: SerieLinha[] = [
    { x: '01/10', acerto: 35, independencia: 18 },
    { x: '05/10', acerto: 38, independencia: 22 },
    { x: '10/10', acerto: 42, independencia: 25 },
    { x: '15/10', acerto: 40, independencia: 28 },
    { x: '20/10', acerto: 45, independencia: 32 },
    { x: '25/10', acerto: 48, independencia: 35 },
];

// ==========================================
// MOCKS DE EVOLUÇÃO PARTICIPAÇÃO E SUPORTE
// ==========================================

/**
 * Mock padrão de evolução de participação e suporte
 * Mostra cenário ideal: participação aumentando, suporte diminuindo
 */
export const mockMusiEvolutionDefault: MusiEvolutionData[] = [
    { x: '01/10', participacao: 2.5, suporte: 4.2 },
    { x: '03/10', participacao: 2.8, suporte: 4.0 },
    { x: '08/10', participacao: 3.2, suporte: 3.5 },
    { x: '10/10', participacao: 3.5, suporte: 3.2 },
    { x: '15/10', participacao: 3.8, suporte: 2.8 },
    { x: '17/10', participacao: 4.0, suporte: 2.5 },
    { x: '22/10', participacao: 4.2, suporte: 2.2 },
    { x: '24/10', participacao: 4.3, suporte: 2.0 },
    { x: '29/10', participacao: 4.5, suporte: 1.8 },
    { x: '01/11', participacao: 4.6, suporte: 1.5 },
];

/**
 * Mock de evolução excelente
 * Alta participação desde início, suporte já baixo
 */
export const mockMusiEvolutionExcelente: MusiEvolutionData[] = [
    { x: '01/10', participacao: 4.0, suporte: 2.0 },
    { x: '05/10', participacao: 4.3, suporte: 1.8 },
    { x: '10/10', participacao: 4.5, suporte: 1.5 },
    { x: '15/10', participacao: 4.7, suporte: 1.3 },
    { x: '20/10', participacao: 4.8, suporte: 1.2 },
    { x: '25/10', participacao: 4.9, suporte: 1.1 },
];

/**
 * Mock de evolução com dificuldades
 * Participação baixa, suporte ainda alto
 */
export const mockMusiEvolutionAtencao: MusiEvolutionData[] = [
    { x: '01/10', participacao: 1.5, suporte: 4.5 },
    { x: '05/10', participacao: 1.8, suporte: 4.3 },
    { x: '10/10', participacao: 2.0, suporte: 4.2 },
    { x: '15/10', participacao: 2.2, suporte: 4.0 },
    { x: '20/10', participacao: 2.3, suporte: 3.8 },
    { x: '25/10', participacao: 2.5, suporte: 3.5 },
];

// ==========================================
// MOCKS DE ATIVIDADES COM ATENÇÃO
// ==========================================

/**
 * Mock padrão de atividades que precisam de atenção
 * Inclui participação e suporte específicos de Musicoterapia
 */
export const mockMusiAttentionActivitiesDefault: MusiAttentionActivityItem[] = [
    {
        id: 'act-1',
        nome: 'Reconhecimento de timbres',
        order: 1,
        counts: { desempenhou: 8, comAjuda: 12, naoDesempenhou: 15 },
        total: 35,
        participacao: 2.5,
        suporte: 4.0,
    },
    {
        id: 'act-2',
        nome: 'Sequência rítmica complexa',
        order: 2,
        counts: { desempenhou: 5, comAjuda: 18, naoDesempenhou: 12 },
        total: 35,
        participacao: 3.0,
        suporte: 3.5,
    },
    {
        id: 'act-3',
        nome: 'Improvisação melódica',
        order: 3,
        counts: { desempenhou: 10, comAjuda: 15, naoDesempenhou: 8 },
        total: 33,
        participacao: 3.5,
        suporte: 3.0,
    },
    {
        id: 'act-4',
        nome: 'Coordenação bilateral com instrumentos',
        order: 4,
        counts: { desempenhou: 12, comAjuda: 10, naoDesempenhou: 6 },
        total: 28,
        participacao: 4.0,
        suporte: 2.5,
    },
];

/**
 * Mock com poucas atividades precisando atenção
 */
export const mockMusiAttentionActivitiesBom: MusiAttentionActivityItem[] = [
    {
        id: 'act-1',
        nome: 'Leitura de partitura simplificada',
        order: 1,
        counts: { desempenhou: 18, comAjuda: 8, naoDesempenhou: 4 },
        total: 30,
        participacao: 4.5,
        suporte: 1.5,
    },
];

// ==========================================
// MOCKS DE AUTONOMIA POR CATEGORIA
// ==========================================

/**
 * Mock padrão de autonomia por categoria musical
 */
export const mockMusiAutonomyByCategoryDefault: ToAutonomyData[] = [
    { categoria: 'Ritmo', autonomia: 72 },
    { categoria: 'Melodia', autonomia: 58 },
    { categoria: 'Expressão corporal', autonomia: 85 },
    { categoria: 'Interação social', autonomia: 68 },
    { categoria: 'Atenção auditiva', autonomia: 52 },
    { categoria: 'Memória musical', autonomia: 45 },
];

/**
 * Mock de autonomia com bom desempenho
 */
export const mockMusiAutonomyByCategoryBom: ToAutonomyData[] = [
    { categoria: 'Ritmo', autonomia: 88 },
    { categoria: 'Melodia', autonomia: 82 },
    { categoria: 'Expressão corporal', autonomia: 95 },
    { categoria: 'Interação social', autonomia: 78 },
    { categoria: 'Atenção auditiva', autonomia: 72 },
    { categoria: 'Memória musical', autonomia: 68 },
];

/**
 * Mock de autonomia com dificuldades
 */
export const mockMusiAutonomyByCategoryAtencao: ToAutonomyData[] = [
    { categoria: 'Ritmo', autonomia: 42 },
    { categoria: 'Melodia', autonomia: 35 },
    { categoria: 'Expressão corporal', autonomia: 55 },
    { categoria: 'Interação social', autonomia: 38 },
    { categoria: 'Atenção auditiva', autonomia: 28 },
    { categoria: 'Memória musical', autonomia: 22 },
];

// ==========================================
// MOCKS DE PARTICIPAÇÃO
// ==========================================

/**
 * Mock para participação alta - paciente engajado
 */
export const mockParticipacaoAlta: MusiParticipacaoData = {
    media: 4.2,
    tendencia: 0.4,
    totalRegistros: 48,
};

/**
 * Mock para participação média - desempenho regular
 */
export const mockParticipacaoMedia: MusiParticipacaoData = {
    media: 3.1,
    tendencia: 0.2,
    totalRegistros: 35,
};

/**
 * Mock para participação baixa - atenção necessária
 */
export const mockParticipacaoBaixa: MusiParticipacaoData = {
    media: 1.8,
    tendencia: -0.3,
    totalRegistros: 22,
};

/**
 * Mock para participação excelente - superando expectativas
 */
export const mockParticipacaoExcelente: MusiParticipacaoData = {
    media: 4.7,
    tendencia: 0.5,
    totalRegistros: 62,
};

/**
 * Mock para participação crítica - requer intervenção
 */
export const mockParticipacaoCritica: MusiParticipacaoData = {
    media: 0.9,
    tendencia: -0.2,
    totalRegistros: 15,
};

// ==========================================
// MOCKS DE SUPORTE
// ==========================================

/**
 * Mock para suporte baixo (bom) - paciente mais independente
 * Quanto menor, melhor
 */
export const mockSuporteBaixo: MusiSuporteData = {
    media: 1.8,
    tendencia: -0.3, // Negativo é bom para suporte (menos suporte necessário)
    totalRegistros: 48,
};

/**
 * Mock para suporte médio - alguma assistência necessária
 */
export const mockSuporteMedio: MusiSuporteData = {
    media: 2.9,
    tendencia: -0.1,
    totalRegistros: 35,
};

/**
 * Mock para suporte alto - muita assistência necessária
 */
export const mockSuporteAlto: MusiSuporteData = {
    media: 4.2,
    tendencia: 0.2, // Positivo é ruim para suporte (mais suporte necessário)
    totalRegistros: 28,
};

/**
 * Mock para suporte independente - praticamente sem assistência
 */
export const mockSuporteIndependente: MusiSuporteData = {
    media: 1.2,
    tendencia: -0.4,
    totalRegistros: 55,
};

/**
 * Mock para suporte máximo - dependência total
 */
export const mockSuporteMaximo: MusiSuporteData = {
    media: 4.8,
    tendencia: 0.3,
    totalRegistros: 18,
};

// ==========================================
// MOCKS PADRÃO (usados por padrão no serviço)
// ==========================================

/**
 * Mock padrão de participação - usado quando não há dados reais
 * Representa um cenário típico/comum
 */
export const mockMusiParticipacaoDefault: MusiParticipacaoData = {
    media: 3.6,
    tendencia: 0.3,
    totalRegistros: 42,
};

/**
 * Mock padrão de suporte - usado quando não há dados reais
 * Representa um cenário típico/comum
 */
export const mockMusiSuporteDefault: MusiSuporteData = {
    media: 2.4,
    tendencia: -0.2,
    totalRegistros: 42,
};

// ==========================================
// CONFIGURAÇÕES DE CENÁRIOS
// ==========================================

/**
 * Cenários pré-configurados para diferentes situações de pacientes
 */
export const mockCenarios = {
    /** Paciente progredindo bem - alta participação, pouco suporte */
    progressoBom: {
        participacao: mockParticipacaoAlta,
        suporte: mockSuporteBaixo,
    },
    /** Paciente em desenvolvimento - participação e suporte medianos */
    progressoRegular: {
        participacao: mockParticipacaoMedia,
        suporte: mockSuporteMedio,
    },
    /** Paciente com dificuldades - baixa participação, muito suporte */
    atencaoNecessaria: {
        participacao: mockParticipacaoBaixa,
        suporte: mockSuporteAlto,
    },
    /** Paciente excelente - participação máxima, independente */
    excelente: {
        participacao: mockParticipacaoExcelente,
        suporte: mockSuporteIndependente,
    },
    /** Paciente crítico - participação mínima, dependência total */
    critico: {
        participacao: mockParticipacaoCritica,
        suporte: mockSuporteMaximo,
    },
} as const;

// ==========================================
// EXPORTAÇÕES AGRUPADAS
// ==========================================

export const mockMusiParticipacao = {
    default: mockMusiParticipacaoDefault,
    alta: mockParticipacaoAlta,
    media: mockParticipacaoMedia,
    baixa: mockParticipacaoBaixa,
    excelente: mockParticipacaoExcelente,
    critica: mockParticipacaoCritica,
};

export const mockMusiSuporte = {
    default: mockMusiSuporteDefault,
    baixo: mockSuporteBaixo,
    medio: mockSuporteMedio,
    alto: mockSuporteAlto,
    independente: mockSuporteIndependente,
    maximo: mockSuporteMaximo,
};

export const mockMusiKpis = {
    default: mockMusiKpisDefault,
    bom: mockMusiKpisBom,
    regular: mockMusiKpisRegular,
};

export const mockMusiPerformanceLine = {
    default: mockMusiPerformanceLineDefault,
    excelente: mockMusiPerformanceLineExcelente,
    atencao: mockMusiPerformanceLineAtencao,
};

export const mockMusiAttentionActivities = {
    default: mockMusiAttentionActivitiesDefault,
    bom: mockMusiAttentionActivitiesBom,
};

export const mockMusiAutonomyByCategory = {
    default: mockMusiAutonomyByCategoryDefault,
    bom: mockMusiAutonomyByCategoryBom,
    atencao: mockMusiAutonomyByCategoryAtencao,
};

export const mockMusiEvolution = {
    default: mockMusiEvolutionDefault,
    excelente: mockMusiEvolutionExcelente,
    atencao: mockMusiEvolutionAtencao,
};
