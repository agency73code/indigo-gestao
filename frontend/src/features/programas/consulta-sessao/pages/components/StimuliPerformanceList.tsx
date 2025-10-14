import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, AlertCircle, CheckCircle2, CircleHelp } from 'lucide-react';
import type { Counts } from '../helpers';
import { total, ti, toStatus, getStatusConfig, sortBySeverity } from '../helpers';

type StimulusInfo = {
    id: string;
    label: string;
    order: number;
};

interface StimuliPerformanceListProps {
    stimuli: StimulusInfo[];
    countsByStimulus: Record<string, Counts>;
    defaultSort?: 'severity' | 'alphabetical';
}

export default function StimuliPerformanceList({
    stimuli,
    countsByStimulus,
    defaultSort = 'severity',
}: StimuliPerformanceListProps) {
    const [sortMode, setSortMode] = useState<'severity' | 'alphabetical'>(defaultSort);

    const sortedStimuli = useMemo(() => {
        const list = stimuli.filter((s) => countsByStimulus[s.id]);

        if (sortMode === 'alphabetical') {
            return [...list].sort((a, b) => a.label.localeCompare(b.label));
        }

        // Severity sort
        return [...list].sort((a, b) => {
            const statusA = toStatus(countsByStimulus[a.id]);
            const statusB = toStatus(countsByStimulus[b.id]);
            return sortBySeverity(statusA, statusB);
        });
    }, [stimuli, countsByStimulus, sortMode]);

    const toggleSort = () => {
        const newMode = sortMode === 'severity' ? 'alphabetical' : 'severity';
        setSortMode(newMode);

        // Log event
        console.log('[Event] sessao:detalhe:stimulus:sort:change', { mode: newMode });
    };

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base font-semibold">
                                Desempenho por estímulo
                            </CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[280px]">
                                        <p className="text-xs font-medium mb-1">
                                            Como interpretar este indicador
                                        </p>
                                        <p className="text-xs">
                                            Mostra o desempenho individual de cada estímulo
                                            trabalhado nesta sessão. Use esta informação para
                                            identificar quais estímulos precisam de mais treino ou
                                            estão prontos para avançar.
                                        </p>
                                        <p className="text-xs mt-2 opacity-80">
                                            Status baseado na taxa de independência (INDEP ÷ TOTAL)
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Análise detalhada do desempenho em cada estímulo trabalhado
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSort}
                        className="h-9 gap-2 flex-shrink-0"
                        aria-label={`Ordenar ${sortMode === 'severity' ? 'alfabeticamente' : 'por gravidade'}`}
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="text-xs font-medium">
                            {sortMode === 'severity' ? 'A–Z' : 'Gravidade'}
                        </span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <TooltipProvider>
                    <div className="space-y-3">
                        {sortedStimuli.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                Nenhum estímulo trabalhado nesta sessão
                            </div>
                        ) : (
                            sortedStimuli.map((stimulus) => {
                                const counts = countsByStimulus[stimulus.id];
                                const totalCount = total(counts);
                                const tiPercent = ti(counts);
                                const status = toStatus(counts);
                                const statusConfig = getStatusConfig(status);

                                return (
                                    <div
                                        key={stimulus.id}
                                        className="border border-border rounded-md p-3 sm:p-4"
                                        data-testid={`stim-row-${stimulus.id}`}
                                    >
                                        <div className="space-y-3">
                                            {/* Nome do estímulo */}
                                            <div className="font-medium text-sm truncate">
                                                {stimulus.label}
                                            </div>

                                            {/* Chips neutros de contagens */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="gap-1.5">
                                                    <span className="text-xs">Erro:</span>
                                                    <span className="font-semibold">
                                                        {counts.erro}
                                                    </span>
                                                </Badge>
                                                <Badge variant="outline" className="gap-1.5">
                                                    <span className="text-xs">Ajuda:</span>
                                                    <span className="font-semibold">
                                                        {counts.ajuda}
                                                    </span>
                                                </Badge>
                                                <Badge variant="outline" className="gap-1.5">
                                                    <span className="text-xs">Indep.:</span>
                                                    <span className="font-semibold">
                                                        {counts.indep}
                                                    </span>
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="gap-1.5 ml-auto"
                                                >
                                                    <span className="text-xs">Total:</span>
                                                    <span className="font-semibold">
                                                        {totalCount}
                                                    </span>
                                                </Badge>
                                            </div>

                                            {/* Status colorido + alertas */}
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            variant="outline"
                                                            className={`gap-1 ${statusConfig.cls}`}
                                                            data-testid={`stim-status-${stimulus.id}`}
                                                        >
                                                            <span className="text-xs whitespace-nowrap">
                                                                {status === 'insuficiente'
                                                                    ? statusConfig.label
                                                                    : `${statusConfig.label} — ${tiPercent}% (${counts.indep}/${totalCount})`}
                                                            </span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[220px] text-xs">
                                                        Percentual de respostas independentes nesta
                                                        sessão. Cálculo: INDEP ÷ (ERRO+AJUDA+INDEP).
                                                    </TooltipContent>
                                                </Tooltip>

                                                {/* Alertas */}
                                                {status === 'insuficiente' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 text-xs"
                                                    >
                                                        <AlertCircle className="h-3 w-3" />
                                                        Coleta insuficiente
                                                    </Badge>
                                                )}
                                                {status === 'positivo' && tiPercent >= 80 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 text-xs border-green-500/40 text-green-700 bg-green-50"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Meta alcançada
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
