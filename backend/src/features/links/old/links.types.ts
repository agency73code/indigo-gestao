export interface DBCarregiver {
    nome: string | null;
    telefone: string | null;
    email: string | null;
    relacao: string | null;
    descricaoRelacao: string | null;
}

export interface DBAddress {
    cep: string | null;
    rua: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    complemento: string | null;
}

export interface DBClientAddress {
    residenciaDe: string | null;
    outroResidencia: string | null;
    endereco: DBAddress | null;
}

export interface DBClient {
    id: string;
    nome: string | null;
    emailContato: string | null;
    dataNascimento: Date | null;
    cpf: string | null;
    status: string | null;
    cuidadores: DBCarregiver[];
    enderecos: DBClientAddress[];
}

export interface DBAreaAtuacao {
    id: number;
    nome: string;
}

export interface DBCargo {
    id: number;
    nome: string;
}

export interface DBProfessionalRegistration {
    area_atuacao: DBAreaAtuacao;
    cargo: DBCargo | null;
    numero_conselho: string | null;
}

export interface DBPostgraduate {
    tipo: string | null;
    curso: string | null;
    instituicao: string | null;
    conclusao: string | null;
}

export interface DBFormation {
    graduacao: string | null;
    instituicao_graduacao: string | null;
    ano_formatura: number | null;
    participacao_congressos: string | null;
    publicacoes_descricao: string | null;
    pos_graduacao: DBPostgraduate[];
}

export interface DBLegalPerson {
    cnpj: string | null;
    razao_social: string | null;
    endereco: DBAddress | null;
}

export interface DBTherapist {
    id: string;
    nome: string;
    email: string;
    email_indigo: string;
    telefone: string | null;
    celular: string;
    cpf: string;
    data_nascimento: Date;
    possui_veiculo: boolean;
    placa_veiculo: string | null;
    modelo_veiculo: string | null;
    banco: string | null;
    agencia: string | null;
    conta: string | null;
    chave_pix: string | null;
    valor_hora: unknown;
    professor_uni: boolean;
    data_entrada: Date;
    data_saida: Date | null;
    atividade: boolean;
    endereco: DBAddress | null;
    registro_profissional: DBProfessionalRegistration[];
    formacao: DBFormation | null;
    pessoa_juridica: DBLegalPerson | null;
}

export interface DBLink {
    id: number;
    terapeuta_id: string;
    cliente_id: string;
    papel: string;
    status: string;
    data_inicio: Date;
    data_fim: Date | null;
    observacoes: string | null;
    area_atuacao: string | null;
    criado_em: Date;
    atualizado_em: Date;

    terapeuta?: {
        registro_profissional?: {
            area_atuacao?: {
                nome?: string;
            };
        }[];
    };
}

export type CreateLink = {
    patientId: string;
    therapistId: string;
    role: 'responsible' | 'co';
    startDate: string;
    endDate?: string | null | undefined;
    notes?: string | null | undefined;
    actuationArea: string;
}

export type ArchiveLink = {
    id: string;
}

export type EndLink = {
    id: string;
    endDate: string;
}

export type UpdateLink = {
    id: string;
    role?: 'responsible' | 'co' | undefined;
    startDate?: string | undefined;
    endDate?: string | null | undefined;
    notes?: string | null | undefined;
    status?: 'active' | 'ended' | 'archived' | undefined;
    actuationArea?: string | undefined;
}

export type TransferResponsible = {
    patientId: string;
    fromTherapistId: string;
    toTherapistId: string;
    effectiveDate: string;
    oldResponsibleActuation: string;
    newResponsibleActuation: string;
}

export type TransferResponsibleResult = {
    previousResponsible: DBLink;
    newResponsible: DBLink;
}

export const SUPERVISOR_ROLES = [
  'Terapeuta Supervisor',
  'Supervisor ABA',
  'Coordenador ABA',
  'Gerente',
  'Coordenador Executivo',
];

export const CLINICAL_ROLES = [
  'Terapeuta Clínico',
  'Acompanhante Terapeutico',
  'Mediador de Conflitos',
  'Professor UniIndigo',
];

export type LinkFilters = {
  viewBy?: 'patient' | 'therapist' | 'supervision';
  status?: 'all' | 'active' | 'ended' | 'archived';
  orderBy?: 'recent' | 'oldest';
  q?: string;
};