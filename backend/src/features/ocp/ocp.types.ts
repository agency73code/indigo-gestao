export type createOCP = {
    clientId: string;
    therapistId: string;
    name: string | null;
    goalTitle: string;
    goalDescription?: string | null;
    criteria?: string | null;
    notes?: string | null;
    stimuli: {
        label: string;
        description?: string;
        active: boolean;
        order: number;
    }[];
}

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
  descricao: string | null;
  status: boolean;
};

export type OcpDetailDTO = {
  id: number;
  nome_programa: string;
  cliente_id: string;
  cliente: {
    nome: string;
    data_nascimento: Date;
    cliente_responsavel?: { responsaveis: { nome: string } }[];
  };
  criador_id: string;
  criador: { nome: string };
  criado_em: Date;
  objetivo_programa: string | null;
  objetivo_descricao: string | null;
  estimulo_ocp?: OcpStimuloDTO[];
  dominio_criterio?: string | null;
  observacao_geral?: string | null;
  status: string;
};

export type CreateSessionInput = {
  programId: number;
  patientId: string;
  therapistId: string;
  attempts: {
    stimulusId: string;
    attemptNumber: number;
    type: 'error' | 'prompted' | 'independent';
  }[];
};

export type UpdateProgramInput = {
    id: string;
    name?: string | null;
    goalTitle?: string;
    goalDescription?: string | null;
    stimuli?: { 
        id?: string; 
        label: string; 
        description?: string | null; 
        active: boolean; 
        order: number 
    }[];
    criteria?: string | null;
    notes?: string | null;
    status?: 'active' | 'archived';
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
  ocp: {
    id: number;
    nome_programa: string;
    objetivo_programa: string | null;
    criado_em: Date;
  };
  trials: SessionTrialDTO[];
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
  registros: {
    tentativa: number;
    resultado: 'acerto' | 'erro' | 'ajuda';
    stimulusId: string | undefined;
    stimulusLabel: string | undefined;
  }[];
}