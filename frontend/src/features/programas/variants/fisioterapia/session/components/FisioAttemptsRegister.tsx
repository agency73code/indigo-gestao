import { useMemo } from 'react';
import { AlertCircle, CheckCircle, History, MinusCircle, Clock, Dumbbell, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { FisioSessionAttempt } from '../types';
import { calculateToPredominantResult } from '../services';

interface ToAttemptsRegisterProps {
    attempts: FisioSessionAttempt[];
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
    usedLoad?: boolean;
    loadValue?: string;
    hadDiscomfort?: boolean;
    discomfortDescription?: string;
    hadCompensation?: boolean;
    compensationDescription?: string;
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
    statusTestId: string;
    tooltipTestId: string;
};

function StatusBadge({ kind, desempenhou, ajuda, naoDesempenhou, statusTestId, tooltipTestId }: StatusBadgeProps) {
    const config = {
        verde: {
            icon: CheckCircle,
            label: 'Desempenhou',
            cls: 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
            count: desempenhou,
        },
        laranja: {
            icon: MinusCircle,
            label: 'Desempenhou com Ajuda',
            cls: 'text-amber-700 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
            count: ajuda,
        },
        vermelho: {
            icon: AlertCircle,
            label: 'Não Desempenhou',
            cls: 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
            count: naoDesempenhou,
        },
    }[kind];

    const Icon = config.icon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-help ${config.cls}`}
                    data-testid={statusTestId}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{config.label}</span>
                </div>
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

            const minutesToAdd = attempt.durationMinutes || 0;

            const existing = map.get(attempt.activityId);

            if (!existing) {
                const counts = sumCounts(createEmptyCounts(), increment);
                map.set(attempt.activityId, {
                    activityId: attempt.activityId,
                    activityLabel: attempt.activityLabel,
                    counts,
                    status: calcStatus(counts),
                    totalMinutes: minutesToAdd,
                    // Armazenar dados da última tentativa
                    usedLoad: attempt.usedLoad,
                    loadValue: attempt.loadValue,
                    hadDiscomfort: attempt.hadDiscomfort,
                    discomfortDescription: attempt.discomfortDescription,
                    hadCompensation: attempt.hadCompensation,
                    compensationDescription: attempt.compensationDescription,
                });
                continue;
            }

            const newCounts = sumCounts(existing.counts, increment);
            map.set(attempt.activityId, {
                activityId: existing.activityId,
                activityLabel: existing.activityLabel,
                counts: newCounts,
                status: calcStatus(newCounts),
                // Usar o último tempo informado ao invés de somar
                totalMinutes: attempt.durationMinutes ?? existing.totalMinutes,
                // Atualizar com dados da última tentativa
                usedLoad: attempt.usedLoad ?? existing.usedLoad,
                loadValue: attempt.loadValue || existing.loadValue,
                hadDiscomfort: attempt.hadDiscomfort ?? existing.hadDiscomfort,
                discomfortDescription: attempt.discomfortDescription || existing.discomfortDescription,
                hadCompensation: attempt.hadCompensation ?? existing.hadCompensation,
                compensationDescription: attempt.compensationDescription || existing.compensationDescription,
            });
        }

        return Array.from(map.values());
    }, [attempts]);

    if (activitySummaries.length === 0) {
        return (
            <Card 
                padding="hub" 
                className="rounded-lg border-0 shadow-none"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Registro da Atividade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma tentativa registrada ainda</p>
                        <p className="text-sm mt-1">Selecione uma atividade acima para começar</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card 
            padding="hub" 
            className="rounded-lg border-0 shadow-none"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader className="pb-3 border-b border-border/40 dark:border-white/15">
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Registro Geral por Atividade
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activitySummaries.map((activity) => {
                            const counts = activity.counts;
                            const status = activity.status;
                            const totalCounts = status.total;

                            return (
                                <div
                                    key={activity.activityId}
                                    className="border border-border/40 dark:border-white/15 rounded-lg hover:bg-muted/30 dark:hover:bg-white/5 transition-colors overflow-hidden"
                                    style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                                    data-testid={`activity-summary-row-${activity.activityId}`}
                                >
                                    {/* Cabeçalho: Título + Stats */}
                                    <div className="p-4 space-y-3 border-b border-border/40 dark:border-white/15">
                                        {/* Título da atividade */}
                                        <div className="font-medium text-sm">
                                            {activity.activityLabel}
                                        </div>

                                        {/* Stats com ícones coloridos */}
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {/* Desempenhou */}
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                <div className="flex items-center justify-center w-5 h-5 rounded bg-green-600/10">
                                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                                </div>
                                                <span className="text-xs text-foreground font-medium">
                                                    {counts.desempenhou}
                                                </span>
                                            </div>

                                            {/* Com Ajuda */}
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                <div className="flex items-center justify-center w-5 h-5 rounded bg-yellow-600/10">
                                                    <MinusCircle className="w-3 h-3 text-yellow-600" />
                                                </div>
                                                <span className="text-xs text-foreground font-medium">
                                                    {counts['desempenhou-com-ajuda']}
                                                </span>
                                            </div>

                                            {/* Não Desempenhou */}
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                                <div className="flex items-center justify-center w-5 h-5 rounded bg-red-600/10">
                                                    <AlertCircle className="w-3 h-3 text-red-600" />
                                                </div>
                                                <span className="text-xs text-foreground font-medium">
                                                    {counts['nao-desempenhou']}
                                                </span>
                                            </div>

                                            {/* Total */}
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 ml-auto">
                                                <span className="text-xs text-muted-foreground">Total:</span>
                                                <span className="text-xs font-semibold text-foreground">
                                                    {totalCounts}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rodapé: Status + Tempo + Indicadores */}
                                    <div className="p-4 flex flex-wrap items-center gap-2">
                                        <StatusBadge
                                            kind={status.kind}
                                            desempenhou={status.desempenhou}
                                            ajuda={status.ajuda}
                                            naoDesempenhou={status.naoDesempenhou}
                                            statusTestId={`activity-status-${activity.activityId}`}
                                            tooltipTestId={`activity-status-tip-${activity.activityId}`}
                                        />
                                        
                                        {/* Tempo */}
                                        {activity.totalMinutes > 0 && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20">
                                                        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                                            {activity.totalMinutes} min
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[220px] text-xs">
                                                    Tempo total gasto nas tentativas desta atividade
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {/* Indicadores compactos - apenas ícones */}
                                        <div className="flex items-center gap-1.5 ml-auto">
                                            {/* Carga */}
                                            {activity.usedLoad && activity.loadValue && (
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
                                                            <div className="text-muted-foreground">{activity.loadValue}</div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}

                                            {/* Desconforto */}
                                            {activity.hadDiscomfort && (
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
                                                                {activity.discomfortDescription || 'Sem descrição'}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}

                                            {/* Compensação */}
                                            {activity.hadCompensation && (
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
                                                                {activity.compensationDescription || 'Sem descrição'}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
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
