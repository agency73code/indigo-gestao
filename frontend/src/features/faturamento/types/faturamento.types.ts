/**
 * ============================================================================
 * TIPOS DE FATURAMENTO - BASEADO EM SESSÕES E ATAS
 * ============================================================================
 * 
 * Novos tipos para o sistema de faturamento que consulta dados reais
 * de sessões e atas de reunião cadastradas no sistema.
 * 
 * FONTES DE DADOS:
 * - Sessões: consultas, homecare (via OCP)
 * - Atas: reuniões, supervisões, desenvolvimento de materiais
 * ============================================================================
 */

// ============================================
// TIPOS DE LANÇAMENTO
// ============================================

/**
 * Origem do lançamento de faturamento
 */
export const ORIGEM_LANCAMENTO = {
    SESSAO: 'sessao',
    ATA: 'ata',
} as const;

export type OrigemLancamento = (typeof ORIGEM_LANCAMENTO)[keyof typeof ORIGEM_LANCAMENTO];

/**
 * Tipos de atividade para faturamento (unifica sessões e atas)
 */
export const TIPO_ATIVIDADE_FATURAMENTO = {
    // Sessões
    CONSULTORIO: 'consultorio',
    HOMECARE: 'homecare',
    // Atas
    REUNIAO: 'reuniao',
    SUPERVISAO_RECEBIDA: 'supervisao_recebida',
    SUPERVISAO_DADA: 'supervisao_dada',
    DESENVOLVIMENTO_MATERIAIS: 'desenvolvimento_materiais',
} as const;

export type TipoAtividadeFaturamento = (typeof TIPO_ATIVIDADE_FATURAMENTO)[keyof typeof TIPO_ATIVIDADE_FATURAMENTO];

export const TIPO_ATIVIDADE_FATURAMENTO_LABELS: Record<TipoAtividadeFaturamento, string> = {
    [TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO]: 'Consultório',
    [TIPO_ATIVIDADE_FATURAMENTO.HOMECARE]: 'Homecare',
    [TIPO_ATIVIDADE_FATURAMENTO.REUNIAO]: 'de Reuniões',
    [TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_RECEBIDA]: 'Supervisão Recebida',
    [TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_DADA]: 'Supervisão Dada',
    [TIPO_ATIVIDADE_FATURAMENTO.DESENVOLVIMENTO_MATERIAIS]: 'Desenv. Materiais',
};

/**
 * Cores para cada tipo de atividade de faturamento
 * Usar em badges, tags e indicadores visuais
 */
export const TIPO_ATIVIDADE_FATURAMENTO_COLORS: Record<TipoAtividadeFaturamento, { bg: string; text: string; border?: string }> = {
    [TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO]: { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
    },
    [TIPO_ATIVIDADE_FATURAMENTO.HOMECARE]: { 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800'
    },
    [TIPO_ATIVIDADE_FATURAMENTO.REUNIAO]: { 
        bg: 'bg-violet-100 dark:bg-violet-900/30', 
        text: 'text-violet-700 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800'
    },
    [TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_RECEBIDA]: { 
        bg: 'bg-amber-100 dark:bg-amber-900/30', 
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800'
    },
    [TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_DADA]: { 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
    },
    [TIPO_ATIVIDADE_FATURAMENTO.DESENVOLVIMENTO_MATERIAIS]: { 
        bg: 'bg-pink-100 dark:bg-pink-900/30', 
        text: 'text-pink-700 dark:text-pink-400',
        border: 'border-pink-200 dark:border-pink-800'
    },
};

/**
 * Status do lançamento no fluxo de aprovação
 */
export const STATUS_FATURAMENTO = {
    PENDENTE: 'pendente',
    APROVADO: 'aprovado',
    REJEITADO: 'rejeitado',
} as const;

export type StatusFaturamento = (typeof STATUS_FATURAMENTO)[keyof typeof STATUS_FATURAMENTO];

export const STATUS_FATURAMENTO_LABELS: Record<StatusFaturamento, string> = {
    [STATUS_FATURAMENTO.PENDENTE]: 'Pendente',
    [STATUS_FATURAMENTO.APROVADO]: 'Aprovado',
    [STATUS_FATURAMENTO.REJEITADO]: 'Rejeitado',
};

export const STATUS_FATURAMENTO_COLORS: Record<StatusFaturamento, { bg: string; text: string }> = {
    [STATUS_FATURAMENTO.PENDENTE]: { bg: 'bg-amber-100', text: 'text-amber-700' },
    [STATUS_FATURAMENTO.APROVADO]: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    [STATUS_FATURAMENTO.REJEITADO]: { bg: 'bg-red-100', text: 'text-red-700' },
};

// ============================================
// INTERFACES DE LANÇAMENTO
// ============================================

/**
 * Item de faturamento unificado (sessão ou ata)
 */
export interface ItemFaturamento {
    /** ID único (prefixado com origem: sessao_123 ou ata_456) */
    id: string;
    /** ID original no sistema de origem */
    origemId: number | string;
    /** Origem do lançamento */
    origem: OrigemLancamento;
    
    // Relacionamentos
    terapeutaId: string;
    terapeutaNome: string;
    terapeutaAvatarUrl?: string;
    
    clienteId?: string;
    clienteNome?: string;
    clienteIdade?: string;
    clienteAvatarUrl?: string;
    
    // Data e horários
    data: string; // YYYY-MM-DD
    horarioInicio: string; // HH:mm
    horarioFim: string; // HH:mm
    
    // Tipo de atividade
    tipoAtividade: TipoAtividadeFaturamento;
    
    // Valores calculados - TERAPEUTA (quanto a clínica paga ao terapeuta)
    duracaoMinutos: number;
    valorHora?: number;
    valorTotal?: number;
    
    // ============================================
    // VALORES DO CLIENTE (quanto o cliente paga à clínica)
    // Baseado no campo valor_hora_sessao do vínculo
    // ============================================
    
    /** Valor hora da sessão para o cliente (do vínculo) */
    valorHoraCliente?: number;
    
    /** Valor total que o cliente deve pagar */
    valorTotalCliente?: number;
    
    // Status
    status: StatusFaturamento;
    
    // Metadados adicionais
    area?: string; // Para sessões: fonoaudiologia, fisioterapia, etc.
    finalidade?: string; // Para atas: orientacao_parental, reuniao_equipe, etc.
    programaNome?: string; // Para sessões: nome do programa
    
    // ============================================
    // DADOS DE AJUDA DE CUSTO (Homecare/Ata)
    // ============================================
    
    /** Indica se há ajuda de custo solicitada */
    temAjudaCusto?: boolean;
    
    /** Descrição/motivo dos gastos informado pelo terapeuta */
    motivoAjudaCusto?: string;
    
    /** Valor da ajuda de custo definido pela gestão na aprovação */
    valorAjudaCusto?: number;
    
    /** Arquivos de comprovante de ajuda de custo */
    comprovantesAjudaCusto?: ArquivoComprovante[];
    
    // ============================================
    // DADOS DE REJEIÇÃO
    // ============================================
    
    /** Motivo da rejeição (preenchido quando status = REJEITADO) */
    motivoRejeicao?: string;
    
    // ============================================
    // DADOS DE FATURAMENTO DETALHADOS
    // ============================================
    
    /** Dados completos de faturamento (para sessões) */
    faturamento?: import('@/features/programas/core/types/billing').DadosFaturamentoSessao;
    
    // Timestamps
    criadoEm: string;
}

/**
 * Arquivo de comprovante de ajuda de custo
 */
export interface ArquivoComprovante {
    id: string;
    nome: string;
    url: string;
    tipo: string; // image/jpeg, application/pdf, etc.
    tamanho?: number;
}

// ============================================
// FILTROS E PAGINAÇÃO
// ============================================

/** Filtros para listagem de faturamento */
export interface FaturamentoListFilters {
    q?: string;
    terapeutaId?: string;
    clienteId?: string;
    tipoAtividade?: TipoAtividadeFaturamento | 'all';
    origem?: OrigemLancamento | 'all';
    status?: StatusFaturamento | 'all';
    dataInicio?: string;
    dataFim?: string;
    orderBy?: 'recent' | 'oldest';
    page?: number;
    pageSize?: number;
}

/** Resposta paginada da listagem */
export interface FaturamentoListResponse {
    items: ItemFaturamento[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// RESUMOS E ESTATÍSTICAS
// ============================================

/** Resumo de faturamento */
export interface ResumoFaturamento {
    totalMinutos: number;
    totalHoras: string; // Formatado: "8h 45min"
    totalValor: number;
    totalLancamentos: number;
    
    porStatus: {
        pendentes: number;
        aprovados: number;
        rejeitados: number;
    };
    
    porTipoAtividade: {
        tipo: TipoAtividadeFaturamento;
        label: string;
        minutos: number;
        quantidade: number;
        valor: number;
    }[];
}

// ============================================
// OPÇÕES DE SELECT
// ============================================

/** Opção de cliente para select/combobox */
export interface ClienteOption {
    id: string;
    nome: string;
    avatarUrl?: string;
}

/** Opção de terapeuta para select/combobox */
export interface TerapeutaOption {
    id: string;
    nome: string;
    avatarUrl?: string;
}

// ============================================
// GRUPO POR CLIENTE
// ============================================

/** Agrupamento de lançamentos por cliente */
export interface ClienteGroup {
    clienteId: string;
    clienteNome: string;
    clienteAvatarUrl?: string;
    lancamentos: ItemFaturamento[];
    totalMinutos: number;
    /** Valor total que o cliente paga à clínica (valorTotalCliente) */
    totalValor: number;
    /** Valor total que a clínica paga ao terapeuta (valorTotal) */
    totalValorTerapeuta: number;
    totalLancamentos: number;
    totalPendentes: number;
    totalAprovados: number;
}

/** Agrupamento de lançamentos por terapeuta (para visão do gerente) */
export interface TerapeutaGroup {
    terapeutaId: string;
    terapeutaNome: string;
    terapeutaAvatarUrl?: string;
    lancamentos: ItemFaturamento[];
    totalMinutos: number;
    /** Valor total que a clínica paga ao terapeuta */
    totalValor: number;
    totalLancamentos: number;
    totalPendentes: number;
    totalAprovados: number;
}

/** Resumo para cards de estatísticas do gerente */
export interface ResumoGerente {
    // Totais gerais
    totalTerapeutas: number;
    totalClientes: number;
    totalHoras: string;
    
    // ============================================
    // VALORES DO TERAPEUTA (quanto a clínica paga)
    // ============================================
    
    /** Valor total a pagar para terapeutas */
    totalValorTerapeuta: number;
    
    // ============================================
    // VALORES DO CLIENTE (quanto a clínica recebe)
    // ============================================
    
    /** Valor total a receber de clientes */
    totalValorCliente: number;
    
    // ============================================
    // PENDENTES DE APROVAÇÃO
    // ============================================
    
    pendentesAprovacao: number;
    
    /** Valor pendente a pagar para terapeutas */
    valorPendenteTerapeuta: number;
    
    /** Valor pendente a receber de clientes (previsão) */
    valorPendenteCliente: number;
    
    // ============================================
    // APROVADOS NO PERÍODO
    // ============================================
    
    aprovadosPeriodo: number;
    
    /** Valor aprovado a pagar para terapeutas */
    valorAprovadoTerapeuta: number;
    
    /** Valor aprovado a receber de clientes */
    valorAprovadoCliente: number;
    
    // Por terapeuta (top 5 com mais pendentes)
    topPendentes: {
        terapeutaId: string;
        terapeutaNome: string;
        terapeutaAvatarUrl?: string;
        totalPendentes: number;
        valorPendente: number;
    }[];
    
    /** Por tipo de atividade (vindo do backend) */
    porTipoAtividade?: {
        tipo: string;
        label: string;
        minutos: number;
        quantidade: number;
        valor: number;
    }[];
}

// ============================================
// TIPOS DE INPUT PARA AÇÕES
// ============================================

/** Input para aprovação individual */
export interface AprovarLancamentoInput {
    valorAjudaCusto?: number;
    valorTotalCliente?: number;
}

/** Input para rejeição */
export interface RejeitarLancamentoInput {
    motivo: string;
}

/** Input para aprovação em lote */
export interface AprovarLoteInput {
    ids: string[];
    /** Mapa de ID do lançamento -> valor que o cliente paga */
    valoresCliente?: Record<string, number>;
}
