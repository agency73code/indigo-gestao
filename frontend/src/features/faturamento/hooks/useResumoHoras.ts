/**
 * Hook: useResumoHoras
 * 
 * Busca e gerencia o resumo de horas do terapeuta ou gestão.
 */

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { ResumoHorasTerapeuta, ResumoGestao } from '../types';
import { getResumoTerapeuta, getResumoGestao } from '../services/faturamento.service';

interface UseResumoHorasOptions {
    /** ID do terapeuta (se não informado, busca resumo de gestão) */
    terapeutaId?: string;
    /** Data inicial do período */
    periodoInicio?: string;
    /** Data final do período */
    periodoFim?: string;
}

interface UseResumoHorasReturn {
    /** Resumo do terapeuta (se terapeutaId foi informado) */
    resumoTerapeuta: ResumoHorasTerapeuta | null;
    /** Resumo de gestão (se terapeutaId não foi informado) */
    resumoGestao: ResumoGestao | null;
    /** Se está carregando */
    loading: boolean;
    /** Erro se houver */
    error: string | null;
    /** Período atual */
    periodo: { inicio: string; fim: string };
    /** Alterar período */
    setPeriodo: (inicio: string, fim: string) => void;
    /** Recarregar dados */
    refresh: () => void;
}

export function useResumoHoras(options: UseResumoHorasOptions = {}): UseResumoHorasReturn {
    const { terapeutaId } = options;

    // Período padrão: mês atual
    const [periodo, setPeriodoState] = useState(() => {
        const now = new Date();
        return {
            inicio: options.periodoInicio || format(startOfMonth(now), 'yyyy-MM-dd'),
            fim: options.periodoFim || format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    });

    const [resumoTerapeuta, setResumoTerapeuta] = useState<ResumoHorasTerapeuta | null>(null);
    const [resumoGestao, setResumoGestao] = useState<ResumoGestao | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar resumo
    const loadResumo = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (terapeutaId) {
                const data = await getResumoTerapeuta(terapeutaId, periodo.inicio, periodo.fim);
                setResumoTerapeuta(data);
                setResumoGestao(null);
            } else {
                const data = await getResumoGestao(periodo.inicio, periodo.fim);
                setResumoGestao(data);
                setResumoTerapeuta(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar resumo');
        } finally {
            setLoading(false);
        }
    }, [terapeutaId, periodo]);

    // Carregar ao montar ou quando dependências mudarem
    useEffect(() => {
        loadResumo();
    }, [loadResumo]);

    // Alterar período
    const setPeriodo = useCallback((inicio: string, fim: string) => {
        setPeriodoState({ inicio, fim });
    }, []);

    return {
        resumoTerapeuta,
        resumoGestao,
        loading,
        error,
        periodo,
        setPeriodo,
        refresh: loadResumo,
    };
}
