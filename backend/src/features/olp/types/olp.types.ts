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
    }[];
}

export type TOcreateOCP = {
  currentPerformanceLevel?: string | null;
}

export type CreateProgramPayload =
  | (createOCP & { area: 'fonoaudiologia' | 'psicopedagogia' | 'terapia-aba' })
  | (createOCP & { area: 'terapia-ocupacional' } & TOcreateOCP);

export type getOCP = {
  id: string;
  name?: string | null;
  patientId: string;
  patientName: string;
  patientGuardian: string | undefined;
  patientAge?: number | null;
  patientPhotoUrl?: string | null;
  therapistId: string;
  therapistName: string;
  createdAt: string; // ISO
  goalTitle: string;
  goalDescription?: string | null;
  stimuli: { 
    id: string; 
    order: number; 
    label: string; 
    description?: string | null; 
    active: boolean 
  }[];
  criteria?: string | null;
  notes?: string | null;
  status: 'active' | 'archived';
}

export type OcpStimuloDTO = {
  id_estimulo: number;
  nome: string | null;
  status: boolean;
  descricao: string | null;
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

export type CreateSessionInput = {
  programId: number;
  patientId: string;
  therapistId: string;
  notes: string | null;
  attempts: {
    stimulusId: string;
    attemptNumber: number;
    type: 'error' | 'prompted' | 'independent';
  }[];
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
}

export type UpdateProgramInput = {
  id: number;
  name: string;
  goalTitle: string | null;
  goalDescription: string | null;
  shortTermGoalDescription: string | null;
  stimuliApplicationDescription: string | null;
  stimuli: {
    id?: string | undefined;
    label: string;
    description?: string | null;
    active: boolean;
    order: number;
  }[];
  criteria: string | null;
  notes: string | null;
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
  estimulosOcp: {
    id: number;
    nome: string | null;
  } | null;
}

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
  }[];
}

export interface Session {
  id: string;
  pacienteId: string;
  terapeutaId: string;
  data: string;
  programa: string;
  objetivo: string;
  prazoInicio: string;
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
  registros: {
    tentativa: number;
    resultado: 'acerto' | 'erro' | 'ajuda';
    stimulusId: string | undefined;
    stimulusLabel: string | undefined;
  }[];
}

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
}

export type AttentionStimuliFilters = {
  pacienteId: string;
  programaId?: string | undefined;
  terapeutaId?: string | undefined;
  periodo?: {
    mode: '30d' | '90d' | 'custom';
    start?: string | undefined;
    end?: string | undefined;
  };
  lastSessions: 1 | 3 | 5;
};

export interface UnmappedSession {
  id: number;
  data_criacao: Date;
  terapeuta?: { nome: string | null } | null;
  trials: { resultado: string; ordem: number }[];
}

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
    status: boolean;
  }[];
  status: string;
};

export type KpisFilters = {
  pacienteId?: string;
  periodo: { 
    mode: '30d'|'90d'|'custom'; 
    start?: string; 
    end?: string; 
  };
  programaId?: string;
  estimuloId?: string;
  terapeutaId?: string;
  comparar?: boolean;
};

export type KpisReport = {
  acerto: number;          // %
  independencia: number;   // %
  tentativas: number;
  sessoes: number;
  assiduidade?: number;    // %
  gapIndependencia?: number; // acerto - independencia
};