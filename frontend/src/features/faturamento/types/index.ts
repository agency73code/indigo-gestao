import { z } from 'zod';

// ============================================
// ENUMS E CONSTANTES
// ============================================

/**
 * Tipos de atividade para faturamento
 * Correspondem aos valores cadastrados no perfil do terapeuta
 */
export const TIPO_ATIVIDADE = {
    SESSAO_CONSULTORIO: 'sessao_consultorio',
    SESSAO_HOMECARE: 'sessao_homecare',
    DESENVOLVIMENTO_MATERIAIS: 'desenvolvimento_materiais',
    SUPERVISAO_RECEBIDA: 'supervisao_recebida',
    SUPERVISAO_DADA: 'supervisao_dada',
    REUNIAO: 'reuniao',
} as const;

export type TipoAtividade = (typeof TIPO_ATIVIDADE)[keyof typeof TIPO_ATIVIDADE];

export const TIPO_ATIVIDADE_LABELS: Record<TipoAtividade, string> = {
    [TIPO_ATIVIDADE.SESSAO_CONSULTORIO]: 'Sessão em Consultório',
    [TIPO_ATIVIDADE.SESSAO_HOMECARE]: 'Sessão em Homecare',
    [TIPO_ATIVIDADE.DESENVOLVIMENTO_MATERIAIS]: 'Hora Desenvolvimento Materiais',
    [TIPO_ATIVIDADE.SUPERVISAO_RECEBIDA]: 'Hora Supervisão Recebida',
    [TIPO_ATIVIDADE.SUPERVISAO_DADA]: 'Hora Supervisão Dada',
    [TIPO_ATIVIDADE.REUNIAO]: 'Hora de Reuniões',
};

/**
 * Status do lançamento no fluxo de aprovação
 */
export const STATUS_LANCAMENTO = {
    PENDENTE: 'pendente',
    APROVADO: 'aprovado',
    REJEITADO: 'rejeitado',
} as const;

export type StatusLancamento = (typeof STATUS_LANCAMENTO)[keyof typeof STATUS_LANCAMENTO];

export const STATUS_LANCAMENTO_LABELS: Record<StatusLancamento, string> = {
    [STATUS_LANCAMENTO.PENDENTE]: 'Pendente',
    [STATUS_LANCAMENTO.APROVADO]: 'Aprovado',
    [STATUS_LANCAMENTO.REJEITADO]: 'Rejeitado',
};

export const STATUS_LANCAMENTO_COLORS: Record<StatusLancamento, { bg: string; text: string }> = {
    [STATUS_LANCAMENTO.PENDENTE]: { bg: 'bg-amber-100', text: 'text-amber-700' },
    [STATUS_LANCAMENTO.APROVADO]: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    [STATUS_LANCAMENTO.REJEITADO]: { bg: 'bg-red-100', text: 'text-red-700' },
};

// ============================================
// INTERFACES AUXILIARES
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
    /** Valores por tipo de atividade configurados no cadastro */
    valoresPorAtividade?: ValoresTerapeuta;
}

/** Valores configurados no cadastro do terapeuta */
export interface ValoresTerapeuta {
    sessaoConsultorio: number;
    sessaoHomecare: number;
    desenvolvimentoMateriais: number;
    supervisaoRecebida: number;
    supervisaoDada: number;
    reuniao: number;
}

/** Anexo de lançamento */
export interface AnexoLancamento {
    id: string;
    nome: string;
    tamanho: number;
    tipo: string;
    url?: string;
    arquivoId?: string;
}

/** Anexo para upload */
export interface AnexoUpload {
    id: string;
    file: File;
    nome: string;
}

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Lançamento de horas/sessão
 * Estrutura principal do registro de faturamento
 */
export interface Lancamento {
    id: string;
    
    // Relacionamentos
    terapeutaId: string;
    terapeutaNome: string;
    terapeutaAvatarUrl?: string;
    
    clienteId: string;
    clienteNome: string;
    clienteAvatarUrl?: string;
    
    // Data e horários
    data: string; // YYYY-MM-DD
    horarioInicio: string; // HH:mm
    horarioFim: string; // HH:mm
    
    // Tipo de atividade
    tipoAtividade: TipoAtividade;
    isHomecare: boolean;
    
    // Valores (calculados)
    duracaoMinutos: number;
    valorHora: number;
    valorTotal: number;
    
    // Informações adicionais
    observacoes?: string;
    
    // Anexos
    anexos?: AnexoLancamento[];
    
    // Status e controle
    status: StatusLancamento;
    motivoRejeicao?: string;
    
    // Timestamps
    criadoEm: string;
    atualizadoEm: string;
    aprovadoEm?: string;
    aprovadoPor?: string;
}

/**
 * Input para criação de lançamento
 */
export interface CreateLancamentoInput {
    clienteId: string;
    data: string;
    horarioInicio: string;
    horarioFim: string;
    tipoAtividade: TipoAtividade;
    isHomecare: boolean;
    observacoes?: string;
    anexos?: AnexoUpload[];
}

/**
 * Input para atualização de lançamento
 */
export interface UpdateLancamentoInput {
    clienteId?: string;
    data?: string;
    horarioInicio?: string;
    horarioFim?: string;
    tipoAtividade?: TipoAtividade;
    isHomecare?: boolean;
    observacoes?: string;
    anexos?: AnexoUpload[];
    status?: StatusLancamento;
    motivoRejeicao?: string;
}

// ============================================
// FILTROS E PAGINAÇÃO
// ============================================

/** Filtros para listagem de lançamentos */
export interface LancamentoListFilters {
    q?: string;
    terapeutaId?: string;
    clienteId?: string;
    tipoAtividade?: TipoAtividade | 'all';
    status?: StatusLancamento | 'all';
    dataInicio?: string;
    dataFim?: string;
    orderBy?: 'recent' | 'oldest';
    page?: number;
    pageSize?: number;
}

/** Resposta paginada da listagem */
export interface LancamentoListResponse {
    items: Lancamento[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// RESUMOS E ESTATÍSTICAS
// ============================================

/** Resumo de horas do terapeuta */
export interface ResumoHorasTerapeuta {
    totalHoras: number;
    totalMinutos: number;
    totalSessoes: number;
    totalValor: number;
    
    // Por tipo de atividade
    porTipoAtividade: {
        tipo: TipoAtividade;
        horas: number;
        minutos: number;
        sessoes: number;
        valor: number;
    }[];
    
    // Por status
    porStatus: {
        pendentes: number;
        aprovados: number;
        rejeitados: number;
    };
    
    // Período
    periodoInicio: string;
    periodoFim: string;
}

/** Resumo para gestão (gerente) */
export interface ResumoGestao {
    totalLancamentos: number;
    totalHoras: number;
    totalValor: number;
    
    pendentesAprovacao: number;
    aprovadosNoMes: number;
    
    // Por terapeuta
    porTerapeuta: {
        terapeutaId: string;
        terapeutaNome: string;
        totalHoras: number;
        totalValor: number;
        lancamentos: number;
    }[];
    
    // Por cliente
    porCliente: {
        clienteId: string;
        clienteNome: string;
        totalHoras: number;
        totalValor: number;
        sessoes: number;
    }[];
}

// ============================================
// SCHEMAS ZOD
// ============================================

export const lancamentoFormSchema = z.object({
    clienteId: z.string().min(1, 'Cliente é obrigatório'),
    data: z.string().min(1, 'Data é obrigatória'),
    horarioInicio: z.string().min(1, 'Horário de início é obrigatório'),
    horarioFim: z.string().min(1, 'Horário de término é obrigatório'),
    tipoAtividade: z.enum([
        TIPO_ATIVIDADE.SESSAO_CONSULTORIO,
        TIPO_ATIVIDADE.SESSAO_HOMECARE,
        TIPO_ATIVIDADE.DESENVOLVIMENTO_MATERIAIS,
        TIPO_ATIVIDADE.SUPERVISAO_RECEBIDA,
        TIPO_ATIVIDADE.SUPERVISAO_DADA,
        TIPO_ATIVIDADE.REUNIAO,
    ], {
        required_error: 'Tipo de atividade é obrigatório',
    }),
    isHomecare: z.boolean().default(false),
    observacoes: z.string().optional(),
}).refine(
    (data) => {
        if (!data.horarioInicio || !data.horarioFim) return true;
        const [hInicio, mInicio] = data.horarioInicio.split(':').map(Number);
        const [hFim, mFim] = data.horarioFim.split(':').map(Number);
        const inicioMinutos = hInicio * 60 + mInicio;
        const fimMinutos = hFim * 60 + mFim;
        return fimMinutos > inicioMinutos;
    },
    {
        message: 'Horário de término deve ser posterior ao início',
        path: ['horarioFim'],
    }
);

export type LancamentoFormSchema = z.infer<typeof lancamentoFormSchema>;

// ============================================
// EXPORTS DE TYPES LEGADOS (compatibilidade)
// ============================================

/** @deprecated Use Lancamento */
export type BillingEntry = Lancamento;

/** @deprecated Use CreateLancamentoInput */
export type BillingEntryInput = CreateLancamentoInput;
