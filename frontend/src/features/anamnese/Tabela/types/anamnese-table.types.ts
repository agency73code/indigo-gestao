/**
 * Tipos para listagem de anamneses cadastradas
 */

type ID = string;

export interface AnamneseListItem {
    id: ID;
    clienteId: ID;
    clienteNome: string;
    clienteAvatarUrl?: string;
    telefone?: string;
    dataNascimento?: string;
    responsavel?: string;
    dataEntrevista: string;
    profissionalNome: string;
    status: 'ATIVO' | 'INATIVO';
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
