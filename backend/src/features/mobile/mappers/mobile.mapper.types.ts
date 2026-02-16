export type BaseTherapist = {
    id: string;
    nome: string;
    email_indigo: string;
    perfil_acesso: string;
    atividade: boolean;
    atualizado_em: Date;
};

export type BaseLink = {
    id: number;
    terapeuta_id: string;
    cliente_id: string;
    area_atuacao_id: number;
    valor_sessao: unknown;
    data_inicio: Date;
    data_fim: Date | null;
    papel: string;
    status: string;
    criado_em: Date;
    atualizado_em: Date;
    cliente: {
        id: string;
        nome: string | null;
        status: string | null;
        emailContato: string | null;
        atualizado_em: Date;
    };
    areaAtuacao: {
        id: number;
        nome: string;
    };
};

export type OcpItem = {
    id: number;
    cliente_id: string;
    terapeuta_id: string;
    nome_programa: string;
    area: string;
    status: string;
    data_inicio: Date;
    data_fim: Date;
    criado_em: Date;
    atualizado_em: Date;
};

export type EstimuloOcpItem = {
    id: number;
    id_estimulo: number;
    id_ocp: number;
    nome: string | null;
    descricao: string | null;
    metodos: string | null;
    tecnicas_procedimentos: string | null;
    status: boolean;
};

export type EstimuloItem = {
    id: number;
    nome: string;
    descricao: string | null;
};

export type SessaoItem = {
    id: number;
    ocp_id: number;
    cliente_id: string;
    terapeuta_id: string;
    area: string;
    observacoes_sessao: string | null;
    data_criacao: Date;
    criado_em: Date;
    atualizado_em: Date;
};

export type SessaoTrialItem = {
    id: number;
    sessao_id: number;
    estimulos_ocp_id: number;
    ordem: number;
    resultado: string;
    duracao_minutos: number | null;
    utilizou_carga: boolean | null;
    valor_carga: number | null;
    teve_desconforto: boolean | null;
    descricao_desconforto: string | null;
    teve_compensacao: boolean | null;
    descricao_compensacao: string | null;
    participacao: number | null;
    suporte: number | null;
};

export type FaturamentoItem = {
    id: number;
    sessao_id: number | null;
    cliente_id: string;
    terapeuta_id: string;
    inicio_em: Date;
    fim_em: Date;
    tipo_atendimento: string;
    status: string;
    ajuda_custo: boolean | null;
    valor_ajuda_custo: unknown | null;
    observacao_faturamento: string | null;
    motivo_rejeicao: string | null;
    criado_em: Date;
    atualizado_em: Date;
};

export type SessaoArquivoItem = {
    id: number;
    sessao_id: number;
    nome: string;
    caminho: string;
    tamanho: number;
    criado_em: Date;
    atualizado_em: Date;
};
