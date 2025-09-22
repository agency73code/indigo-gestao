import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CardHeader, CardTitle } from '@/ui/card';
import { FiltersBar } from '../relatorio-geral/components/FiltersBar';
import { KpiCards } from '../relatorio-geral/components/KpiCards';
import { DualLineProgress } from '../relatorio-geral/components/DualLineProgress';
import { SessionStackedBars } from '../relatorio-geral/components/SessionStackedBars';
import { StimuliHeatmap } from '../relatorio-geral/components/StimuliHeatmap';
import { StimuliSparklineList } from '../relatorio-geral/components/StimuliSparklineList';
import { OcpDeadlineGauge } from '../relatorio-geral/components/OcpDeadlineGauge';
import {
    fetchKpis,
    fetchSerieLinha,
    fetchBarrasDistribuicao,
    fetchHeatmap,
    fetchSparklines,
    fetchPrazoPrograma,
} from '../relatorio-geral/services/relatorio.service';
import type {
    Filters,
    KpisRelatorio,
    SerieLinha,
    LinhaBarras,
    HeatmapData,
    SparkItem,
    PrazoPrograma,
} from '../relatorio-geral/types';

export default function RelatorioMensalPage() {
    const [searchParams] = useSearchParams();

    // Estados para os dados
    const [kpis, setKpis] = useState<KpisRelatorio | null>(null);
    const [serieLinha, setSerieLinha] = useState<SerieLinha[]>([]);
    const [barras, setBarras] = useState<LinhaBarras[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
    const [sparklines, setSparklines] = useState<SparkItem[]>([]);
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
            const [serieLinhaData, barrasData, heatmapData, sparklinesData, prazoProgramaData] =
                await Promise.all([
                    fetchSerieLinha(currentFilters),
                    fetchBarrasDistribuicao(currentFilters),
                    fetchHeatmap(currentFilters),
                    fetchSparklines(currentFilters),
                    fetchPrazoPrograma(currentFilters),
                ]);

            setSerieLinha(serieLinhaData);
            setBarras(barrasData);
            setHeatmap(heatmapData);
            setSparklines(sparklinesData);
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
        <div className="flex flex-col w-full h-full sm:px-6">
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

            <div className="space-y-4 px-6 pb-6">
                {/* Filtros */}
                <FiltersBar value={filters} onChange={handleFiltersChange} />

                {/* KPIs */}
                {kpis && <KpiCards data={kpis} loading={loadingKpis} />}

                {/* Linha dupla */}
                <DualLineProgress data={serieLinha} loading={loadingCharts} />

                {/* Grid 1 col (md:2 col) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SessionStackedBars data={barras} loading={loadingCharts} />
                    {heatmap && <StimuliHeatmap data={heatmap} loading={loadingCharts} />}
                </div>

                {/* Grid 1 col (md:2 col) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {prazoPrograma && (
                        <OcpDeadlineGauge data={prazoPrograma} loading={loadingCharts} />
                    )}
                    <StimuliSparklineList data={sparklines} loading={loadingCharts} />
                </div>
            </div>
        </div>
    );
}
