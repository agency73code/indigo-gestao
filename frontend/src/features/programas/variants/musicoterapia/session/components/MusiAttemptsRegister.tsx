import { useMemo } from 'react';
import { AlertCircle, CheckCircle, History, MinusCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MusiSessionAttempt } from '../types';
import { calculateMusiPredominantResult } from '../services';

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

    const kind = calculateMusiPredominantResult(desempenhou, ajuda, naoDesempenhou);

    return { kind, desempenhou, ajuda, naoDesempenhou, total };
}

type StatusBadgeProps = {
    kind: StatusKind;
    desempenhou: number;
    ajuda: number;
    naoDesempenhou: number;
    total: number;
};

function StatusBadge({ kind, desempenhou, ajuda, naoDesempenhou, total }: StatusBadgeProps) {
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
                >
                    <Icon className="h-4 w-4" />
                    {config.count}/{total}
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                <p className="text-xs">{content}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default function MusiAttemptsRegister({ attempts }: MusiAttemptsRegisterProps) {
    const summaries = useMemo(() => {
        const map = new Map<string, ActivitySummary>();

        attempts.forEach((attempt) => {
            const existing = map.get(attempt.activityId);
            if (!existing) {
                const counts = createEmptyCounts();
                counts[attempt.type] = 1;
                map.set(attempt.activityId, {
                    activityId: attempt.activityId,
                    activityLabel: attempt.activityLabel,
                    counts,
                    status: calcStatus(counts),
                    totalMinutes: attempt.durationMinutes ?? 0,
                });
            } else {
                const newCounts = { ...existing.counts };
                newCounts[attempt.type] += 1;
                map.set(attempt.activityId, {
                    ...existing,
                    counts: newCounts,
                    status: calcStatus(newCounts),
                    totalMinutes: existing.totalMinutes + (attempt.durationMinutes ?? 0),
                });
            }
        });

        return Array.from(map.values());
    }, [attempts]);

    const globalCounts = useMemo(() => {
        return summaries.reduce(
            (acc, summary) => sumCounts(acc, summary.counts),
            createEmptyCounts()
        );
    }, [summaries]);

    const globalStatus = useMemo(() => calcStatus(globalCounts), [globalCounts]);

    if (attempts.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Histórico de Tentativas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-[5px]">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma tentativa registrada ainda</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <TooltipProvider>
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Histórico de Tentativas
                            <Badge variant="secondary" className="ml-2">
                                {attempts.length}
                            </Badge>
                        </CardTitle>
                        <StatusBadge
                            kind={globalStatus.kind}
                            desempenhou={globalStatus.desempenhou}
                            ajuda={globalStatus.ajuda}
                            naoDesempenhou={globalStatus.naoDesempenhou}
                            total={globalStatus.total}
                        />
                    </div>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="space-y-3">
                        {summaries.map((summary) => (
                            <div
                                key={summary.activityId}
                                className="p-3 rounded-[5px] border bg-muted/30"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">
                                        {summary.activityLabel}
                                    </span>
                                    <StatusBadge
                                        kind={summary.status.kind}
                                        desempenhou={summary.status.desempenhou}
                                        ajuda={summary.status.ajuda}
                                        naoDesempenhou={summary.status.naoDesempenhou}
                                        total={summary.status.total}
                                    />
                                </div>
                                {summary.totalMinutes > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {summary.totalMinutes} minutos
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
