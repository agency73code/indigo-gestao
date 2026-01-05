export interface AnamneseListFilters {
    q?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sort?: string | undefined;
}

export interface AnamneseListItem {
    id: string;
    clienteId: string;
    clienteNome: string;
    clienteAvatarUrl?: string | undefined;
    telefone?: string | undefined;
    dataNascimento?: string | undefined;
    responsavel?: string | undefined;
    dataEntrevista: string;
    profissionalNome: string;
    status: 'ATIVO' | 'INATIVO';
}

export interface AnamneseListResult {
    items: AnamneseListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}