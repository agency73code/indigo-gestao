import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    ArrowUpDown, 
    CircleHelp, 
    Clock, 
    Dumbbell, 
    AlertTriangle, 
    Activity, 
    CheckCircle, 
    XCircle, 
    HandHelping,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import type { Counts } from '@/features/programas/consulta-sessao/pages/helpers';
import { total } from '@/features/programas/consulta-sessao/pages/helpers';
import { getFisioStatus, getFisioStatusConfig, type FisioStatus } from '../helpers';

type ActivityInfo = {
    id: string;
    label: string;
    order: number;
};

interface FisioActivitiesPerformanceListProps {
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

export default function FisioActivitiesPerformanceList({
    activities,
    countsByActivity,
    durationsByActivity = {},
    metadataByActivity = {},
    defaultSort = 'severity',
}: FisioActivitiesPerformanceListProps) {
    const [sortMode, setSortMode] = useState<'severity' | 'alphabetical'>(defaultSort);
    // Inicia com todos expandidos
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(activities.map(a => a.id)));

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

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
                                Desempenho por Atividade
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
            <CardContent className="space-y-3">
                <TooltipProvider>
                    {sortedActivities.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            Nenhuma atividade trabalhada nesta sessão
                        </div>
                    ) : (
                        sortedActivities.map((activity) => {
                            const counts = countsByActivity[activity.id];
                            const totalCount = total(counts);
                            const status = getFisioStatus(counts);
                            const statusConfig = getFisioStatusConfig(status);
                            const duration = durationsByActivity[activity.id];
                            const metadata = metadataByActivity[activity.id];
                            const isExpanded = expandedIds.has(activity.id);

                            return (
                                <div
                                    key={activity.id}
                                    className="rounded-lg border-0 overflow-hidden transition-all bg-background"
                                >
                                    {/* Header da Atividade */}
                                    <button
                                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-muted/50 transition-colors"
                                        onClick={() => toggleExpand(activity.id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                                {activity.order}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm truncate">{activity.label}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {totalCount} tentativas
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="outline" className="text-xs bg-muted text-foreground border-border">
                                                {statusConfig.label}
                                            </Badge>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Detalhes Expandidos */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-2 border-t border-inherit space-y-4">
                                            {/* Contadores de Desempenho - 3 colunas */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#E0E7FF' }}>
                                                            <CheckCircle className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-muted-foreground">Desempenhou</p>
                                                            <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                                {counts.indep}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#DBEAFE' }}>
                                                            <HandHelping className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-muted-foreground">Com Ajuda</p>
                                                            <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                                {counts.ajuda}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#E0E7FF' }}>
                                                            <XCircle className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-muted-foreground">Não Desemp.</p>
                                                            <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                                {counts.erro}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metadados: Tempo + Indicadores */}
                                            {(duration || metadata) && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Badge de tempo */}
                                                    {duration && duration > 0 && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="text-xs font-medium text-foreground">
                                                                {duration} min
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Indicadores de metadata */}
                                                    {metadata?.usedLoad && metadata?.loadValue && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-help transition-colors" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                                                                    <Dumbbell className="h-3.5 w-3.5" />
                                                                    <span className="text-xs font-medium">Carga</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[220px] text-xs">
                                                                <div className="space-y-1">
                                                                    <div className="font-semibold">Exercício com carga</div>
                                                                    <div className="text-muted-foreground">{metadata.loadValue}</div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {metadata?.hadDiscomfort && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-help transition-colors" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                                    <span className="text-xs font-medium">Desconforto</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[280px] text-xs">
                                                                <div className="space-y-1">
                                                                    <div className="font-semibold">Desconforto apresentado</div>
                                                                    <div className="text-muted-foreground">
                                                                        {metadata.discomfortDescription || 'Sem descrição'}
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {metadata?.hadCompensation && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-help transition-colors" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                                                                    <Activity className="h-3.5 w-3.5" />
                                                                    <span className="text-xs font-medium">Compensação</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[280px] text-xs">
                                                                <div className="space-y-1">
                                                                    <div className="font-semibold">Compensação apresentada</div>
                                                                    <div className="text-muted-foreground">
                                                                        {metadata.compensationDescription || 'Sem descrição'}
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            )}

                                            {/* Descrições detalhadas de metadata */}
                                            {metadata && (metadata.loadValue || metadata.discomfortDescription || metadata.compensationDescription) && (
                                                <div className="space-y-3 pt-3 border-t border-border/40">
                                                    {metadata.loadValue && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Dumbbell className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Exercício com carga
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                                                {metadata.loadValue}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {metadata.discomfortDescription && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#D97706' }} />
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Desconforto apresentado
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                                                {metadata.discomfortDescription}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {metadata.compensationDescription && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Activity className="h-3.5 w-3.5" style={{ color: '#2563EB' }} />
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Compensação apresentada
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                                                {metadata.compensationDescription}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
