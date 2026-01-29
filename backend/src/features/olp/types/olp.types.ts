import type { Prisma } from "@prisma/client";

export type createOCP = {
    patientId: string;
    therapistId: string;
    name: string | null;
    prazoInicio: string;
    prazoFim: string;
    goalTitle: string;
    goalDescription?: string | null;
    criteria?: string | null;
    shortTermGoalDescription: string | null;
    stimuliApplicationDescription: string | null;
    notes?: string | null;
    stimuli: {
        label: string;
        active: boolean;
        order: number;
        description?: string | null;
        metodos?: string | null;
        tecnicasProcedimentos?: string | null;
    }[];
};

export type TOcreateOCP = {
    currentPerformanceLevel?: string | null;
};

export type CreateProgramPayload =
    | (createOCP & { area: 'fonoaudiologia' | 'psicopedagogia' | 'terapia-aba' | 'musicoterapia' })
    | (createOCP & { area: 'terapia-ocupacional' } & TOcreateOCP);

export type OcpStimuloDTO = {
    id_estimulo: number;
    nome: string | null;
    status: boolean;
    descricao: string | null;
    metodos?: string | null;
    tecnicas_procedimentos?: string | null;
};

export type OcpDetailDTO = {
    id: number;
    nome_programa: string;
    cliente_id: string;
    cliente: {
        nome: string | null;
        dataNascimento: Date | null;
        cuidadores: { nome: string | null }[]; // take: 1, mas tipa como array
    };
    data_inicio: Date;
    data_fim: Date;
    terapeuta_id: string;
    terapeuta: { nome: string };
    criado_em: Date;
    objetivo_programa: string | null;
    objetivo_descricao: string | null;
    descricao_aplicacao: string | null;
    objetivo_curto: string | null;
    estimulo_ocp?: OcpStimuloDTO[];
    criterio_aprendizagem: string | null;
    observacao_geral: string | null;
    status: string;
    desempenho_atual: string | null;
};

export type CreateSpeechSessionInput = {
    programId: number;
    patientId: string;
    therapistId: string;
    notes: string | null;
    attempts: {
        stimulusId: string;
        attemptNumber: number;
        type: 'error' | 'prompted' | 'independent';
    }[];
    files: Express.Multer.File[];
    area: string;
};

type BaseCreateSessionInput<TAttempt> = {
    programId: number;
    patientId: string;
    therapistId: string;
    notes?: string;

    files: Express.Multer.File[];
    area: string;

    attempts: TAttempt[];
};

type BaseSessionAttempt = {
    attemptNumber: number;
    activityId: string;
    type: string;
};

export type CreateToSessionInput = {
    programId: number;
    patientId: string;
    therapistId: string;
    notes?: string;
    attempts: Array<{
        attemptNumber: number;
        activityId: string;
        type: string;
        timestamp: string;
        durationMinutes?: number;
    }>;
    files: Express.Multer.File[];
    area: string;
};

export type PhysiotherapySessionAttempt = {
    attemptNumber: number;
    activityId: string;
    type: string;
    timestamp: string;
    durationMinutes?: number;

    // Campos específicos de Fisioterapia
    usedLoad?: boolean;
    loadValue?: string;
    hadDiscomfort?: boolean;
    discomfortDescription?: string;
    hadCompensation?: boolean;
    compensationDescription?: string;
};

export type CreatePhysiotherapySessionInput = {
    programId: number;
    patientId: string;
    therapistId: string;
    notes?: string;

    attempts: PhysiotherapySessionAttempt[];

    files: Express.Multer.File[];
    area: string;
};

type MusictherapySessionAttempt =
    BaseSessionAttempt & {
        participacao: number;
        suporte: number;
    };

export type CreateMusictherapySessionInput =
    BaseCreateSessionInput<MusictherapySessionAttempt>;

export type CreateSessionInDatabaseInput = {
  programId: number;
  patientId: string;
  therapistId: string;
  notes?: string | null | undefined;
  area: string;
  trialsData: Prisma.sessao_trialUncheckedCreateWithoutSessaoInput[];
  uploadedFiles: {
    nome: string;
    caminho: string;
    tamanho: number;
  }[];
};

export type UpdateProgramInput = {
    id: number;
    name: string;
    goalTitle?: string | null | undefined;
    goalDescription?: string | null | undefined;
    shortTermGoalDescription?: string | null | undefined;
    stimuliApplicationDescription?: string | null | undefined;
    currentPerformanceLevel?: string | null | undefined;
    stimuli: {
        id?: string | undefined;
        label: string;
        description?: string | null;
        active: boolean;
        order: number;
    }[];
    criteria?: string | null | undefined;
    notes?: string | null | undefined;
    status: 'active' | 'archived';
    prazoInicio: string;
    prazoFim: string;
};

export type UpdateMusicProgramInput = {
  id: string;
  goalTitle: string;
  goalDescription: string;
  stimuli: {
    id: string;
    order: number;
    active: boolean;
    objetivo: string;
    objetivoEspecifico: string;
    metodos: string;
    tecnicasProcedimentos: string;
  }[];
  notes: string;
  status: 'active' | 'archived';
  prazoInicio: string;
  prazoFim: string;
};

export type ClientRowDTO = {
    id: string;
    nome: string | null;
    dataNascimento: Date | null;
    cuidadores?: { nome: string | null }[];
};

export type ProgramRowDTO = {
    id: number;
    cliente_id: string;
    nome_programa: string | null;
    objetivo_programa: string | null;
    atualizado_em: Date;
    status: string;
};

export interface SessionTrialDTO {
    id: number;
    ordem: number;
    resultado: string;
    duracao_minutos: number | null;

    // Fisioterapia
    teve_desconforto: boolean | null;
    descricao_desconforto: string | null;
    teve_compensacao: boolean | null;
    descricao_compensacao: string | null;
    utilizou_carga: boolean | null;
    valor_carga: number | null;

    //Musicoterapia
    participacao?: number | null;
    suporte?: number | null;

    estimulosOcp: {
        id: number;
        nome: string | null;
    } | null;
};

export interface SessionDTO {
    id: number;
    cliente_id: string;
    terapeuta_id: string;
    data_criacao: Date;
    observacoes_sessao: string | null;
    area: string;
    ocp: {
        id: number;
        nome_programa: string;
        objetivo_programa: string | null;
        criado_em: Date;
    };
    trials: SessionTrialDTO[];
    arquivos: {
        id: number;
        nome: string;
        caminho: string;
        tamanho: number;
    }[];
    faturamentos: {
        id: number;
        inicio_em: Date;
        fim_em: Date;
        tipo_atendimento: 'consultorio' | 'homecare';
        ajuda_custo: boolean | null;
        observacao_faturamento: string | null;
        arquivos: {
            id: number;
            nome: string;
            caminho: string;
            mime_type: string;
            tamanho: number;
        }[];
    }[];
};

export interface Session {
    id: string;
    pacienteId: string;
    terapeutaId: string;
    data: string;
    programId: number;
    programa: string;
    objetivo: string;
    prazoInicio: string | null;
    prazoFim: string | null;
    observacoes: string | null;
    area: string;
    files: {
        id: string;
        name: string;
        fileName: string;
        type: string;
        size: number;
        url: string;
    }[];
    faturamento?: {
        dataSessao: string;
        horarioInicio: string;
        horarioFim: string;
        tipoAtendimento: 'consultorio' | 'homecare';
        ajudaCusto: boolean | null;
        observacaoFaturamento?: string;
        arquivosFaturamento?: {
            id: string;
            nome: string;
            tipo: string;
            tamanho: number;
            url?: string;
            caminho?: string;
        }[];
    };
    registros: {
        tentativa: number;
        resultado: 'acerto' | 'erro' | 'ajuda';
        stimulusId: string | undefined;
        stimulusLabel: string | undefined;
        durationMinutes?: number | null;

        // Fisioterapia
        usedLoad?: boolean;
        loadValue?: number | null;
        hadDiscomfort?: boolean;
        discomfortDescription?: string | null;
        hadCompensation?: boolean;
        compensationDescription?: string | null;

        //Musicoterapia
        participacao?: number | null;
        suporte?: number | null;
    }[];
};

export interface AttentionStimulusItem {
    id: string;
    label: string;
    counts: {
        erro: number;
        ajuda: number;
        indep: number;
    };
    total: number;
    independence: number;
    status: 'atencao' | 'mediano' | 'positivo' | 'insuficiente';
};

export type ListSessionsFilters = {
    clientId: string;
    area: string;
    periodMode: string;
    sort: string;
    page: number;
    pageSize: number;
    q?: string | undefined;
    programId?: number | undefined;
    therapistId?: string | undefined;
    stimulusId?: number | undefined;
    periodStart?: string | undefined;
    periodEnd?: string | undefined;
};

export interface UnmappedSession {
    id: number;
    data_criacao: Date;
    terapeuta?: { nome: string | null } | null;
    trials: { resultado: string; ordem: number }[];
};

export type ProgramSelectResult = {
    id: number;
    nome_programa: string;
    cliente: {
        id: string;
        nome: string | null;
        cuidadores: {
            nome: string | null;
        }[];
        dataNascimento: Date | null;
    };
    terapeuta: {
        id: string;
        nome: string;
    };
    criado_em: Date;
    data_inicio: Date;
    data_fim: Date;
    objetivo_programa: string | null;
    objetivo_descricao: string | null;
    estimulo_ocp: {
        id: number;
        nome: string | null;
        descricao: string | null;
        status: boolean;
        metodos?: string | null;
        tecnicas_procedimentos?: string | null;
    }[];
    status: string;
};

export type KpisFilters = {
    pacienteId?: string;
    periodo: {
        mode: '30d' | '90d' | 'custom';
        start?: string;
        end?: string;
    };
    programaId?: string;
    estimuloId?: string;
    terapeutaId?: string;
    comparar?: boolean;
    area?: string;
};

export type KpisReport = {
    acerto: number; // %
    independencia: number; // %
    tentativas: number;
    sessoes: number;
    assiduidade?: number; // %
    gapIndependencia?: number; // acerto - independencia
};
