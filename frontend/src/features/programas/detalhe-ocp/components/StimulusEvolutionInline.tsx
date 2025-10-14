import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PerformanceChart from './PerformanceChart';
import type { SerieLinha } from '../../relatorio-geral/types';
import { fetchStimulusChart } from '../services';

interface StimulusEvolutionInlineProps {
    programId: string;
    stimulusId: string;
    stimulusName: string;
    isOpen: boolean;
    panelId: string;
}

const ERROR_MESSAGE = 'Não foi possível carregar o gráfico. Tente novamente.';

export default function StimulusEvolutionInline({
    programId,
    stimulusId,
    stimulusName,
    isOpen,
    panelId,
}: StimulusEvolutionInlineProps) {
    const [chartData, setChartData] = useState<SerieLinha[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const headingId = useMemo(() => `${panelId}-heading`, [panelId]);

    const loadChart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchStimulusChart(programId, stimulusId);
            setChartData(data);
        } catch (err) {
            console.error('Erro ao carregar gráfico do estímulo:', err);
            setChartData(null);
            setError(ERROR_MESSAGE);
        } finally {
            setHasFetched(true);
            setLoading(false);
        }
    }, [programId, stimulusId]);

    useEffect(() => {
        if (isOpen && !hasFetched && !loading) {
            void loadChart();
        }
    }, [isOpen, hasFetched, loading, loadChart]);

    useEffect(() => {
        setChartData(null);
        setError(null);
        setHasFetched(false);
    }, [programId, stimulusId]);

    const handleRetry = () => {
        setHasFetched(false);
        void loadChart();
    };

    const showEmptyState = hasFetched && !loading && !error && (!chartData || chartData.length === 0);
    const showChart = !loading && !error && chartData && chartData.length > 0;

    if (!isOpen) {
        return null;
    }

    return (
        <div
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            className="mt-3"
        >
            

            {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando gráfico...
                </div>
            )}

            {error && !loading && (
                <div className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                        Tentar novamente
                    </Button>
                </div>
            )}

            {showEmptyState && (
                <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                    Sem dados para este estímulo nos filtros selecionados.
                </div>
            )}

            {showChart && (
                <div className="mt-4">
                    <PerformanceChart
                        data={chartData ?? []}
                        title="Gráfico de evolução"
                        description={`Histórico de acerto total, acerto independente e erro por sessão para o estímulo "${stimulusName}".`}
                    />
                </div>
            )}
        </div>
    );
}
