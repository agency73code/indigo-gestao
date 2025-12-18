import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, CircleHelp, Clock } from 'lucide-react';
import type { Counts } from '@/features/programas/consulta-sessao/pages/helpers';
import { total } from '@/features/programas/consulta-sessao/pages/helpers';
import { getToStatus, getToStatusConfig, type ToStatus } from '../helpers';

type ActivityInfo = {
    id: string;
    label: string;
    order: number;
};

interface ToActivitiesPerformanceListProps {
    activities: ActivityInfo[];
    countsByActivity: Record<string, Counts>;
    durationsByActivity?: Record<string, number | null>;
    defaultSort?: 'severity' | 'alphabetical';
}

export default function ToActivitiesPerformanceList({
    activities,
    countsByActivity,
    durationsByActivity = {},
    defaultSort = 'severity',
}: ToActivitiesPerformanceListProps) {
    const [sortMode, setSortMode] = useState<'severity' | 'alphabetical'>(defaultSort);

    const sortedActivities = useMemo(() => {
        const list = activities.filter((a) => countsByActivity[a.id]);

        if (sortMode === 'alphabetical') {
            return [...list].sort((a, b) => a.label.localeCompare(b.label));
        }

        // Severity sort - ordena por status predominante
        // Ordem: Não Desempenhou > Desempenhou com Ajuda > Desempenhou
        return [...list].sort((a, b) => {
            const statusA = getToStatus(countsByActivity[a.id]);
            const statusB = getToStatus(countsByActivity[b.id]);
            const order: ToStatus[] = ['nao-desempenhou', 'desempenhou-com-ajuda', 'desempenhou'];
            return order.indexOf(statusA) - order.indexOf(statusB);
        });
    }, [activities, countsByActivity, sortMode]);

    const toggleSort = () => {
        const newMode = sortMode === 'severity' ? 'alphabetical' : 'severity';
        setSortMode(newMode);
    };

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base font-semibold">
                                Desempenho por atividade
                            </CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[280px]">
                                        <p className="text-xs font-medium mb-1">
                                            Como interpretar este indicador
                                        </p>
                                        <p className="text-xs">
                                            Mostra o desempenho individual de cada atividade
                                            trabalhada nesta sessão. Use esta informação para
                                            identificar quais atividades precisam de mais treino ou
                                            estão prontas para avançar.
                                        </p>
                                        <p className="text-xs mt-2 opacity-80">
                                            Status baseado na taxa de independência (INDEP ÷ TOTAL)
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Análise detalhada do desempenho em cada atividade trabalhada
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSort}
                        className="h-9 gap-2 shrink-0"
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
                        {sortedActivities.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                Nenhuma atividade trabalhada nesta sessão
                            </div>
                        ) : (
                            sortedActivities.map((activity) => {
                                const counts = countsByActivity[activity.id];
                                const totalCount = total(counts);
                                const status = getToStatus(counts);
                                const statusConfig = getToStatusConfig(status);
                                const duration = durationsByActivity[activity.id];

                                return (
                                    <div
                                        key={activity.id}
                                        className="border border-border rounded-md p-3 sm:p-4"
                                        data-testid={`activity-row-${activity.id}`}
                                    >
                                        <div className="space-y-3">
                                            {/* Nome da atividade */}
                                            <div className="font-medium text-sm truncate">
                                                {activity.label}
                                            </div>

                                            {/* Chips neutros de contagens */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="gap-1.5">
                                                    <span className="text-xs">Não desempenhou:</span>
                                                    <span className="font-semibold">
                                                        {counts.erro}
                                                    </span>
                                                </Badge>
                                                <Badge variant="outline" className="gap-1.5">
                                                    <span className="text-xs">Desempenhou com ajuda:</span>
                                                    <span className="font-semibold">
                                                        {counts.ajuda}
                                                    </span>
                                                </Badge>
                                                <Badge variant="outline" className="gap-1.5">
                                                    <span className="text-xs">Desempenhou:</span>
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

                                            {/* Status colorido + tempo */}
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Badge
                                                    variant="outline"
                                                    className={statusConfig.cls}
                                                    data-testid={`activity-status-${activity.id}`}
                                                >
                                                    <span className="text-xs whitespace-nowrap">
                                                        {statusConfig.label} — {counts.erro + counts.ajuda + counts.indep}/{totalCount}
                                                    </span>
                                                </Badge>

                                                {/* Badge de tempo */}
                                                {duration && duration > 0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1.5 px-3 py-1 text-blue-700 bg-blue-100 hover:bg-blue-200 border-0"
                                                    >
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-medium">
                                                            {duration} min
                                                        </span>
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
