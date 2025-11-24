import { useMemo } from 'react';
import { AlertCircle, CheckCircle, History, MinusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ToSessionAttempt } from '../types';
import { calculateToPredominantResult } from '../services';

interface ToAttemptsRegisterProps {
    attempts: ToSessionAttempt[];
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
            cls: 'border-green-500/40 text-green-700 bg-green-50',
            count: desempenhou,
        },
        laranja: {
            icon: MinusCircle,
            label: 'Desempenhou com Ajuda',
            cls: 'border-amber-500/40 text-amber-700 bg-amber-50',
            count: ajuda,
        },
        vermelho: {
            icon: AlertCircle,
            label: 'Não Desempenhou',
            cls: 'border-red-500/40 text-red-700 bg-red-50',
            count: naoDesempenhou,
        },
    }[kind];

    const Icon = config.icon;
    const content = `${config.label} - ${config.count}/${total}`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    className={`gap-2 p-2 rounded-[5px] ${config.cls}`}
                    data-testid={statusTestId}
                >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{content}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent data-testid={tooltipTestId} className="max-w-[220px] text-xs">
                Status predominante baseado no tipo de desempenho mais frequente nesta atividade.
                Verde: desempenhou, Laranja: desempenhou com ajuda, Vermelho: não desempenhou.
            </TooltipContent>
        </Tooltip>
    );
}

export default function ToAttemptsRegister({ attempts }: ToAttemptsRegisterProps) {
    const activitySummaries = useMemo<ActivitySummary[]>(() => {
        if (attempts.length === 0) {
            return [];
        }

        const map = new Map<string, ActivitySummary>();

        for (const attempt of attempts) {
            const increment: Counts =
                attempt.type === 'nao-desempenhou'
                    ? { 'nao-desempenhou': 1, 'desempenhou-com-ajuda': 0, desempenhou: 0 }
                    : attempt.type === 'desempenhou-com-ajuda'
                      ? { 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 1, desempenhou: 0 }
                      : { 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 0, desempenhou: 1 };

            const existing = map.get(attempt.activityId);

            if (!existing) {
                const counts = sumCounts(createEmptyCounts(), increment);
                map.set(attempt.activityId, {
                    activityId: attempt.activityId,
                    activityLabel: attempt.activityLabel,
                    counts,
                    status: calcStatus(counts),
                });
                continue;
            }

            const newCounts = sumCounts(existing.counts, increment);
            map.set(attempt.activityId, {
                activityId: existing.activityId,
                activityLabel: existing.activityLabel,
                counts: newCounts,
                status: calcStatus(newCounts),
            });
        }

        return Array.from(map.values());
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
                                            <Badge variant="outline" className="p-2 rounded-[5px]">
                                                Não desempenhou: {counts['nao-desempenhou']}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-[5px]">
                                                Desempenhou com ajuda: {counts['desempenhou-com-ajuda']}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-[5px]">
                                                Desempenhou: {counts.desempenhou}
                                            </Badge>

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
                                                <Badge
                                                    variant="outline"
                                                    className="font-semibold p-2 rounded-[5px]"
                                                >
                                                    Total: {totalCounts}
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
