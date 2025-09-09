type ID = string;

export interface Therapist {
    id: ID;
    nome: string;
    email?: string;
    telefone?: string;
    status: 'ATIVO' | 'INATIVO';
    especialidade?: string;
    conselho?: string; // CRP/CRM
    registroConselho?: string;
    avatarUrl?: string;
    pessoa?: {
        cpf?: string;
        dataNascimento?: string; // ISO
        genero?: string;
        observacoes?: string;
    };
    endereco?: {
        cep?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
    };
    profissional?: {
        cargaHorariaSemanal?: number;
        atendeConvenio?: boolean;
        especialidades?: string[];
        valorConsulta?: number;
        formasAtendimento?: string[];
    };
    formacao?: {
        curso: string;
        instituicao: string;
        ano?: number;
    }[];
    arquivos?: {
        id: ID;
        nome: string;
        tipo?: string;
        tamanho?: number;
        data?: string;
    }[];
    cnpj?: string; // mascarar na UI
}

export interface Patient {
    id: ID;
    nome: string;
    email?: string;
    telefone?: string;
    responsavel?: string;
    status: 'ATIVO' | 'INATIVO';
    avatarUrl?: string;
    pessoa?: {
        cpf?: string;
        dataNascimento?: string;
        genero?: string;
        observacoes?: string;
    };
    endereco?: {
        cep?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
    };
    arquivos?: {
        id: ID;
        nome: string;
        tipo?: string;
        tamanho?: number;
        data?: string;
    }[];
}

export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

export interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}
