/**
 * ============================================================================
 * DADOS MOCK DE FATURAMENTO PARA SESSÕES
 * ============================================================================
 * 
 * Este arquivo contém dados mock de faturamento para testar a integração
 * dos componentes de visualização de faturamento nas sessões.
 * 
 * ============================================================================
 */

import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';
import { TIPO_ATENDIMENTO } from '@/features/programas/core/types/billing';

/**
 * Dados mock de faturamento para diferentes tipos de sessão
 */
export const mockBillingData: Record<string, DadosFaturamentoSessao> = {
    // Sessão consultório - completa
    '1': {
        dataSessao: '2024-01-15',
        horarioInicio: '14:00',
        horarioFim: '15:30',
        tipoAtendimento: TIPO_ATENDIMENTO.CONSULTORIO,
        ajudaCusto: null,
        observacaoFaturamento: 'Sessão regular de fonoaudiologia. Paciente demonstrou boa evolução.',
        arquivosFaturamento: []
    },

    // Sessão homecare com ajuda de custo
    '2': {
        dataSessao: '2024-01-16',
        horarioInicio: '09:00',
        horarioFim: '10:00',
        tipoAtendimento: TIPO_ATENDIMENTO.HOMECARE,
        ajudaCusto: true,
        observacaoFaturamento: 'Atendimento domiciliar. Deslocamento: 45 minutos (ida e volta). Estacionamento: R$ 15,00.',
        arquivosFaturamento: [
            {
                id: 'arq-1',
                nome: 'recibo-estacionamento.pdf',
                tipo: 'application/pdf',
                tamanho: 102400,
                url: '#'
            },
            {
                id: 'arq-2',
                nome: 'comprovante-uber.jpg',
                tipo: 'image/jpeg',
                tamanho: 204800,
                url: '#'
            }
        ]
    },

    // Sessão homecare sem ajuda de custo
    '3': {
        dataSessao: '2024-01-17',
        horarioInicio: '16:30',
        horarioFim: '17:30',
        tipoAtendimento: TIPO_ATENDIMENTO.HOMECARE,
        ajudaCusto: false,
        observacaoFaturamento: 'Atendimento domiciliar sem custos adicionais. Deslocamento próprio.',
        arquivosFaturamento: []
    },

    // Sessão consultório - sessão longa
    '4': {
        dataSessao: '2024-01-18',
        horarioInicio: '08:00',
        horarioFim: '10:00',
        tipoAtendimento: TIPO_ATENDIMENTO.CONSULTORIO,
        ajudaCusto: null,
        observacaoFaturamento: 'Sessão intensiva de terapia ocupacional. Atividades de coordenação motora.',
        arquivosFaturamento: []
    },

    // Sessão básica - só horários
    '5': {
        dataSessao: '2024-01-19',
        horarioInicio: '15:00',
        horarioFim: '16:00',
        tipoAtendimento: TIPO_ATENDIMENTO.CONSULTORIO,
        ajudaCusto: null,
        observacaoFaturamento: '',
        arquivosFaturamento: []
    },

    // Sessão homecare completa
    '6': {
        dataSessao: '2024-01-20',
        horarioInicio: '10:00',
        horarioFim: '11:30',
        tipoAtendimento: TIPO_ATENDIMENTO.HOMECARE,
        ajudaCusto: true,
        observacaoFaturamento: 'Atendimento em domicílio. Material levado: prancha de atividades, jogos terapêuticos. Estacionamento e material de apoio inclusos.',
        arquivosFaturamento: [
            {
                id: 'arq-3',
                nome: 'nota-fiscal-material.pdf',
                tipo: 'application/pdf',
                tamanho: 156800,
                url: '#'
            },
            {
                id: 'arq-4',
                nome: 'recibo-estacionamento-20jan.pdf',
                tipo: 'application/pdf',
                tamanho: 98400,
                url: '#'
            }
        ]
    }
};

/**
 * Função para obter dados mock de faturamento por ID da sessão
 */
export function getMockBillingData(sessionId: string): DadosFaturamentoSessao | undefined {
    return mockBillingData[sessionId];
}

/**
 * Função para adicionar dados de faturamento mock a uma sessão
 */
export function addMockBillingToSession<T extends { id: string }>(session: T): T & { faturamento?: DadosFaturamentoSessao } {
    const billing = getMockBillingData(session.id);
    return {
        ...session,
        faturamento: billing
    };
}

/**
 * Função para adicionar dados de faturamento mock a uma lista de sessões
 */
export function addMockBillingToSessions<T extends { id: string }>(sessions: T[]): (T & { faturamento?: DadosFaturamentoSessao })[] {
    return sessions.map(session => addMockBillingToSession(session));
}