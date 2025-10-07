import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, History, Info, MinusCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SessionAttempt } from '../types';

interface AttemptsRegisterProps {
    attempts: SessionAttempt[];
}

type Counts = {
    erro: number;
    ajuda: number;
    indep: number;
};

type StatusKind = 'insuficiente' | 'positivo' | 'mediano' | 'atencao' | 'critico';

type StatusResult = {
    kind: StatusKind;
    ti: number;
    total: number;
};

type StimulusSummary = {
    stimulusId: string;
    stimulusLabel: string;
    counts: Counts;
    status: StatusResult;
};

const createEmptyCounts = (): Counts => ({ erro: 0, ajuda: 0, indep: 0 });

function sumCounts(a: Counts, b: Counts): Counts {
    return {
        erro: a.erro + b.erro,
        ajuda: a.ajuda + b.ajuda,
        indep: a.indep + b.indep,
    };
}

function calcStatus(counts: Counts): StatusResult {
    const total = counts.erro + counts.ajuda + counts.indep;
    const ti = total === 0 ? 0 : Math.round((counts.indep / total) * 100);

    if (total < 5) {
        return { kind: 'insuficiente', ti, total };
    }
    if (ti >= 80) {
        return { kind: 'positivo', ti, total };
    }
    if (ti >= 60) {
        return { kind: 'mediano', ti, total };
    }
    if (ti >= 40) {
        return { kind: 'atencao', ti, total };
    }
    return { kind: 'critico', ti, total };
}

type StatusBadgeProps = {
    kind: StatusKind;
    ti: number;
    indep: number;
    total: number;
    statusTestId: string;
    tooltipTestId: string;
};

function StatusBadge({ kind, ti, indep, total, statusTestId, tooltipTestId }: StatusBadgeProps) {
    const config = {
        insuficiente: {
            icon: Info,
            label: 'Coleta insuficiente',
            cls: 'border-muted text-muted-foreground bg-muted/40',
        },
        positivo: {
            icon: CheckCircle,
            label: 'Positivo',
            cls: 'border-green-500/40 text-green-700 bg-green-50',
        },
        mediano: {
            icon: MinusCircle,
            label: 'Mediano',
            cls: 'border-amber-500/40 text-amber-700 bg-amber-50',
        },
        atencao: {
            icon: AlertTriangle,
            label: 'Atencao',
            cls: 'border-orange-500/40 text-orange-700 bg-orange-50',
        },
        critico: {
            icon: XCircle,
            label: 'Critico',
            cls: 'border-red-500/40 text-red-700 bg-red-50',
        },
    }[kind];

    const Icon = config.icon;
    const content =
        kind === 'insuficiente' ? config.label : `${config.label} - ${ti}% (${indep}/${total})`;

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
                Percentual de respostas independentes nesta sessao para este estimulo. Calculo:
                INDEP / (ERRO+AJUDA+INDEP).
            </TooltipContent>
        </Tooltip>
    );
}

export default function AttemptsRegister({ attempts }: AttemptsRegisterProps) {
    const stimulusSummaries = useMemo<StimulusSummary[]>(() => {
        if (attempts.length === 0) {
            return [];
        }

        const map = new Map<string, StimulusSummary>();

        for (const attempt of attempts) {
            const increment: Counts =
                attempt.type === 'error'
                    ? { erro: 1, ajuda: 0, indep: 0 }
                    : attempt.type === 'prompted'
                      ? { erro: 0, ajuda: 1, indep: 0 }
                      : { erro: 0, ajuda: 0, indep: 1 };

            const existing = map.get(attempt.stimulusId);

            if (!existing) {
                const counts = sumCounts(createEmptyCounts(), increment);
                map.set(attempt.stimulusId, {
                    stimulusId: attempt.stimulusId,
                    stimulusLabel: attempt.stimulusLabel,
                    counts,
                    status: calcStatus(counts),
                });
                continue;
            }

            const newCounts = sumCounts(existing.counts, increment);
            map.set(attempt.stimulusId, {
                stimulusId: existing.stimulusId,
                stimulusLabel: existing.stimulusLabel,
                counts: newCounts,
                status: calcStatus(newCounts),
            });
        }

        return Array.from(map.values());
    }, [attempts]);

    if (stimulusSummaries.length === 0) {
        return (
            <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Registro do Estimulo
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma tentativa registrada ainda</p>
                        <p className="text-sm mt-1">Selecione um estimulo acima para comecar</p>
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
                    Registro geral por estimulo
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <TooltipProvider>
                    <div className="space-y-3">
                        {stimulusSummaries.map((stimulus) => {
                            const counts = stimulus.counts;
                            const status = stimulus.status;
                            const totalCounts = status.total;

                            return (
                                <div key={stimulus.stimulusId} className="border rounded-[5px]">
                                    <div className="px-4 py-3 bg-muted/30">
                                        <div className="font-medium text-sm truncate ">
                                            {stimulus.stimulusLabel}
                                        </div>
                                    </div>

                                    <div
                                        className="px-4 py-3"
                                        data-testid={`stim-summary-row-${stimulus.stimulusId}`}
                                    >
                                        <div className="flex flex-wrap items-center gap-3 ">
                                            <Badge variant="outline" className="p-2 rounded-[5px]">
                                                Erro: {counts.erro}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-[5px]">
                                                Ajuda: {counts.ajuda}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-[5px]">
                                                Indep.: {counts.indep}
                                            </Badge>

                                            <div className="ml-auto flex items-center gap-3 ">
                                                <StatusBadge
                                                    kind={status.kind}
                                                    ti={status.ti}
                                                    indep={counts.indep}
                                                    total={totalCounts}
                                                    statusTestId={`stim-status-${stimulus.stimulusId}`}
                                                    tooltipTestId={`stim-status-tip-${stimulus.stimulusId}`}
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
