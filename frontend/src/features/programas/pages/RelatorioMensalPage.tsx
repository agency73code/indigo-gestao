import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CardHeader, CardTitle } from '@/ui/card';
import { FiltersBar } from '../relatorio-geral/components/FiltersBar';
import { KpiCards } from '../relatorio-geral/components/KpiCards';
import { DualLineProgress } from '../relatorio-geral/components/DualLineProgress';

import { OcpDeadlineCard } from '../relatorio-geral/components/OcpDeadlineCard';
import {
    fetchKpis,
    fetchSerieLinha,
    fetchPrazoPrograma,
} from '../relatorio-geral/services/relatorio.service';
import type { Filters, KpisRelatorio, SerieLinha, PrazoPrograma } from '../relatorio-geral/types';

export default function RelatorioMensalPage() {
    const [searchParams] = useSearchParams();

    // Estados para os dados
    const [kpis, setKpis] = useState<KpisRelatorio | null>(null);
    const [serieLinha, setSerieLinha] = useState<SerieLinha[]>([]);
    const [prazoPrograma, setPrazoPrograma] = useState<PrazoPrograma | null>(null);

    // Estados de loading
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);

    // Filtros - inicializa com queryParams se existirem
    const [filters, setFilters] = useState<Filters>(() => ({
        pacienteId: searchParams.get('pacienteId') || undefined,
        periodo: { mode: '30d' },
        programaId: searchParams.get('programaId') || undefined,
        estimuloId: undefined,
        terapeutaId: undefined,
        comparar: false,
    }));

    // Função para carregar todos os dados
    const loadData = async (currentFilters: Filters) => {
        try {
            // Carregar KPIs primeiro (mais rápido)
            setLoadingKpis(true);
            const kpisData = await fetchKpis(currentFilters);
            setKpis(kpisData);
            setLoadingKpis(false);

            // Carregar gráficos em paralelo
            setLoadingCharts(true);
            const [serieLinhaData, prazoProgramaData] = await Promise.all([
                fetchSerieLinha(currentFilters),
                fetchPrazoPrograma(currentFilters),
            ]);

            setSerieLinha(serieLinhaData);
            setPrazoPrograma(prazoProgramaData);
            setLoadingCharts(false);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
            setLoadingKpis(false);
            setLoadingCharts(false);
        }
    };

    // Carrega dados quando os filtros mudam
    useEffect(() => {
        loadData(filters);
    }, [filters]);

    // Handler para mudança de filtros
    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <CardHeader className="px-6 py-6">
                <CardTitle
                    className="text-2xl font-semibold text-primary"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                >
                    Relatório Geral
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Análise completa do desempenho e evolução do paciente
                </p>
            </CardHeader>

            <div className="space-y-4 md:space-y-6 px-6 pb-6">
                {/* Filtros */}
                <FiltersBar value={filters} onChange={handleFiltersChange} />

                {/* KPIs */}
                {kpis && <KpiCards data={kpis} loading={loadingKpis} />}

                {/* Linha dupla */}
                <DualLineProgress data={serieLinha} loading={loadingCharts} />

                {/* Prazo do Programa (OCP) - Full Width */}
                <OcpDeadlineCard
                    inicio={prazoPrograma?.inicio}
                    fim={prazoPrograma?.fim}
                    percent={prazoPrograma?.percent}
                    label={prazoPrograma?.label}
                    loading={loadingCharts}
                />
            </div>
        </div>
    );
}
