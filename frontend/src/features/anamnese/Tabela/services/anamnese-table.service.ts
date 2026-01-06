import { authFetch } from '@/lib/http';
import type { AnamneseListItem } from '../types/anamnese-table.types';
import { mockAnamneses } from '../mocks/anamnese.mock';
import { buildApiUrl } from '@/lib/api';

// Flag para usar dados mock (desabilitar quando API estiver pronta)
const USE_MOCK = false;

/**
 * Parâmetros de filtragem para listagem de anamneses
 */
export interface AnamneseListParams {
    /** Termo de busca (nome do cliente, responsável, etc) */
    q?: string;
    /** Número da página (1-indexed) */
    page?: number;
    /** Quantidade de itens por página */
    pageSize?: number;
    /** Ordenação: campo_direção (ex: clienteNome_asc, dataEntrevista_desc) */
    sort?: string;
}

/**
 * Resposta da API com dados paginados
 */
export interface AnamneseListResponse {
    /** Lista de anamneses da página atual */
    items: AnamneseListItem[];
    /** Total de registros (após filtros) */
    total: number;
    /** Página atual */
    page: number;
    /** Itens por página */
    pageSize: number;
    /** Total de páginas */
    totalPages: number;
}

/**
 * Lista anamneses cadastradas com filtros, ordenação e paginação
 * 
 * @param params - Parâmetros de filtragem
 * @returns Dados paginados de anamneses
 */
export async function listAnamneses(
    params: AnamneseListParams = {}
): Promise<AnamneseListResponse> {
    const {
        q = '',
        page = 1,
        pageSize = 10,
        sort = 'clienteNome_asc'
    } = params;

    // ========== MOCK: Usar dados locais para desenvolvimento ==========
    if (USE_MOCK) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...mockAnamneses];

        // Aplicar filtro de busca
        if (q) {
            const searchLower = q.toLowerCase();
            filtered = filtered.filter(item =>
                item.clienteNome.toLowerCase().includes(searchLower) ||
                item.responsavel?.toLowerCase().includes(searchLower) ||
                item.telefone?.includes(q)
            );
        }

        // Aplicar ordenação
        const [field, direction] = sort.split('_') as [keyof AnamneseListItem, 'asc' | 'desc'];
        filtered.sort((a, b) => {
            const aVal = String(a[field] ?? '');
            const bVal = String(b[field] ?? '');
            const comparison = aVal.localeCompare(bVal, 'pt-BR');
            return direction === 'asc' ? comparison : -comparison;
        });

        // Aplicar paginação
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        return {
            items,
            total,
            page,
            pageSize,
            totalPages,
        };
    }
    // ===================================================================

    const query = buildApiUrl('/api/anamneses', {
        page,
        pageSize,
        sort,
        q: q || undefined,
    });

    const res = await authFetch(query, { method: 'GET' });
    const text = await res.text();
    const contentType = res.headers.get('content-type') ?? '';
    let response: any = null;

    if (text && (contentType.includes('application/json') || text.trim().startsWith('{'))) {
        try {
            response = JSON.parse(text);
        } catch {
            response = null;
        }
    }

    if (!res.ok) {
        const msg = response?.message ?? response?.error ?? `Falha ao listar anamneses (${res.status})`;
        throw new Error(msg);
    }

    const data = response?.normalized ?? response;

    if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as any).items)) {
        const payload = data as Partial<AnamneseListResponse> & { success?: boolean };

        return {
            items: payload.items ?? [],
            total: payload.total ?? 0,
            page: payload.page ?? page,
            pageSize: payload.pageSize ?? pageSize,
            totalPages: payload.totalPages ?? Math.ceil((payload.total ?? 0) / (payload.pageSize ?? pageSize)),
        };
    }

    return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
    };
}
