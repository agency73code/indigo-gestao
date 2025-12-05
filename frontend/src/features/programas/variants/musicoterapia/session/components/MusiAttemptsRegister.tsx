import { useMemo } from 'react';
import { AlertCircle, CheckCircle, History, MinusCircle, TrendingUp, HandHeart } from 'lucide-react';
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

const createEmptyCounts = (): Counts => ({ 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 0, desempenhou: 0 });

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

type StatusBadgeProps = {
    kind: StatusKind;
    desempenhou: number;
    ajuda: number;
    naoDesempenhou: number;
    total: number;
    statusTestId: string;
    tooltipTestId: string;
};

function StatusBadge({ kind, desempenhou, ajuda, naoDesempenhou, total, statusTestId, tooltipTestId }: StatusBadgeProps) {
    const config = {
        verde: {
            icon: CheckCircle,
            label: 'Desempenhou',
            cls: 'text-green-700 bg-green-100 hover:bg-green-200 border-0',
            count: desempenhou,
        },
        laranja: {
            icon: MinusCircle,
            label: 'Desempenhou com Ajuda',
            cls: 'text-amber-700 bg-amber-100 hover:bg-amber-200 border-0',
            count: ajuda,
        },
        vermelho: {
            icon: AlertCircle,
            label: 'Não Desempenhou',
            cls: 'text-red-700 bg-red-100 hover:bg-red-200 border-0',
            count: naoDesempenhou,
        },
    }[kind];

    const Icon = config.icon;
    const content = `${config.label} - ${config.count}/${total}`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="secondary"
                    className={`gap-1.5 px-3 py-1 ${config.cls}`}
                    data-testid={statusTestId}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{content}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent data-testid={tooltipTestId} className="max-w-[220px] text-xs">
                Status predominante baseado no tipo de desempenho mais frequente nesta atividade.
                Verde: desempenhou, Laranja: desempenhou com ajuda, Vermelho: não desempenhou.
            </TooltipContent>
        </Tooltip>
    );
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
                    <div className="space-y-3">
                        {activitySummaries.map((activity) => {
                            const counts = activity.counts;
                            const status = activity.status;
                            const totalCounts = status.total;

                            return (
                                <div key={activity.activityId} className="border rounded-[5px]">
                                    <div className="px-4 py-3 bg-muted/30">
                                        <div className="font-medium text-sm truncate ">
                                            {activity.activityLabel}
                                        </div>
                                    </div>

                                    <div
                                        className="px-4 py-3"
                                        data-testid={`activity-summary-row-${activity.activityId}`}
                                    >
                                        <div className="flex flex-wrap items-center gap-3 ">
                                            <Badge variant="secondary" className="px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 border-0">
                                                <span className="text-xs font-medium">Não desempenhou: {counts['nao-desempenhou']}</span>
                                            </Badge>
                                            <Badge variant="secondary" className="px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 border-0">
                                                <span className="text-xs font-medium">Desempenhou com ajuda: {counts['desempenhou-com-ajuda']}</span>
                                            </Badge>
                                            <Badge variant="secondary" className="px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 border-0">
                                                <span className="text-xs font-medium">Desempenhou: {counts.desempenhou}</span>
                                            </Badge>

                                            {/* Badges de Participação e Suporte específicos de Musicoterapia */}
                                            {activity.avgParticipacao !== null && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            variant="secondary"
                                                            className="gap-1.5 px-3 py-1 text-purple-700 bg-purple-100 hover:bg-purple-200 border-0"
                                                        >
                                                            <TrendingUp className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-medium">
                                                                Participação: {activity.avgParticipacao.toFixed(1)}
                                                            </span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[220px] text-xs">
                                                        Média de participação do paciente nas atividades (0-5). Valores mais altos indicam maior engajamento.
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}

                                            {activity.avgSuport !== null && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge
                                                            variant="secondary"
                                                            className="gap-1.5 px-3 py-1 text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border-0"
                                                        >
                                                            <HandHeart className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-medium">
                                                                Suporte: {activity.avgSuport.toFixed(1)}
                                                            </span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[220px] text-xs">
                                                        Nível médio de suporte necessário (1-5). Valores menores indicam maior independência do paciente.
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}

                                            <div className="ml-auto flex items-center gap-3 ">
                                                <StatusBadge
                                                    kind={status.kind}
                                                    desempenhou={status.desempenhou}
                                                    ajuda={status.ajuda}
                                                    naoDesempenhou={status.naoDesempenhou}
                                                    total={status.total}
                                                    statusTestId={`activity-status-${activity.activityId}`}
                                                    tooltipTestId={`activity-status-tip-${activity.activityId}`}
                                                />
                                                
                                                <Badge variant="secondary" className="px-3 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 border-0">
                                                    <span className="text-xs font-semibold">Total: {totalCounts}</span>
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
