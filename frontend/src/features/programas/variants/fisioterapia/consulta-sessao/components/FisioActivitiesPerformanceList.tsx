import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, CircleHelp, Clock, Dumbbell, AlertTriangle, Activity, CheckCircle, XCircle, HandHelping } from 'lucide-react';
import type { Counts } from '@/features/programas/consulta-sessao/pages/helpers';
import { total } from '@/features/programas/consulta-sessao/pages/helpers';
import { getFisioStatus, getFisioStatusConfig, type FisioStatus } from '../helpers';

type ActivityInfo = {
    id: string;
    label: string;
    order: number;
};

interface ToActivitiesPerformanceListProps {
    activities: ActivityInfo[];
    countsByActivity: Record<string, Counts>;
    durationsByActivity?: Record<string, number | null>;
    metadataByActivity?: Record<string, {
        usedLoad?: boolean;
        loadValue?: string;
        hadDiscomfort?: boolean;
        discomfortDescription?: string;
        hadCompensation?: boolean;
        compensationDescription?: string;
    }>;
    defaultSort?: 'severity' | 'alphabetical';
}

export default function ToActivitiesPerformanceList({
    activities,
    countsByActivity,
    durationsByActivity = {},
    metadataByActivity = {},
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
            const statusA = getFisioStatus(countsByActivity[a.id]);
            const statusB = getFisioStatus(countsByActivity[b.id]);
            const order: FisioStatus[] = ['nao-desempenhou', 'desempenhou-com-ajuda', 'desempenhou'];
            return order.indexOf(statusA) - order.indexOf(statusB);
        });
    }, [activities, countsByActivity, sortMode]);

    const toggleSort = () => {
        const newMode = sortMode === 'severity' ? 'alphabetical' : 'severity';
        setSortMode(newMode);

        console.log('[Event] sessao:detalhe:activity:sort:change', { mode: newMode });
    };

    return (
        <Card 
            padding="hub" 
            className="rounded-lg border-0 shadow-none"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader className="pb-3 border-b border-border/40 dark:border-white/15">
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
            <CardContent>
                <TooltipProvider>
                    <div className="grid grid-cols-1 gap-3">
                        {sortedActivities.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                                Nenhuma atividade trabalhada nesta sessão
                            </div>
                        ) : (
                            sortedActivities.map((activity) => {
                                const counts = countsByActivity[activity.id];
                                const totalCount = total(counts);
                                const status = getFisioStatus(counts);
                                const statusConfig = getFisioStatusConfig(status);
                                const duration = durationsByActivity[activity.id];

                                return (
                                    <div
                                        key={activity.id}
                                        className="border border-border/40 dark:border-white/15 rounded-lg hover:bg-muted/30 dark:hover:bg-white/5 transition-colors overflow-hidden"
                                        style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                                        data-testid={`activity-row-${activity.id}`}
                                    >
                                        {/* Cabeçalho: Título + Stats */}
                                        <div className="p-4 space-y-3 border-b border-border/40 dark:border-white/15">
                                            {/* Nome da atividade */}
                                            <div className="font-normal text-sm" style={{fontFamily: "Sora"}}>
                                                {activity.label}
                                            </div>

                                            {/* Stats com ícones coloridos */}
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {/* Desempenhou */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                    <div className="flex items-center justify-center w-5 h-5 rounded">
                                                        <CheckCircle className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Desempenhou:</span>
                                                    <span className="text-xs text-foreground font-medium">
                                                        {counts.indep}
                                                    </span>
                                                </div>

                                                {/* Com Ajuda */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                    <div className="flex items-center justify-center w-5 h-5 rounded">
                                                        <HandHelping className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Com Ajuda:</span>
                                                    <span className="text-xs text-foreground font-medium">
                                                        {counts.ajuda}
                                                    </span>
                                                </div>

                                                {/* Não Desempenhou */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                    <div className="flex items-center justify-center w-5 h-5 rounded">
                                                        <XCircle className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Não Desempenhou:</span>
                                                    <span className="text-xs text-foreground font-medium">
                                                        {counts.erro}
                                                    </span>
                                                </div>

                                                {/* Total */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 ml-auto">
                                                    <span className="text-xs text-muted-foreground">Total:</span>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {totalCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rodapé: Status + Tempo + Indicadores */}
                                        <div className="p-4 flex flex-wrap items-center gap-2">
                                                {/* Status */}
                                                <div
                                                    className={`px-3 flex center py-1.5 rounded-md ${statusConfig.cls.replace('border-', '').replace(/\/\d+/, '')}`}
                                                    data-testid={`activity-status-${activity.id}`}
                                                >
                                                    <span className="text-xs font-medium whitespace-nowrap">
                                                        {statusConfig.label}
                                                    </span>
                                                </div>

                                                {/* Badge de tempo */}
                                                {duration && duration > 0 && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                        <Clock className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {duration} min
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Indicadores compactos de metadata */}
                                                {metadataByActivity[activity.id] && (
                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                        {metadataByActivity[activity.id].usedLoad && metadataByActivity[activity.id].loadValue && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div 
                                                                        className="flex items-center justify-center w-7 h-7 rounded-md cursor-help transition-colors"
                                                                        style={{
                                                                            color: 'var(--badge-load-text)',
                                                                            backgroundColor: 'var(--badge-load-bg)'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-load-hover)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-load-bg)'}
                                                                    >
                                                                        <Dumbbell className="h-4 w-4" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[220px] text-xs">
                                                                    <div className="space-y-1">
                                                                        <div className="font-semibold">Exercício com carga</div>
                                                                        <div className="text-muted-foreground">{metadataByActivity[activity.id].loadValue}</div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {metadataByActivity[activity.id].hadDiscomfort && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div 
                                                                        className="flex items-center justify-center w-7 h-7 rounded-md cursor-help transition-colors"
                                                                        style={{
                                                                            color: 'var(--badge-discomfort-text)',
                                                                            backgroundColor: 'var(--badge-discomfort-bg)'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-discomfort-hover)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-discomfort-bg)'}
                                                                    >
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[280px] text-xs">
                                                                    <div className="space-y-1">
                                                                        <div className="font-semibold">Desconforto apresentado</div>
                                                                        <div className="text-muted-foreground">
                                                                            {metadataByActivity[activity.id].discomfortDescription || 'Sem descrição'}
                                                                        </div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {metadataByActivity[activity.id].hadCompensation && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div 
                                                                        className="flex items-center justify-center w-7 h-7 rounded-md cursor-help transition-colors"
                                                                        style={{
                                                                            color: 'var(--badge-compensation-text)',
                                                                            backgroundColor: 'var(--badge-compensation-bg)'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-compensation-hover)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-compensation-bg)'}
                                                                    >
                                                                        <Activity className="h-4 w-4" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[280px] text-xs">
                                                                    <div className="space-y-1">
                                                                        <div className="font-semibold">Compensação apresentada</div>
                                                                        <div className="text-muted-foreground">
                                                                            {metadataByActivity[activity.id].compensationDescription || 'Sem descrição'}
                                                                        </div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Campos descritivos de metadata - visível quando preenchido */}
                                            {metadataByActivity[activity.id] && (
                                                <div className="p-4 space-y-3 border-t border-border/40 dark:border-white/15">
                                                    {metadataByActivity[activity.id].usedLoad && metadataByActivity[activity.id].loadValue && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Dumbbell 
                                                                    className="h-3.5 w-3.5"
                                                                    style={{ color: 'var(--badge-load-text)' }}
                                                                />
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Exercício com carga
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                                                {metadataByActivity[activity.id].loadValue}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {metadataByActivity[activity.id].hadDiscomfort && metadataByActivity[activity.id].discomfortDescription && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <AlertTriangle 
                                                                    className="h-3.5 w-3.5"
                                                                    style={{ color: 'var(--badge-discomfort-text)' }}
                                                                />
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Desconforto apresentado
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                                                {metadataByActivity[activity.id].discomfortDescription}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {metadataByActivity[activity.id].hadCompensation && metadataByActivity[activity.id].compensationDescription && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Activity 
                                                                    className="h-3.5 w-3.5"
                                                                    style={{ color: 'var(--badge-compensation-text)' }}
                                                                />
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Compensação apresentada
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                                                {metadataByActivity[activity.id].compensationDescription}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
