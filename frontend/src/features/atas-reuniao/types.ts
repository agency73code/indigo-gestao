import { z } from 'zod';

// ============================================
// ENUMS E CONSTANTES
// ============================================

export const FINALIDADE_REUNIAO = {
    ORIENTACAO_PARENTAL: 'orientacao_parental',
    REUNIAO_EQUIPE: 'reuniao_equipe',
    REUNIAO_OUTRO_ESPECIALISTA: 'reuniao_outro_especialista',
    REUNIAO_ESCOLA: 'reuniao_escola',
    SUPERVISAO_AT: 'supervisao_at',
    SUPERVISAO_TERAPEUTA: 'supervisao_terapeuta',
    OUTROS: 'outros',
} as const;

export type FinalidadeReuniao = (typeof FINALIDADE_REUNIAO)[keyof typeof FINALIDADE_REUNIAO];

export const FINALIDADE_LABELS: Record<FinalidadeReuniao, string> = {
    [FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL]: 'Orientação Parental',
    [FINALIDADE_REUNIAO.REUNIAO_EQUIPE]: 'Reunião de Equipe',
    [FINALIDADE_REUNIAO.REUNIAO_OUTRO_ESPECIALISTA]: 'Reunião com Outro Especialista',
    [FINALIDADE_REUNIAO.REUNIAO_ESCOLA]: 'Reunião com a Escola',
    [FINALIDADE_REUNIAO.SUPERVISAO_AT]: 'Supervisão do AT',
    [FINALIDADE_REUNIAO.SUPERVISAO_TERAPEUTA]: 'Supervisão do Terapeuta',
    [FINALIDADE_REUNIAO.OUTROS]: 'Outros',
};

export const MODALIDADE_REUNIAO = {
    ONLINE: 'online',
    PRESENCIAL: 'presencial',
} as const;

export type ModalidadeReuniao = (typeof MODALIDADE_REUNIAO)[keyof typeof MODALIDADE_REUNIAO];

export const MODALIDADE_LABELS: Record<ModalidadeReuniao, string> = {
    [MODALIDADE_REUNIAO.ONLINE]: 'Online',
    [MODALIDADE_REUNIAO.PRESENCIAL]: 'Presencial',
};

export const TIPO_PARTICIPANTE = {
    FAMILIA: 'familia',
    PROFISSIONAL_EXTERNO: 'profissional_externo',
    PROFISSIONAL_CLINICA: 'profissional_clinica',
} as const;

export type TipoParticipante = (typeof TIPO_PARTICIPANTE)[keyof typeof TIPO_PARTICIPANTE];

export const TIPO_PARTICIPANTE_LABELS: Record<TipoParticipante, string> = {
    [TIPO_PARTICIPANTE.FAMILIA]: 'Família/Responsável',
    [TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO]: 'Profissional Externo',
    [TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA]: 'Profissional da Clínica',
};

// ============================================
// INTERFACES E TIPOS
// ============================================

/** Cabeçalho da ata - apenas terapeutaId é salvo, restante derivado */
export interface CabecalhoAta {
    terapeutaId: string;
    terapeutaNome: string;
    conselhoNumero?: string;
    conselhoTipo?: string;
    profissao?: string;
    cargo?: string; 
}

/** Salvos: id, tipo, nome, descricao, terapeutaId | Derivados: especialidade, cargo */
export interface Participante {
    id: string;
    tipo: TipoParticipante;
    nome: string;
    descricao?: string;
    terapeutaId?: string;
    especialidade?: string;
    cargo?: string;
}

/** Link de recomendação (brinquedos, materiais, etc.) */
export interface LinkRecomendacao {
    id: string;
    titulo: string;
    url: string;
}

/** Dados do formulário - clienteNome é derivado, restante salvo */
export interface AtaFormData {
    data: string; // YYYY-MM-DD
    horarioInicio: string; // HH:mm
    horarioFim: string; // HH:mm
    finalidade: FinalidadeReuniao;
    finalidadeOutros?: string;
    modalidade: ModalidadeReuniao;
    participantes: Participante[];
    conteudo: string;
    clienteId?: string;
    clienteNome?: string;
    links?: LinkRecomendacao[];
}

/** Anexo - url é derivado */
export interface Anexo {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    arquivoId?: string;
}

export interface AtaReuniao extends AtaFormData {
    id: string;
    cabecalho: CabecalhoAta;
    status: 'rascunho' | 'finalizada';
    criadoEm: string;
    atualizadoEm: string;
    resumoIA?: string;
    anexos?: Anexo[];
    /** Calculado pelo backend */
    duracaoMinutos?: number;
    /** Calculado pelo backend */
    horasFaturadas?: number;
}

/** Filtros para listagem de atas */
export interface AtaListFilters {
    q?: string; // Busca textual
    finalidade?: FinalidadeReuniao | 'all';
    dataInicio?: string; // ISO date
    dataFim?: string; // ISO date
    clienteId?: string;
    orderBy?: 'recent' | 'oldest'; // Ordenação
    page?: number;
    pageSize?: number;
}

/** Resposta paginada da listagem */
export interface AtaListResponse {
    items: AtaReuniao[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/** Anexo com arquivo para upload */
export interface AnexoUpload {
    id: string;
    file: File;
    nome: string;
}

export interface CreateAtaInput {
    formData: AtaFormData;
    cabecalho: CabecalhoAta;
    anexos?: AnexoUpload[];
    status?: 'rascunho' | 'finalizada';
}

export interface UpdateAtaInput {
    formData: Partial<AtaFormData>;
    anexos?: AnexoUpload[];
    status?: 'rascunho' | 'finalizada';
}

export interface TerapeutaOption {
    id: string;
    nome: string;
    especialidade?: string;
    cargo?: string;
    conselho?: string;
    registroConselho?: string;
}

export interface ClienteOption {
    id: string;
    nome: string;
}

// ============================================
// SCHEMAS ZOD
// ============================================

export const participanteSchema = z.object({
    id: z.string().min(1),
    tipo: z.enum([
        TIPO_PARTICIPANTE.FAMILIA,
        TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
        TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
    ]),
    nome: z.string().min(1, 'Nome é obrigatório'),
    descricao: z.string().optional(),
    terapeutaId: z.string().optional(),
    especialidade: z.string().optional(),
    cargo: z.string().optional(),
});

export const ataFormSchema = z.object({
    data: z.string().min(1, 'Data é obrigatória'),
    horarioInicio: z.string().min(1, 'Horário de início é obrigatório'),
    horarioFim: z.string().min(1, 'Horário de término é obrigatório'),
    finalidade: z.enum([
        FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
        FINALIDADE_REUNIAO.REUNIAO_EQUIPE,
        FINALIDADE_REUNIAO.REUNIAO_OUTRO_ESPECIALISTA,
        FINALIDADE_REUNIAO.REUNIAO_ESCOLA,
        FINALIDADE_REUNIAO.SUPERVISAO_AT,
        FINALIDADE_REUNIAO.SUPERVISAO_TERAPEUTA,
        FINALIDADE_REUNIAO.OUTROS,
    ]),
    finalidadeOutros: z.string().optional(),
    modalidade: z.enum([MODALIDADE_REUNIAO.ONLINE, MODALIDADE_REUNIAO.PRESENCIAL]),
    participantes: z.array(participanteSchema).min(1, 'Adicione pelo menos um participante'),
    conteudo: z.string().min(10, 'Descreva os tópicos e condutas da reunião'),
    clienteId: z.string().optional(),
    clienteNome: z.string().optional(),
}).refine(
    (data) => {
        if (data.finalidade === FINALIDADE_REUNIAO.OUTROS) {
            return data.finalidadeOutros && data.finalidadeOutros.trim().length > 0;
        }
        return true;
    },
    {
        message: 'Descreva a finalidade da reunião',
        path: ['finalidadeOutros'],
    }
);

export type AtaFormSchema = z.infer<typeof ataFormSchema>;
