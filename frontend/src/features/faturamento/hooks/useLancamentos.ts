/**
 * Hook: useLancamentos
 * 
 * Gerencia a listagem de lançamentos com filtros, paginação e cache.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
    Lancamento,
    LancamentoListFilters,
    LancamentoListResponse,
    TipoAtividade,
    StatusLancamento,
} from '../types';
import { listLancamentos } from '../services/faturamento.service';

interface UseLancamentosOptions {
    /** ID do terapeuta para filtrar (se não informado, usa o logado) */
    terapeutaId?: string;
    /** Tamanho da página */
    pageSize?: number;
    /** Se deve sincronizar filtros com URL */
    syncWithUrl?: boolean;
}

interface UseLancamentosReturn {
    /** Lista de lançamentos */
    lancamentos: Lancamento[];
    /** Se está carregando */
    loading: boolean;
    /** Erro se houver */
    error: string | null;
    /** Dados de paginação */
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    /** Filtros ativos */
    filters: LancamentoListFilters;
    /** Atualiza filtros */
    setFilters: (filters: Partial<LancamentoListFilters>) => void;
    /** Vai para página específica */
    goToPage: (page: number) => void;
    /** Recarrega dados */
    refresh: () => void;
    /** Limpa filtros */
    clearFilters: () => void;
    /** Verifica se tem filtros ativos */
    hasActiveFilters: boolean;
}

export function useLancamentos(options: UseLancamentosOptions = {}): UseLancamentosReturn {
    const { 
        terapeutaId,
        pageSize = 10,
        syncWithUrl = true,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<LancamentoListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Extrair filtros da URL ou usar defaults
    const filters = useMemo((): LancamentoListFilters => {
        if (!syncWithUrl) {
            return { page: 1, pageSize, terapeutaId };
        }

        return {
            q: searchParams.get('q') || undefined,
            terapeutaId: searchParams.get('terapeutaId') || terapeutaId,
            clienteId: searchParams.get('clienteId') || undefined,
            tipoAtividade: (searchParams.get('tipoAtividade') as TipoAtividade | 'all') || undefined,
            status: (searchParams.get('status') as StatusLancamento | 'all') || undefined,
            dataInicio: searchParams.get('dataInicio') || undefined,
            dataFim: searchParams.get('dataFim') || undefined,
            orderBy: (searchParams.get('orderBy') as 'recent' | 'oldest') || 'recent',
            page: Number(searchParams.get('page')) || 1,
            pageSize,
        };
    }, [searchParams, terapeutaId, pageSize, syncWithUrl]);

    // Carregar dados
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await listLancamentos(filters);
            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar lançamentos');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Carregar ao montar ou quando filtros mudarem
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Atualizar filtros
    const setFilters = useCallback((newFilters: Partial<LancamentoListFilters>) => {
        if (!syncWithUrl) return;

        const params = new URLSearchParams(searchParams);

        // Reset página ao mudar filtros (exceto se for só mudança de página)
        const isOnlyPageChange = Object.keys(newFilters).length === 1 && 'page' in newFilters;
        if (!isOnlyPageChange) {
            params.set('page', '1');
        }

        // Atualizar params
        for (const [key, value] of Object.entries(newFilters)) {
            if (value === undefined || value === '' || value === 'all') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        }

        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams, syncWithUrl]);

    // Ir para página
    const goToPage = useCallback((page: number) => {
        setFilters({ page });
    }, [setFilters]);

    // Limpar filtros
    const clearFilters = useCallback(() => {
        if (syncWithUrl) {
            setSearchParams({}, { replace: true });
        }
    }, [setSearchParams, syncWithUrl]);

    // Verificar se tem filtros ativos
    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.q ||
            filters.clienteId ||
            (filters.tipoAtividade && filters.tipoAtividade !== 'all') ||
            (filters.status && filters.status !== 'all') ||
            filters.dataInicio ||
            filters.dataFim
        );
    }, [filters]);

    return {
        lancamentos: data?.items || [],
        loading,
        error,
        pagination: {
            page: data?.page || 1,
            pageSize: data?.pageSize || pageSize,
            total: data?.total || 0,
            totalPages: data?.totalPages || 0,
        },
        filters,
        setFilters,
        goToPage,
        refresh: loadData,
        clearFilters,
        hasActiveFilters,
    };
}
