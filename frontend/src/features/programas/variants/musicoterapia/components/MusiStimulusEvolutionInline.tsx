import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MusiEvolutionChart, { type MusiEvolutionDataPoint } from './MusiEvolutionChart';
import { fetchStimulusChart } from '@/features/programas/detalhe-ocp/services';

interface MusiStimulusEvolutionInlineProps {
    programId: string;
    stimulusId: string;
    stimulusName: string;
    isOpen: boolean;
    panelId: string;
}

const ERROR_MESSAGE = 'Não foi possível carregar o gráfico. Tente novamente.';

export default function MusiStimulusEvolutionInline({
    programId,
    stimulusId,
    stimulusName,
    isOpen,
    panelId,
}: MusiStimulusEvolutionInlineProps) {
    const [chartData, setChartData] = useState<MusiEvolutionDataPoint[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const headingId = useMemo(() => `${panelId}-heading`, [panelId]);

    const loadChart = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Buscar dados do estímulo - por enquanto usa os dados existentes e converte
            const data = await fetchStimulusChart(programId, stimulusId);
            
            // Converter dados de SerieLinha para MusiEvolutionDataPoint
            // Os dados de participação e suporte devem vir da API no futuro
            // Por enquanto, simulamos com base nos dados de acerto/independência
            const evolutionData: MusiEvolutionDataPoint[] = data.map((item) => {
                // Simular participação baseado no acerto (0-100 -> 0-5)
                const participacao = ((item.acerto ?? 0) / 100) * 5;
                // Simular suporte inversamente baseado na independência (maior independência = menor suporte)
                const suporte = 5 - (((item.independencia ?? 0) / 100) * 4);
                
                return {
                    x: item.x,
                    participacao: Math.round(participacao * 10) / 10,
                    suporte: Math.max(1, Math.round(suporte * 10) / 10), // Mínimo 1
                };
            });
            
            setChartData(evolutionData);
        } catch (err) {
            console.error('Erro ao carregar gráfico da atividade de Musicoterapia:', err);
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

    const showEmptyState = hasFetched && !loading && !error && (!chartData || chartData.length === 0);
    const showChart = !loading && !error && chartData && chartData.length > 0;

    if (!isOpen) return null;

    return (
        <div
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            className="mt-4 space-y-3"
        >
            <h4 id={headingId} className="text-sm font-medium">
                Evolução da atividade: {stimulusName}
            </h4>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Carregando gráfico...
                    </span>
                </div>
            )}

            {error && !loading && (
                <div className="py-6 px-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive mb-3">{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadChart}
                        className="h-8"
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}

            {showEmptyState && (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhum dado disponível ainda.</p>
                </div>
            )}

            {showChart && (
                <div className="border border-border/40 dark:border-white/15 rounded-lg p-4">
                    <MusiEvolutionChart data={chartData} />
                </div>
            )}

        </div>
    );
}
