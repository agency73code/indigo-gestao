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
    HeartHandshake,
    FileText
} from 'lucide-react';

type ActivityInfo = {
    id: string;
    label: string;
    order: number;
    objetivoEspecifico?: string | null;
    metodos?: string | null;
    tecnicasProcedimentos?: string | null;
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

function formatParticipacao(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Percebe, mas não participa',
        2: 'Tenta participar, mas não consegue',
        3: 'Participa, mas não como esperado',
        4: 'Conforme esperado',
        5: 'Supera expectativas',
    };
    
    return labels[Math.round(value)] || `${value}`;
}

function formatSuporte(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Visual',
        4: 'Parcialmente físico',
        5: 'Totalmente físico',
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
    // Inicia com todos expandidos
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(activities.map(a => a.id)));

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
        <Card className="rounded-lg border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
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
                                    {/* Descrição da Atividade (Sempre aberta) */}
                                    {(activity.objetivoEspecifico || activity.metodos || activity.tecnicasProcedimentos) && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileText className="h-3 w-3 shrink-0" />
                                                <span className="font-medium">Descrição</span>
                                            </div>
                                            <div className="space-y-3">
                                                {/* Grid com Objetivo Específico e Métodos lado a lado */}
                                                {(activity.objetivoEspecifico || activity.metodos) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {activity.objetivoEspecifico && (
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                    OBJETIVO ESPECÍFICO
                                                                </p>
                                                                <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                                    {activity.objetivoEspecifico}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {activity.metodos && (
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                    MÉTODOS
                                                                </p>
                                                                <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                                    {activity.metodos}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Técnicas/Procedimentos em largura completa */}
                                                {activity.tecnicasProcedimentos && (
                                                    <div className="pt-3 border-t space-y-1">
                                                        <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            TÉCNICAS/PROCEDIMENTOS
                                                        </p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                            {activity.tecnicasProcedimentos}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contadores de Desempenho - 3 colunas */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-lg bg-[#E0E7FF]" style={{ backgroundColor: 'var(--hub-card-background)' }}>
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
                                    </div>

                                    {/* Participação e Suporte - 2 colunas (mais espaço) */}
                                    {(activity.scales.participacao !== undefined || activity.scales.suporte !== undefined) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {activity.scales.participacao !== undefined && (
                                                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-14 w-14 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                                            <Users className="h-6 w-6 text-violet-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-muted-foreground mb-0.5">Participação</p>
                                                            <p className="text-base font-medium text-foreground leading-tight">
                                                                {formatParticipacao(activity.scales.participacao)}
                                                            </p>
                                                            {activity.scales.participacao !== null && activity.scales.participacao !== undefined && (
                                                                <p className="text-xs text-violet-600 mt-0.5" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                                    {activity.scales.participacao.toFixed(1)}/5
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activity.scales.suporte !== undefined && (
                                                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hub-card-background)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-14 w-14 rounded-lg bg-[#FCE7F3] flex items-center justify-center shrink-0">
                                                            <HeartHandshake className="h-6 w-6 text-pink-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-muted-foreground mb-0.5">Suporte</p>
                                                            <p className="text-base font-medium text-foreground leading-tight">
                                                                {formatSuporte(activity.scales.suporte)}
                                                            </p>
                                                            {activity.scales.suporte !== null && activity.scales.suporte !== undefined && (
                                                                <p className="text-xs text-pink-600 mt-0.5" style={{ fontFamily: 'Sora, sans-serif' }}>
                                                                    {activity.scales.suporte.toFixed(1)}/5
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
