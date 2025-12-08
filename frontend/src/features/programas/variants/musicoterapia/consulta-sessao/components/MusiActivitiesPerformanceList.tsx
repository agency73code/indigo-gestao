import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Music,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    Users,
    HeartHandshake
} from 'lucide-react';

type ActivityInfo = {
    id: string;
    label: string;
    order: number;
};

type Counts = {
    erro: number;
    ajuda: number;
    indep: number;
};

type ActivityScales = {
    participacao?: number | null;
    suporte?: number | null;
};

type SortType = 'order' | 'severity' | 'performance';

interface MusiActivitiesPerformanceListProps {
    activities: ActivityInfo[];
    countsByActivity: Record<string, Counts>;
    scalesByActivity: Record<string, ActivityScales>;
    defaultSort?: SortType;
}

type StatusKind = 'verde' | 'laranja' | 'vermelho' | 'neutro';

function getActivityStatus(counts: Counts): StatusKind {
    const total = counts.erro + counts.ajuda + counts.indep;
    if (total === 0) return 'neutro';
    
    const max = Math.max(counts.indep, counts.ajuda, counts.erro);
    if (counts.indep === max) return 'verde';
    if (counts.ajuda === max) return 'laranja';
    return 'vermelho';
}

function getStatusConfig(status: StatusKind) {
    switch (status) {
        case 'verde':
            return {
                label: 'Desempenhou',
                bgColor: 'bg-green-50 dark:bg-green-950/30',
                borderColor: 'border-green-200 dark:border-green-800',
                textColor: 'text-green-700 dark:text-green-400',
                badgeCls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-700',
            };
        case 'laranja':
            return {
                label: 'Com Ajuda',
                bgColor: 'bg-amber-50 dark:bg-amber-950/30',
                borderColor: 'border-amber-200 dark:border-amber-800',
                textColor: 'text-amber-700 dark:text-amber-400',
                badgeCls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700',
            };
        case 'vermelho':
            return {
                label: 'Não Desempenhou',
                bgColor: 'bg-red-50 dark:bg-red-950/30',
                borderColor: 'border-red-200 dark:border-red-800',
                textColor: 'text-red-700 dark:text-red-400',
                badgeCls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700',
            };
        default:
            return {
                label: 'Sem dados',
                bgColor: 'bg-gray-50 dark:bg-gray-900/30',
                borderColor: 'border-gray-200 dark:border-gray-700',
                textColor: 'text-gray-500 dark:text-gray-400',
                badgeCls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
            };
    }
}

function formatParticipacao(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Mínima',
        2: 'Parcial',
        3: 'Ativa',
        4: 'Muito ativa',
        5: 'Supera expect.',
    };
    
    return labels[Math.round(value)] || `${value}`;
}

function formatSuporte(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Gestual',
        4: 'Físico leve',
        5: 'Físico máximo',
    };
    
    return labels[Math.round(value)] || `${value}`;
}

function getSeverityScore(counts: Counts): number {
    // Maior severidade = mais erros, depois ajuda, depois independente
    const total = counts.erro + counts.ajuda + counts.indep;
    if (total === 0) return 0;
    
    // Score: erro tem peso negativo alto, ajuda médio, indep baixo
    return (counts.erro * 3 + counts.ajuda * 2) / total;
}

function getPerformanceScore(counts: Counts): number {
    // Maior performance = mais independência
    const total = counts.erro + counts.ajuda + counts.indep;
    if (total === 0) return 0;
    
    return (counts.indep * 3 + counts.ajuda * 1) / total;
}

export default function MusiActivitiesPerformanceList({
    activities,
    countsByActivity,
    scalesByActivity,
    defaultSort = 'order',
}: MusiActivitiesPerformanceListProps) {
    const [sortBy, setSortBy] = useState<SortType>(defaultSort);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const sortedActivities = useMemo(() => {
        const activitiesWithData = activities.map((activity) => ({
            ...activity,
            counts: countsByActivity[activity.id] || { erro: 0, ajuda: 0, indep: 0 },
            scales: scalesByActivity[activity.id] || {},
            hasData: !!countsByActivity[activity.id],
        }));

        return activitiesWithData.sort((a, b) => {
            switch (sortBy) {
                case 'severity':
                    // Maior severidade primeiro (mais atenção necessária)
                    return getSeverityScore(b.counts) - getSeverityScore(a.counts);
                case 'performance':
                    // Melhor performance primeiro
                    return getPerformanceScore(b.counts) - getPerformanceScore(a.counts);
                case 'order':
                default:
                    return a.order - b.order;
            }
        });
    }, [activities, countsByActivity, scalesByActivity, sortBy]);

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const cycleSortBy = () => {
        setSortBy((prev) => {
            if (prev === 'order') return 'severity';
            if (prev === 'severity') return 'performance';
            return 'order';
        });
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'severity':
                return 'Prioridade';
            case 'performance':
                return 'Desempenho';
            default:
                return 'Ordem';
        }
    };

    const workedActivities = sortedActivities.filter((a) => a.hasData);
    const notWorkedActivities = sortedActivities.filter((a) => !a.hasData);

    if (activities.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade encontrada</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Desempenho por Atividade
                    <Badge variant="secondary" className="ml-2">
                        {workedActivities.length}/{activities.length}
                    </Badge>
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={cycleSortBy}
                    className="text-xs gap-1"
                >
                    <ArrowUpDown className="h-3 w-3" />
                    {getSortLabel()}
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Atividades Trabalhadas */}
                {workedActivities.map((activity) => {
                    const status = getActivityStatus(activity.counts);
                    const config = getStatusConfig(status);
                    const isExpanded = expandedIds.has(activity.id);
                    const total = activity.counts.erro + activity.counts.ajuda + activity.counts.indep;

                    return (
                        <div
                            key={activity.id}
                            className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden transition-all`}
                        >
                            {/* Header da Atividade */}
                            <button
                                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                onClick={() => toggleExpand(activity.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                        {activity.order}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{activity.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {total} tentativas
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="outline" className={`text-xs ${config.badgeCls}`}>
                                        {config.label}
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
                                <div className="px-4 pb-4 pt-2 border-t border-inherit">
                                    {/* Contadores de Desempenho */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Desempenhou</p>
                                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                    {activity.counts.indep}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                                            <HandHelping className="h-4 w-4 text-amber-600" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Com Ajuda</p>
                                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                                    {activity.counts.ajuda}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/30">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Não Desemp.</p>
                                                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                                    {activity.counts.erro}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Escalas de Participação e Suporte */}
                                    {(activity.scales.participacao !== undefined || activity.scales.suporte !== undefined) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-violet-100 dark:bg-violet-900/30">
                                                <Users className="h-4 w-4 text-violet-600" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Participação</p>
                                                    <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
                                                        {formatParticipacao(activity.scales.participacao)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-pink-100 dark:bg-pink-900/30">
                                                <HeartHandshake className="h-4 w-4 text-pink-600" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Suporte</p>
                                                    <p className="text-sm font-medium text-pink-700 dark:text-pink-400">
                                                        {formatSuporte(activity.scales.suporte)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Atividades Não Trabalhadas */}
                {notWorkedActivities.length > 0 && (
                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                            Atividades não trabalhadas ({notWorkedActivities.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {notWorkedActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 flex items-center gap-2"
                                >
                                    <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                                        {activity.order}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {activity.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
