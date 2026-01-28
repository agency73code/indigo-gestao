export interface ApiListAtasResponse {
    items: ApiAtaReuniao[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ApiCreateAtaPayload {
    terapeuta_id: string;
    cliente_id: string | null;
    data: string;
    horario_inicio: string;
    horario_fim: string;
    finalidade: string;
    finalidade_outros: string | null;
    modalidade: string;
    conteudo: string;
    participantes: ApiParticipante[];
    links: ApiLink[];
    // Faturamento (ata)
    tipo_faturamento?: string | null;
    observacao_faturamento?: string | null;
    tem_ajuda_custo?: boolean;
    motivo_ajuda_custo?: string | null;
}

export interface ApiAtaReuniao {
    id: string;
    data: string;
    horario_inicio: string;
    horario_fim: string;
    finalidade: string;
    finalidade_outros: string | null;
    modalidade: string;
    conteudo: string;
    cliente_id: string | null;
    terapeuta_id: string;
    status: 'rascunho' | 'finalizada';
    criado_em: string;
    atualizado_em: string;
    resumo_ia: string | null;
    duracao_minutos: number | null;
    horas_faturadas: number | null;
    // Faturamento (ata)
    tipo_faturamento?: string | null;
    observacao_faturamento?: string | null;
    tem_ajuda_custo?: boolean;
    motivo_ajuda_custo?: string | null;
    cliente?: { id: string; nome: string };
    terapeuta?: {
        id: string;
        nome: string;
        registro_profissional?: Array<{
            numero_conselho: string;
            area_atuacao?: { nome: string };
            cargo?: { nome: string };
        }>;
    };
    participantes: ApiParticipante[];
    anexos: ApiAnexo[];
    arquivos_faturamento?: ApiAnexo[];
    links: ApiLink[];
}

export interface ApiParticipante {
    id?: string;
    tipo: string;
    nome: string;
    descricao: string | null;
    terapeuta_id: string | null;
    terapeuta?: {
        nome: string;
        especialidade?: string;
        cargo?: string;
    };
}

export interface ApiAnexo {
    id: string;
    nome: string;
    tamanho: number;
    mime_type: string;
    arquivo_id: string;
}

export interface ApiLink {
    id?: string;
    titulo: string;
    url: string;
}

export interface ApiGerarResumoPayload {
    conteudo: string;
    finalidade: string;
    data: string;
    participantes?: string[];
    terapeuta: string;
    profissao: string;
    cliente?: string;
    horario_inicio?: string;
    horario_fim?: string;
    duracao?: string;
    conselho?: string;
    links?: Array<{ titulo: string; url: string }>;
}

export const API_FINALIDADE = {
    ORIENTACAO_PARENTAL: 'orientacao_parental',
    REUNIAO_EQUIPE: 'reuniao_equipe',
    REUNIAO_OUTRO_ESPECIALISTA: 'reuniao_outro_especialista',
    REUNIAO_ESCOLA: 'reuniao_escola',
    SUPERVISAO_AT: 'supervisao_at',
    SUPERVISAO_TERAPEUTA: 'supervisao_terapeuta',
    OUTROS: 'outros',
} as const;

export const API_MODALIDADE = {
    PRESENCIAL: 'presencial',
    ONLINE: 'online',
} as const;

export const API_TIPO_PARTICIPANTE = {
    FAMILIA: 'familia',
    PROFISSIONAL_EXTERNO: 'profissional_externo',
    PROFISSIONAL_CLINICA: 'profissional_clinica',
} as const;
