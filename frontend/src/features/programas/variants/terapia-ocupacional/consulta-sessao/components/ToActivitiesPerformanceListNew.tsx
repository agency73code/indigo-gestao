import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Activity,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    Clock,
    FileText
} from 'lucide-react';
import type { Counts } from '@/features/programas/consulta-sessao/pages/helpers';

type ActivityInfo = {
    id: string;
    label: string;
    order: number;
    description?: string | null;
};

type SortType = 'order' | 'severity' | 'performance';

interface ToActivitiesPerformanceListProps {
    activities: ActivityInfo[];
    countsByActivity: Record<string, Counts>;
    durationsByActivity?: Record<string, number | null>;
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
                bgColor: 'bg-muted/30',
                borderColor: 'border-border',
                textColor: 'text-foreground',
                badgeCls: 'bg-muted text-foreground border-border',
            };
        case 'laranja':
            return {
                label: 'Com Ajuda',
                bgColor: 'bg-muted/30',
                borderColor: 'border-border',
                textColor: 'text-foreground',
                badgeCls: 'bg-muted text-foreground border-border',
            };
        case 'vermelho':
            return {
                label: 'Não Desempenhou',
                bgColor: 'bg-muted/30',
                borderColor: 'border-border',
                textColor: 'text-foreground',
                badgeCls: 'bg-muted text-foreground border-border',
            };
        default:
            return {
                label: 'Sem dados',
                bgColor: 'bg-muted/30',
                borderColor: 'border-border',
                textColor: 'text-muted-foreground',
                badgeCls: 'bg-muted text-muted-foreground border-border',
            };
    }
}

function getSeverityScore(counts: Counts): number {
    const total = counts.erro + counts.ajuda + counts.indep;
    if (total === 0) return 0;
    return (counts.erro * 3 + counts.ajuda * 2) / total;
}

function getPerformanceScore(counts: Counts): number {
    const total = counts.erro + counts.ajuda + counts.indep;
    if (total === 0) return 0;
    return (counts.indep * 3 + counts.ajuda * 1) / total;
}

export default function ToActivitiesPerformanceList({
    activities,
    countsByActivity,
    durationsByActivity = {},
    defaultSort = 'order',
}: ToActivitiesPerformanceListProps) {
    const [sortBy, setSortBy] = useState<SortType>(defaultSort);
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
        const activitiesWithData = activities.map((activity) => {
            const counts = countsByActivity[activity.id] || { erro: 0, ajuda: 0, indep: 0 };
            const hasData = counts.erro + counts.ajuda + counts.indep > 0;
            return {
                ...activity,
                counts,
                hasData,
            };
        });

        switch (sortBy) {
            case 'severity':
                return [...activitiesWithData].sort((a, b) => {
                    if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
                    return getSeverityScore(b.counts) - getSeverityScore(a.counts);
                });
            case 'performance':
                return [...activitiesWithData].sort((a, b) => {
                    if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
                    return getPerformanceScore(a.counts) - getPerformanceScore(b.counts);
                });
            case 'order':
            default:
                return [...activitiesWithData].sort((a, b) => a.order - b.order);
        }
    }, [activities, countsByActivity, sortBy]);

    const cycleSortBy = () => {
        const order: SortType[] = ['order', 'severity', 'performance'];
        const currentIndex = order.indexOf(sortBy);
        const nextIndex = (currentIndex + 1) % order.length;
        setSortBy(order[nextIndex]);
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
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade encontrada</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-lg border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
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
                    const duration = durationsByActivity[activity.id];

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
                                <div className="px-4 pb-4 pt-2 border-t border-inherit space-y-4">
                                    {/* Descrição da Atividade - antes dos cards, igual musicoterapia */}
                                    {activity.description && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileText className="h-3 w-3 shrink-0" />
                                                <span className="font-medium">Descrição</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {activity.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contadores de Desempenho + Tempo - 4 colunas */}
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-md bg-[#E0E7FF] flex items-center justify-center shrink-0">
                                                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Desempenhou</p>
                                                    <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                        {activity.counts.indep}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-md bg-[#DBEAFE] flex items-center justify-center shrink-0">
                                                    <HandHelping className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Com Ajuda</p>
                                                    <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                        {activity.counts.ajuda}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-md bg-[#E0E7FF] flex items-center justify-center shrink-0">
                                                    <XCircle className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Não Desemp.</p>
                                                    <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                        {activity.counts.erro}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-md bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                                    <Clock className="h-4 w-4 text-violet-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Tempo</p>
                                                    <p className="text-xl font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                        {duration && duration > 0 ? `${duration} min` : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Atividades Não Trabalhadas - igual musicoterapia */}
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
