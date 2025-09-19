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
  status: string;
};