import { useMemo, useState, useEffect } from 'react';
import { CheckCircle, History, HandHelping, XCircle, Users, HeartHandshake, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MusiSessionAttempt } from '../types';
import { calculateToPredominantResult } from '../services';

interface MusiAttemptsRegisterProps {
    attempts: MusiSessionAttempt[];
}

type Counts = {
    'nao-desempenhou': number;
    'desempenhou-com-ajuda': number;
    desempenhou: number;
};

type StatusKind = 'verde' | 'laranja' | 'vermelho';

type StatusResult = {
    kind: StatusKind;
    desempenhou: number;
    ajuda: number;
    naoDesempenhou: number;
    total: number;
};

type ActivitySummary = {
    activityId: string;
    activityLabel: string;
    counts: Counts;
    status: StatusResult;
    totalMinutes: number;
    avgParticipacao: number | null;
    avgSuport: number | null;
};

function sumCounts(a: Counts, b: Counts): Counts {
    return {
        'nao-desempenhou': a['nao-desempenhou'] + b['nao-desempenhou'],
        'desempenhou-com-ajuda': a['desempenhou-com-ajuda'] + b['desempenhou-com-ajuda'],
        desempenhou: a.desempenhou + b.desempenhou,
    };
}

function calcStatus(counts: Counts): StatusResult {
    const desempenhou = counts.desempenhou;
    const ajuda = counts['desempenhou-com-ajuda'];
    const naoDesempenhou = counts['nao-desempenhou'];
    const total = desempenhou + ajuda + naoDesempenhou;

    const kind = calculateToPredominantResult(desempenhou, ajuda, naoDesempenhou);

    return { kind, desempenhou, ajuda, naoDesempenhou, total };
}

function getStatusConfig(kind: StatusKind) {
    switch (kind) {
        case 'verde':
            return { label: 'Desempenhou', badgeCls: 'bg-muted text-foreground border-border' };
        case 'laranja':
            return { label: 'Com Ajuda', badgeCls: 'bg-muted text-foreground border-border' };
        case 'vermelho':
            return { label: 'Não Desempenhou', badgeCls: 'bg-muted text-foreground border-border' };
        default:
            return { label: 'Sem dados', badgeCls: 'bg-muted text-muted-foreground border-border' };
    }
}

function formatParticipacao(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Percebe, mas não participa',
        2: 'Tenta participar, mas não consegue',
        3: 'Participa, mas não como esperado',
        4: 'Conforme esperado',
        5: 'Supera expectativas',
    };
    
    return labels[Math.round(value)] || `${value.toFixed(1)}`;
}

function formatSuporte(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Visual',
        4: 'Parcialmente físico',
        5: 'Totalmente físico',
    };
    
    return labels[Math.round(value)] || `${value.toFixed(1)}`;
}

export default function MusiAttemptsRegister({ attempts }: MusiAttemptsRegisterProps) {
    const activitySummaries = useMemo<ActivitySummary[]>(() => {
        if (attempts.length === 0) {
            return [];
        }

        const map = new Map<string, {
            counts: Counts;
            totalMinutes: number;
            participacaoSum: number;
            suporteSum: number;
            countWithMetrics: number;
            activityLabel: string;
        }>();

        for (const attempt of attempts) {
            const increment: Counts =
                attempt.type === 'nao-desempenhou'
                    ? { 'nao-desempenhou': 1, 'desempenhou-com-ajuda': 0, desempenhou: 0 }
                    : attempt.type === 'desempenhou-com-ajuda'
                      ? { 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 1, desempenhou: 0 }
                      : { 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 0, desempenhou: 1 };

            const minutesToAdd = attempt.durationMinutes || 0;
            const participacao = attempt.participacao ?? 0;
            const suporte = attempt.suporte ?? 0;

            const existing = map.get(attempt.activityId);

            if (!existing) {
                map.set(attempt.activityId, {
                    counts: increment,
                    totalMinutes: minutesToAdd,
                    participacaoSum: participacao,
                    suporteSum: suporte,
                    countWithMetrics: (participacao > 0 || suporte > 0) ? 1 : 0,
                    activityLabel: attempt.activityLabel,
                });
                continue;
            }

            const newCounts = sumCounts(existing.counts, increment);
            map.set(attempt.activityId, {
                counts: newCounts,
                totalMinutes: attempt.durationMinutes ?? existing.totalMinutes,
                participacaoSum: existing.participacaoSum + participacao,
                suporteSum: existing.suporteSum + suporte,
                countWithMetrics: existing.countWithMetrics + ((participacao > 0 || suporte > 0) ? 1 : 0),
                activityLabel: existing.activityLabel,
            });
        }

        return Array.from(map.entries()).map(([activityId, data]) => {
            const avgParticipacao = data.countWithMetrics > 0 ? data.participacaoSum / data.countWithMetrics : null;
            const avgSuport = data.countWithMetrics > 0 ? data.suporteSum / data.countWithMetrics : null;

            return {
                activityId,
                activityLabel: data.activityLabel,
                counts: data.counts,
                status: calcStatus(data.counts),
                totalMinutes: data.totalMinutes,
                avgParticipacao,
                avgSuport,
            };
        });
    }, [attempts]);

    // Estado para controlar cards expandidos
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Manter novos cards expandidos automaticamente
    useEffect(() => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            for (const activity of activitySummaries) {
                next.add(activity.activityId);
            }
            return next;
        });
    }, [activitySummaries]);

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

    if (activitySummaries.length === 0) {
        return (
            <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Registro da Atividade
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma tentativa registrada ainda</p>
                        <p className="text-sm mt-1">Selecione uma atividade acima para comecar</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Registro Geral por Atividade
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <TooltipProvider>
                    <div className="space-y-4">
                        {activitySummaries.map((activity, index) => {
                            const counts = activity.counts;
                            const status = activity.status;
                            const config = getStatusConfig(status.kind);
                            const isExpanded = expandedIds.has(activity.activityId);

                            return (
                                <div 
                                    key={activity.activityId} 
                                    className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all"
                                >
                                    {/* Header da Atividade */}
                                    <button
                                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                                        onClick={() => toggleExpand(activity.activityId)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm truncate">{activity.activityLabel}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {status.total} tentativas
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
                                        <div 
                                            className="px-4 pb-4 pt-3 border-t border-inherit"
                                            data-testid={`activity-summary-row-${activity.activityId}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Contadores compactos */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                        <span className="text-xs text-muted-foreground">Desemp.</span>
                                                        <span className="text-sm font-semibold">{counts.desempenhou}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                        <HandHelping className="h-3.5 w-3.5 text-amber-600" />
                                                        <span className="text-xs text-muted-foreground">Ajuda</span>
                                                        <span className="text-sm font-semibold">{counts['desempenhou-com-ajuda']}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                        <span className="text-xs text-muted-foreground">Não</span>
                                                        <span className="text-sm font-semibold">{counts['nao-desempenhou']}</span>
                                                    </div>
                                                </div>

                                                {/* Separador vertical */}
                                                <div className="h-8 w-px bg-border shrink-0" />

                                                {/* Participação e Suporte */}
                                                {(activity.avgParticipacao !== null || activity.avgSuport !== null) && (
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        {activity.avgParticipacao !== null && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#EDE9FE]/50 cursor-help">
                                                                        <div className="h-10 w-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                                                            <Users className="h-5 w-5 text-violet-600" />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-xs text-muted-foreground">Participação</p>
                                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                                {formatParticipacao(activity.avgParticipacao)}
                                                                            </p>
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-violet-600 shrink-0">
                                                                            {activity.avgParticipacao.toFixed(1)}/5
                                                                        </span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[220px] text-xs">
                                                                    Média de participação do paciente nas atividades (0-5). Valores mais altos indicam maior engajamento.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {activity.avgSuport !== null && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#FCE7F3]/50 cursor-help">
                                                                        <div className="h-10 w-10 rounded-lg bg-[#FCE7F3] flex items-center justify-center shrink-0">
                                                                            <HeartHandshake className="h-5 w-5 text-pink-600" />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-xs text-muted-foreground">Suporte</p>
                                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                                {formatSuporte(activity.avgSuport)}
                                                                            </p>
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-pink-600 shrink-0">
                                                                            {activity.avgSuport.toFixed(1)}/5
                                                                        </span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[220px] text-xs">
                                                                    Nível médio de suporte necessário (1-5). Valores menores indicam maior independência do paciente.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
