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
    pessoa: {
        cpf: string;
        dataNascimento: string; // ISO
        genero: string;
        observacoes: string;
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
    pessoa: {
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

// ============================================
// Form Types - PatientProfileDrawer
// ============================================

export type ProfessionalDataForm = {
    areaAtuacao: string;
    areaAtuacaoId?: number | string | null;
    cargo: string;
    cargoId?: number | string | null;
    numeroConselho?: string;
};

export type PosGraduacaoForm = {
    tipo: 'lato' | 'stricto';
    curso: string;
    instituicao: string;
    conclusao: string;
    comprovanteUrl?: string | null;
};

export type FormacaoForm = {
    graduacao: string;
    instituicaoGraduacao: string;
    anoFormatura: string;
    posGraduacoes?: PosGraduacaoForm[];
    participacaoCongressosDescricao?: string | null;
    publicacoesLivrosDescricao?: string | null;
};

export type CaregiverForm = {
    relacao: string;
    descricaoRelacao: string;
    nome: string;
    cpf: string;
    profissao: string;
    escolaridade: string;
    telefone: string;
    email: string;
    endereco: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
    };
};

export type AddressForm = {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    residenciaDe: string;
    outroResidencia: string;
};

export type PaymentForm = {
    nomeTitular: string;
    numeroCarteirinha: string;
    telefone1: string;
    mostrarTelefone2: boolean;
    telefone2: string;
    mostrarTelefone3: boolean;
    telefone3: string;
    email1: string;
    mostrarEmail2: boolean;
    email2: string;
    mostrarEmail3: boolean;
    email3: string;
    sistemaPagamento: 'reembolso' | 'liminar' | 'particular';
    prazoReembolso: string;
    numeroProcesso: string;
    nomeAdvogado: string;
    telefoneAdvogado1: string;
    mostrarTelefoneAdvogado2: boolean;
    telefoneAdvogado2: string;
    mostrarTelefoneAdvogado3: boolean;
    telefoneAdvogado3: string;
    emailAdvogado1: string;
    mostrarEmailAdvogado2: boolean;
    emailAdvogado2: string;
    mostrarEmailAdvogado3: boolean;
    emailAdvogado3: string;
    houveNegociacao: 'sim' | 'nao' | '';
    valorAcordado: string;
};

export type SchoolContactForm = {
    nome: string;
    telefone: string;
    email: string;
    funcao: string;
};

export type SchoolForm = {
    tipoEscola: 'particular' | 'publica' | 'afastado' | 'clinica-escola';
    nome: string;
    telefone: string;
    email: string;
    endereco: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
    };
    contatos: SchoolContactForm[];
};

export type ClientFormValues = {
    nome: string;
    cpf: string;
    emailContato: string;
    dataNascimento: string;
    dataEntrada: string;
    dataSaida: string;
    cuidadores: CaregiverForm[];
    enderecos: AddressForm[];
    dadosPagamento: PaymentForm;
    dadosEscola: SchoolForm;
};

export type CNPJForm = {
    numero: string;
    razaoSocial: string;
    nomeFantasia: string;
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
    };
};

export type TherapistFormValues = {
    nome: string;
    email: string;
    emailIndigo: string;
    telefone: string;
    celular: string;
    cpf: string;
    dataNascimento: string;
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    possuiVeiculo: 'sim' | 'nao';
    placaVeiculo: string;
    modeloVeiculo: string;
    banco: string;
    agencia: string;
    conta: string;
    chavePix: string;
    dadosProfissionais: ProfessionalDataForm[];
    dataInicio: string;
    dataFim: string;
    valorHoraAcordado: string;
    professorUnindigo: 'sim' | 'nao';
    disciplinaUniindigo: string;
    formacao: FormacaoForm;
    cnpj: CNPJForm;
};
