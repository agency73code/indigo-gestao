/**
 * ============================================================================
 * MOCK DATA - FATURAMENTO
 * ============================================================================
 * 
 * Dados mockados para o sistema de faturamento baseado em sessões e atas.
 * Simula os dados que virão do backend quando estiver pronto.
 * ============================================================================
 */

import type {
    ItemFaturamento,
    FaturamentoListResponse,
    FaturamentoListFilters,
    ResumoFaturamento,
    ResumoGerente,
    ClienteOption,
    TerapeutaOption,
} from '../types/faturamento.types';
import {
    ORIGEM_LANCAMENTO,
    TIPO_ATIVIDADE_FATURAMENTO,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    STATUS_FATURAMENTO,
} from '../types/faturamento.types';

// ============================================
// DADOS MOCK
// ============================================

const MOCK_TERAPEUTA: TerapeutaOption = {
    id: 'terapeuta-001',
    nome: 'Ana Paula Silva',
    avatarUrl: undefined,
};

// Mais terapeutas para simular visão do gerente
const MOCK_TERAPEUTAS: TerapeutaOption[] = [
    MOCK_TERAPEUTA,
    { id: 'terapeuta-002', nome: 'Carlos Eduardo Mendes', avatarUrl: undefined },
    { id: 'terapeuta-003', nome: 'Mariana Oliveira Costa', avatarUrl: undefined },
    { id: 'terapeuta-004', nome: 'Roberto Almeida', avatarUrl: undefined },
    { id: 'terapeuta-005', nome: 'Juliana Santos', avatarUrl: undefined },
];

// Exportar para uso em outros mocks se necessário
export { MOCK_TERAPEUTAS };

const MOCK_CLIENTES: ClienteOption[] = [
    { id: 'cli-001', nome: 'Miguel Oliveira', avatarUrl: undefined },
    { id: 'cli-002', nome: 'Sofia Santos', avatarUrl: undefined },
    { id: 'cli-003', nome: 'Lucas Ferreira', avatarUrl: undefined },
    { id: 'cli-004', nome: 'Helena Costa', avatarUrl: undefined },
];

/**
 * Dados mockados de faturamento (sessões + atas)
 * 
 * IMPORTANTE - Valores:
 * - valorHora / valorTotal: Valor que a clínica PAGA ao terapeuta
 * - valorHoraCliente / valorTotalCliente: Valor que o CLIENTE paga à clínica (do vínculo)
 */
const MOCK_LANCAMENTOS: ItemFaturamento[] = [
    // Sessões
    {
        id: 'sessao_1',
        origemId: 1,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        terapeutaRegistroProfissional: 'CRP 06/12345',
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        clienteIdade: '8 anos',
        clienteDataNascimento: '02/01/2018',
        data: '2026-01-24',
        horarioInicio: '09:00',
        horarioFim: '10:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 180,
        valorTotal: 180,
        valorHoraCliente: 280,
        valorTotalCliente: 280,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Psicologia',
        programaNome: 'Programa de Linguagem',
        criadoEm: '2026-01-24T10:00:00Z',
    },
    {
        id: 'sessao_2',
        origemId: 2,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        terapeutaRegistroProfissional: 'CRP 06/12345',
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        clienteIdade: '8 anos',
        clienteDataNascimento: '02/01/2018',
        data: '2026-01-22',
        horarioInicio: '14:00',
        horarioFim: '15:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE,
        duracaoMinutos: 60,
        valorHora: 200,
        valorTotal: 200,
        valorHoraCliente: 320,
        valorTotalCliente: 320,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Fonoaudiologia',
        programaNome: 'Programa de Linguagem',
        criadoEm: '2026-01-22T15:00:00Z',
    },
    {
        id: 'sessao_3',
        origemId: 3,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        clienteIdade: '8 anos',
        data: '2026-01-20',
        horarioInicio: '10:00',
        horarioFim: '11:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 180,
        valorTotal: 180,
        valorHoraCliente: 280,
        valorTotalCliente: 280,
        status: STATUS_FATURAMENTO.PENDENTE,
        area: 'Fonoaudiologia',
        programaNome: 'Programa de Linguagem',
        criadoEm: '2026-01-20T11:00:00Z',
    },
    {
        id: 'sessao_4',
        origemId: 4,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-002',
        clienteNome: 'Sofia Santos',
        clienteIdade: '5 anos',
        data: '2026-01-23',
        horarioInicio: '08:00',
        horarioFim: '09:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 180,
        valorTotal: 180,
        valorHoraCliente: 300,
        valorTotalCliente: 300,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Terapia Ocupacional',
        programaNome: 'Programa Motor',
        criadoEm: '2026-01-23T09:00:00Z',
    },
    // Atas de Reunião
    {
        id: 'ata_1',
        origemId: 1,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        clienteIdade: '8 anos',
        data: '2026-01-21',
        horarioInicio: '15:00',
        horarioFim: '16:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.REUNIAO,
        duracaoMinutos: 60,
        valorHora: 90,
        valorTotal: 90,
        valorHoraCliente: 150,
        valorTotalCliente: 150,
        status: STATUS_FATURAMENTO.APROVADO,
        finalidade: 'orientacao_parental',
        criadoEm: '2026-01-21T16:00:00Z',
    },
    {
        id: 'ata_2',
        origemId: 2,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: undefined,
        clienteNome: undefined,
        data: '2026-01-19',
        horarioInicio: '17:00',
        horarioFim: '19:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_RECEBIDA,
        duracaoMinutos: 120,
        valorHora: 100,
        valorTotal: 200,
        status: STATUS_FATURAMENTO.PENDENTE,
        finalidade: 'supervisao_recebida',
        criadoEm: '2026-01-19T19:00:00Z',
    },
    {
        id: 'ata_3',
        origemId: 3,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-003',
        clienteNome: 'Lucas Ferreira',
        data: '2026-01-18',
        horarioInicio: '14:00',
        horarioFim: '14:45',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_DADA,
        duracaoMinutos: 45,
        valorHora: 120,
        valorTotal: 90,
        valorHoraCliente: 180,
        valorTotalCliente: 135,
        status: STATUS_FATURAMENTO.PENDENTE,
        finalidade: 'supervisao_terapeuta',
        criadoEm: '2026-01-18T14:45:00Z',
    },
    {
        id: 'ata_4',
        origemId: 4,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        data: '2026-01-17',
        horarioInicio: '10:00',
        horarioFim: '12:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.REUNIAO,
        duracaoMinutos: 120,
        valorHora: 150,
        valorTotal: 300,
        valorHoraCliente: 220,
        valorTotalCliente: 440,
        status: STATUS_FATURAMENTO.PENDENTE,
        finalidade: 'reuniao_escola',
        criadoEm: '2026-01-17T12:00:00Z',
    },
    {
        id: 'sessao_5',
        origemId: 5,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        data: '2026-01-15',
        horarioInicio: '09:00',
        horarioFim: '10:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE,
        duracaoMinutos: 60,
        valorHora: 200,
        valorTotal: 200,
        valorHoraCliente: 320,
        valorTotalCliente: 320,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Fonoaudiologia',
        programaNome: 'Programa de Linguagem',
        criadoEm: '2026-01-15T10:00:00Z',
    },
    // Sessões Rejeitadas
    {
        id: 'sessao_rej_miguel',
        origemId: 9,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        data: '2026-01-16',
        horarioInicio: '11:00',
        horarioFim: '12:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE,
        duracaoMinutos: 60,
        valorHora: 20000,
        valorTotal: 20000,
        valorHoraCliente: 320,
        valorTotalCliente: 320,
        status: STATUS_FATURAMENTO.REJEITADO,
        motivoRejeicao: 'Horário não confere com a agenda do cliente',
        area: 'Fonoaudiologia',
        programaNome: 'Programa de Linguagem',
        criadoEm: '2026-01-16T12:00:00Z',
    },
    {
        id: 'sessao_rej_1',
        origemId: 10,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-002',
        clienteNome: 'Sofia Santos',
        data: '2026-01-12',
        horarioInicio: '14:00',
        horarioFim: '15:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 18000,
        valorTotal: 18000,
        valorHoraCliente: 300,
        valorTotalCliente: 300,
        status: STATUS_FATURAMENTO.REJEITADO,
        motivoRejeicao: 'Dados do atendimento incompletos. Favor revisar o registro da sessão.',
        area: 'Terapia Ocupacional',
        programaNome: 'Programa Motor',
        criadoEm: '2026-01-12T15:00:00Z',
        faturamento: {
            dataSessao: '2026-01-12',
            horarioInicio: '14:00',
            horarioFim: '15:00',
            tipoAtendimento: 'consultorio' as const,
            ajudaCusto: null,
            observacaoFaturamento: 'Sessão de Terapia Ocupacional focada em atividades de coordenação motora fina. Paciente apresentou boa participação durante toda a sessão.',
            arquivosFaturamento: [
                {
                    id: 'arq-3',
                    nome: 'foto_atividade_1.jpg',
                    tipo: 'image/jpeg',
                    tamanho: 512400,
                    caminho: '/uploads/faturamento/foto_atividade_1.jpg',
                    url: '/api/faturamentos/arquivos/arq-3/download',
                },
            ],
        },
    },
    {
        id: 'ata_rej_1',
        origemId: 11,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: MOCK_TERAPEUTA.id,
        terapeutaNome: MOCK_TERAPEUTA.nome,
        clienteId: 'cli-003',
        clienteNome: 'Lucas Ferreira',
        data: '2026-01-10',
        horarioInicio: '16:00',
        horarioFim: '17:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.REUNIAO,
        duracaoMinutos: 60,
        valorHora: 90,
        valorTotal: 90,
        valorHoraCliente: 150,
        valorTotalCliente: 150,
        status: STATUS_FATURAMENTO.REJEITADO,
        motivoRejeicao: 'Ata de reunião sem assinatura do responsável. Solicitar nova documentação.',
        finalidade: 'reuniao_escola',
        criadoEm: '2026-01-10T17:00:00Z',
        faturamento: {
            dataSessao: '2026-01-10',
            horarioInicio: '16:00',
            horarioFim: '17:00',
            tipoAtendimento: 'consultorio' as const,
            ajudaCusto: null,
            observacaoFaturamento: 'Reunião com a escola para discutir adaptações curriculares. Participaram a coordenadora pedagógica, professora da sala e psicopedagoga.',
            arquivosFaturamento: [
                {
                    id: 'arq-1',
                    nome: 'comprovante_reuniao_escola.pdf',
                    tipo: 'application/pdf',
                    tamanho: 245680,
                    caminho: '/uploads/faturamento/comprovante_reuniao_escola.pdf',
                    url: '/api/faturamentos/arquivos/arq-1/download',
                },
                {
                    id: 'arq-2',
                    nome: 'lista_presenca.pdf',
                    tipo: 'application/pdf',
                    tamanho: 128340,
                    caminho: '/uploads/faturamento/lista_presenca.pdf',
                    url: '/api/faturamentos/arquivos/arq-2/download',
                },
            ],
        },
    },
];

// ============================================
// LANÇAMENTOS DE OUTROS TERAPEUTAS (para visão gerente)
// ============================================

const MOCK_LANCAMENTOS_OUTROS_TERAPEUTAS: ItemFaturamento[] = [
    // Carlos Eduardo - Terapeuta 002
    {
        id: 'sessao_t2_1',
        origemId: 101,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-002',
        terapeutaNome: 'Carlos Eduardo Mendes',
        clienteId: 'cli-002',
        clienteNome: 'Sofia Santos',
        data: '2026-01-24',
        horarioInicio: '10:00',
        horarioFim: '11:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 180,
        valorTotal: 180,
        valorHoraCliente: 300,
        valorTotalCliente: 300,
        status: STATUS_FATURAMENTO.PENDENTE,
        area: 'Psicologia',
        programaNome: 'Programa Comportamental',
        criadoEm: '2026-01-24T11:00:00Z',
    },
    {
        id: 'sessao_t2_2',
        origemId: 102,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-002',
        terapeutaNome: 'Carlos Eduardo Mendes',
        clienteId: 'cli-003',
        clienteNome: 'Lucas Ferreira',
        data: '2026-01-23',
        horarioInicio: '14:00',
        horarioFim: '15:30',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE,
        duracaoMinutos: 90,
        valorHora: 220,
        valorTotal: 330,
        valorHoraCliente: 350,
        valorTotalCliente: 525,
        status: STATUS_FATURAMENTO.PENDENTE,
        area: 'Psicologia',
        programaNome: 'Programa Comportamental',
        criadoEm: '2026-01-23T15:30:00Z',
        // Ajuda de custo - com comprovante
        temAjudaCusto: true,
        motivoAjudaCusto: 'Uber ida e volta + estacionamento do shopping. Cliente mora em Alphaville.',
        comprovantesAjudaCusto: [
            {
                id: 'comp-001',
                nome: 'Recibo Uber - Ida.pdf',
                url: '/uploads/comprovantes/comp-001.pdf',
                tipo: 'application/pdf',
                tamanho: 125000,
            },
            {
                id: 'comp-002',
                nome: 'Recibo Uber - Volta.pdf',
                url: '/uploads/comprovantes/comp-002.pdf',
                tipo: 'application/pdf',
                tamanho: 118000,
            },
        ],
    },
    {
        id: 'ata_t2_1',
        origemId: 103,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: 'terapeuta-002',
        terapeutaNome: 'Carlos Eduardo Mendes',
        clienteId: 'cli-002',
        clienteNome: 'Sofia Santos',
        data: '2026-01-22',
        horarioInicio: '16:00',
        horarioFim: '17:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.REUNIAO,
        duracaoMinutos: 60,
        valorHora: 100,
        valorTotal: 100,
        valorHoraCliente: 160,
        valorTotalCliente: 160,
        status: STATUS_FATURAMENTO.APROVADO,
        finalidade: 'orientacao_parental',
        criadoEm: '2026-01-22T17:00:00Z',
    },
    // Mariana Oliveira - Terapeuta 003
    {
        id: 'sessao_t3_1',
        origemId: 201,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-003',
        terapeutaNome: 'Mariana Oliveira Costa',
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        data: '2026-01-25',
        horarioInicio: '08:00',
        horarioFim: '09:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 190,
        valorTotal: 190,
        valorHoraCliente: 280,
        valorTotalCliente: 280,
        status: STATUS_FATURAMENTO.PENDENTE,
        area: 'Fisioterapia',
        programaNome: 'Programa Motor',
        criadoEm: '2026-01-25T09:00:00Z',
    },
    {
        id: 'sessao_t3_2',
        origemId: 202,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-003',
        terapeutaNome: 'Mariana Oliveira Costa',
        clienteId: 'cli-004',
        clienteNome: 'Helena Costa',
        data: '2026-01-24',
        horarioInicio: '11:00',
        horarioFim: '12:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE,
        duracaoMinutos: 60,
        valorHora: 210,
        valorTotal: 210,
        valorHoraCliente: 340,
        valorTotalCliente: 340,
        status: STATUS_FATURAMENTO.PENDENTE,
        area: 'Fisioterapia',
        programaNome: 'Programa Motor Intensivo',
        criadoEm: '2026-01-24T12:00:00Z',
        // Ajuda de custo - com observação
        temAjudaCusto: true,
        motivoAjudaCusto: 'Gasolina e pedágio. Percurso de 45km.',
        comprovantesAjudaCusto: [
            {
                id: 'comp-003',
                nome: 'Foto Hodômetro.jpg',
                url: '/uploads/comprovantes/comp-003.jpg',
                tipo: 'image/jpeg',
                tamanho: 2500000,
            },
        ],
    },
    {
        id: 'sessao_t3_3',
        origemId: 203,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-003',
        terapeutaNome: 'Mariana Oliveira Costa',
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        data: '2026-01-23',
        horarioInicio: '08:00',
        horarioFim: '09:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 190,
        valorTotal: 190,
        valorHoraCliente: 280,
        valorTotalCliente: 280,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Fisioterapia',
        programaNome: 'Programa Motor',
        criadoEm: '2026-01-23T09:00:00Z',
    },
    // Roberto Almeida - Terapeuta 004
    {
        id: 'sessao_t4_1',
        origemId: 301,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-004',
        terapeutaNome: 'Roberto Almeida',
        clienteId: 'cli-003',
        clienteNome: 'Lucas Ferreira',
        data: '2026-01-24',
        horarioInicio: '15:00',
        horarioFim: '16:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 175000,
        valorTotal: 175000,
        valorHoraCliente: 290000,
        valorTotalCliente: 290000,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Terapia Ocupacional',
        programaNome: 'Programa Sensorial',
        criadoEm: '2026-01-24T16:00:00Z',
    },
    {
        id: 'ata_t4_1',
        origemId: 302,
        origem: ORIGEM_LANCAMENTO.ATA,
        terapeutaId: 'terapeuta-004',
        terapeutaNome: 'Roberto Almeida',
        clienteId: undefined,
        clienteNome: undefined,
        data: '2026-01-23',
        horarioInicio: '17:00',
        horarioFim: '18:30',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_DADA,
        duracaoMinutos: 90,
        valorHora: 150,
        valorTotal: 225,
        status: STATUS_FATURAMENTO.PENDENTE,
        finalidade: 'supervisao_terapeuta',
        criadoEm: '2026-01-23T18:30:00Z',
    },
    // Juliana Santos - Terapeuta 005
    {
        id: 'sessao_t5_1',
        origemId: 401,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-005',
        terapeutaNome: 'Juliana Santos',
        clienteId: 'cli-004',
        clienteNome: 'Helena Costa',
        data: '2026-01-25',
        horarioInicio: '09:00',
        horarioFim: '10:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 180000,
        valorTotal: 180000,
        valorHoraCliente: 300000,
        valorTotalCliente: 300000,
        status: STATUS_FATURAMENTO.PENDENTE,
        area: 'Musicoterapia',
        programaNome: 'Programa Musical',
        criadoEm: '2026-01-25T10:00:00Z',
    },
    {
        id: 'sessao_t5_2',
        origemId: 402,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-005',
        terapeutaNome: 'Juliana Santos',
        clienteId: 'cli-002',
        clienteNome: 'Sofia Santos',
        data: '2026-01-24',
        horarioInicio: '14:00',
        horarioFim: '15:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 18000,
        valorTotal: 18000,
        valorHoraCliente: 30000,
        valorTotalCliente: 30000,
        status: STATUS_FATURAMENTO.APROVADO,
        area: 'Musicoterapia',
        programaNome: 'Programa Musical',
        criadoEm: '2026-01-24T15:00:00Z',
    },
    // Sessões Rejeitadas de outros terapeutas
    {
        id: 'sessao_rej_t2_1',
        origemId: 501,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-002',
        terapeutaNome: 'Carlos Eduardo Mendes',
        clienteId: 'cli-003',
        clienteNome: 'Lucas Ferreira',
        data: '2026-01-20',
        horarioInicio: '10:00',
        horarioFim: '11:30',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE,
        duracaoMinutos: 90,
        valorHora: 200,
        valorTotal: 300,
        valorHoraCliente: 350,
        valorTotalCliente: 525,
        status: STATUS_FATURAMENTO.REJEITADO,
        motivoRejeicao: 'Comprovante de deslocamento não anexado.',
        area: 'Psicologia',
        programaNome: 'Programa Comportamental',
        criadoEm: '2026-01-20T11:30:00Z',
    },
    {
        id: 'sessao_rej_t3_1',
        origemId: 502,
        origem: ORIGEM_LANCAMENTO.SESSAO,
        terapeutaId: 'terapeuta-003',
        terapeutaNome: 'Mariana Oliveira Costa',
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        data: '2026-01-18',
        horarioInicio: '15:00',
        horarioFim: '16:00',
        tipoAtividade: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO,
        duracaoMinutos: 60,
        valorHora: 190,
        valorTotal: 190,
        valorHoraCliente: 280,
        valorTotalCliente: 280,
        status: STATUS_FATURAMENTO.REJEITADO,
        motivoRejeicao: 'Valor da sessão diverge do contrato. Verificar tabela de preços.',
        area: 'Fisioterapia',
        programaNome: 'Programa Motor',
        criadoEm: '2026-01-18T16:00:00Z',
    },
];

// ============================================
// FUNÇÕES DE MOCK
// ============================================

function delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Lista lançamentos de faturamento com filtros
 */
export async function mockListFaturamento(
    filters: FaturamentoListFilters = {}
): Promise<FaturamentoListResponse> {
    await delay();

    // Se não tem filtro de terapeuta, incluir todos (visão gerente)
    let items = filters.terapeutaId 
        ? [...MOCK_LANCAMENTOS].filter(item => item.terapeutaId === filters.terapeutaId)
        : [...MOCK_LANCAMENTOS, ...MOCK_LANCAMENTOS_OUTROS_TERAPEUTAS];

    // Filtro por cliente
    if (filters.clienteId) {
        items = items.filter(item => item.clienteId === filters.clienteId);
    }

    // Filtro por tipo de atividade
    if (filters.tipoAtividade && filters.tipoAtividade !== 'all') {
        items = items.filter(item => item.tipoAtividade === filters.tipoAtividade);
    }

    // Filtro por origem
    if (filters.origem && filters.origem !== 'all') {
        items = items.filter(item => item.origem === filters.origem);
    }

    // Filtro por status
    if (filters.status && filters.status !== 'all') {
        items = items.filter(item => item.status === filters.status);
    }

    // Filtro por período
    if (filters.dataInicio) {
        items = items.filter(item => item.data >= filters.dataInicio!);
    }
    if (filters.dataFim) {
        items = items.filter(item => item.data <= filters.dataFim!);
    }

    // Busca textual
    if (filters.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(item =>
            item.clienteNome?.toLowerCase().includes(q) ||
            item.programaNome?.toLowerCase().includes(q) ||
            item.area?.toLowerCase().includes(q)
        );
    }

    // Ordenação
    const sortOrder = filters.orderBy === 'oldest' ? 1 : -1;
    items.sort((a, b) => {
        const dateA = new Date(a.data).getTime();
        const dateB = new Date(b.data).getTime();
        return (dateB - dateA) * sortOrder;
    });

    // Paginação
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 100;
    const start = (page - 1) * pageSize;
    const paginatedItems = items.slice(start, start + pageSize);

    return {
        items: paginatedItems,
        total: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize),
    };
}

/**
 * Busca lançamento por ID
 */
export async function mockGetFaturamentoById(id: string): Promise<ItemFaturamento | null> {
    await delay();
    return MOCK_LANCAMENTOS.find(item => item.id === id) ?? null;
}

/**
 * Calcula resumo de faturamento
 */
export async function mockGetResumoFaturamento(
    terapeutaId?: string,
    filters?: FaturamentoListFilters
): Promise<ResumoFaturamento> {
    await delay();

    let items = [...MOCK_LANCAMENTOS];

    if (terapeutaId) {
        items = items.filter(item => item.terapeutaId === terapeutaId);
    }

    if (filters?.clienteId) {
        items = items.filter(item => item.clienteId === filters.clienteId);
    }

    if (filters?.dataInicio) {
        items = items.filter(item => item.data >= filters.dataInicio!);
    }
    if (filters?.dataFim) {
        items = items.filter(item => item.data <= filters.dataFim!);
    }

    const totalMinutos = items.reduce((acc, item) => acc + item.duracaoMinutos, 0);
    const totalValor = items.reduce((acc, item) => acc + (item.valorTotal ?? 0), 0);

    const horas = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    const totalHoras = mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;

    const porStatus = {
        pendentes: items.filter(i => i.status === STATUS_FATURAMENTO.PENDENTE).length,
        aprovados: items.filter(i => i.status === STATUS_FATURAMENTO.APROVADO).length,
        rejeitados: items.filter(i => i.status === STATUS_FATURAMENTO.REJEITADO).length,
    };

    // Agrupa por tipo de atividade
    const porTipoMap = new Map<string, { minutos: number; quantidade: number; valor: number }>();
    for (const item of items) {
        const existing = porTipoMap.get(item.tipoAtividade) ?? { minutos: 0, quantidade: 0, valor: 0 };
        porTipoMap.set(item.tipoAtividade, {
            minutos: existing.minutos + item.duracaoMinutos,
            quantidade: existing.quantidade + 1,
            valor: existing.valor + (item.valorTotal ?? 0),
        });
    }

    const porTipoAtividade = Array.from(porTipoMap.entries()).map(([tipo, data]) => ({
        tipo: tipo as any,
        label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo as keyof typeof TIPO_ATIVIDADE_FATURAMENTO_LABELS] ?? tipo,
        ...data,
    }));

    return {
        totalMinutos,
        totalHoras,
        totalValor,
        totalLancamentos: items.length,
        porStatus,
        porTipoAtividade,
    };
}

/**
 * Lista clientes disponíveis
 */
export async function mockListClientes(q?: string): Promise<ClienteOption[]> {
    await delay(100);
    if (q) {
        const query = q.toLowerCase();
        return MOCK_CLIENTES.filter(c => c.nome.toLowerCase().includes(query));
    }
    return MOCK_CLIENTES;
}

/**
 * Busca dados do terapeuta logado
 */
export async function mockGetTerapeutaLogado(): Promise<TerapeutaOption> {
    await delay(100);
    return MOCK_TERAPEUTA;
}

/**
 * Aprova lançamento (mock)
 */
export async function mockAprovarLancamento(id: string): Promise<ItemFaturamento | null> {
    await delay();
    const item = MOCK_LANCAMENTOS.find(i => i.id === id);
    if (item) {
        item.status = STATUS_FATURAMENTO.APROVADO;
    }
    return item ?? null;
}

/**
 * Rejeita lançamento (mock)
 */
export async function mockRejeitarLancamento(id: string, _motivo: string): Promise<ItemFaturamento | null> {
    await delay();
    const item = MOCK_LANCAMENTOS.find(i => i.id === id);
    if (item) {
        item.status = STATUS_FATURAMENTO.REJEITADO;
    }
    return item ?? null;
}

/**
 * Calcula resumo de faturamento para o GERENTE
 */
export async function mockGetResumoGerente(
    filters?: FaturamentoListFilters
): Promise<ResumoGerente> {
    await delay();

    // Combinar lançamentos de todos os terapeutas
    const allLancamentos = [...MOCK_LANCAMENTOS, ...MOCK_LANCAMENTOS_OUTROS_TERAPEUTAS];
    
    let items = [...allLancamentos];

    if (filters?.dataInicio) {
        items = items.filter(item => item.data >= filters.dataInicio!);
    }
    if (filters?.dataFim) {
        items = items.filter(item => item.data <= filters.dataFim!);
    }

    // Calcular estatísticas
    const pendentes = items.filter(i => i.status === STATUS_FATURAMENTO.PENDENTE);
    const aprovados = items.filter(i => i.status === STATUS_FATURAMENTO.APROVADO);

    const totalMinutos = items.reduce((acc, item) => acc + item.duracaoMinutos, 0);
    const horas = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    const totalHoras = mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;

    // Contar terapeutas e clientes únicos
    const terapeutasUnicos = new Set(items.map(i => i.terapeutaId));
    const clientesUnicos = new Set(items.filter(i => i.clienteId).map(i => i.clienteId));

    // Top pendentes por terapeuta
    const pendentesPorTerapeuta: Record<string, { nome: string; avatarUrl?: string; total: number; valor: number }> = {};
    for (const item of pendentes) {
        if (!pendentesPorTerapeuta[item.terapeutaId]) {
            pendentesPorTerapeuta[item.terapeutaId] = {
                nome: item.terapeutaNome,
                avatarUrl: item.terapeutaAvatarUrl,
                total: 0,
                valor: 0,
            };
        }
        pendentesPorTerapeuta[item.terapeutaId].total += 1;
        pendentesPorTerapeuta[item.terapeutaId].valor += item.valorTotal ?? 0;
    }

    const topPendentes = Object.entries(pendentesPorTerapeuta)
        .map(([id, data]) => ({
            terapeutaId: id,
            terapeutaNome: data.nome,
            terapeutaAvatarUrl: data.avatarUrl,
            totalPendentes: data.total,
            valorPendente: data.valor,
        }))
        .sort((a, b) => b.totalPendentes - a.totalPendentes)
        .slice(0, 5);

    // Calcular valores separados: terapeuta (pagar) vs cliente (receber)
    const totalValorTerapeuta = items.reduce((acc, item) => acc + (item.valorTotal ?? 0), 0);
    const totalValorCliente = items.reduce((acc, item) => acc + (item.valorTotalCliente ?? item.valorTotal ?? 0), 0);
    
    const valorPendenteTerapeuta = pendentes.reduce((acc, item) => acc + (item.valorTotal ?? 0), 0);
    const valorPendenteCliente = pendentes.reduce((acc, item) => acc + (item.valorTotalCliente ?? item.valorTotal ?? 0), 0);
    
    const valorAprovadoTerapeuta = aprovados.reduce((acc, item) => acc + (item.valorTotal ?? 0), 0);
    const valorAprovadoCliente = aprovados.reduce((acc, item) => acc + (item.valorTotalCliente ?? item.valorTotal ?? 0), 0);

    return {
        totalTerapeutas: terapeutasUnicos.size,
        totalClientes: clientesUnicos.size,
        totalHoras,
        
        // Valores separados
        totalValorTerapeuta,
        totalValorCliente,
        
        // Pendentes
        pendentesAprovacao: pendentes.length,
        valorPendenteTerapeuta,
        valorPendenteCliente,
        
        // Aprovados
        aprovadosPeriodo: aprovados.length,
        valorAprovadoTerapeuta,
        valorAprovadoCliente,
        
        topPendentes,
    };
}

// Exporta todos os lançamentos para uso no gerente
export function getAllMockLancamentos(): ItemFaturamento[] {
    return [...MOCK_LANCAMENTOS, ...MOCK_LANCAMENTOS_OUTROS_TERAPEUTAS];
}
