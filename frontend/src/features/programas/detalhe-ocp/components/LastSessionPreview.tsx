import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Info,
    MinusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SessionAttempt } from '@/features/programas/nova-sessao/types';
import { getSessionById, findSessionById } from '@/features/programas/consulta-sessao/services';
import type { Sessao } from '@/features/programas/consulta-sessao/types';
import type { SessionListItem } from '../types';

interface LastSessionPreviewProps {
    lastSession: SessionListItem | null;
    patientId: string;
}

type Counts = {
    erro: number;
    ajuda: number;
    indep: number;
};

type StatusKind = 'insuficiente' | 'positivo' | 'mediano' | 'atencao';

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

const EMPTY_COUNTS: Counts = { erro: 0, ajuda: 0, indep: 0 };

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
    if (ti > 80) {
        return { kind: 'positivo', ti, total };
    }
    if (ti > 60) {
        return { kind: 'mediano', ti, total };
    }
    return { kind: 'atencao', ti, total };
}

type StatusBadgeProps = {
    summary: StimulusSummary;
    statusTestId: string;
    tooltipTestId: string;
};

type StatusBadgeConfig = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    cls: string;
};

const STATUS_CONFIG: Record<StatusKind, StatusBadgeConfig> = {
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
        icon: AlertCircle,
        label: 'Atencao',
        cls: 'border-orange-500/40 text-orange-700 bg-orange-50',
    },
};

function StatusBadge({ summary, statusTestId, tooltipTestId }: StatusBadgeProps) {
    const { status, counts } = summary;
    const config = STATUS_CONFIG[status.kind];
    const Icon = config.icon;

    const content =
        status.kind === 'insuficiente'
            ? config.label
            : `${config.label} - ${status.ti}% (${counts.indep}/${status.total})`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    className={`gap-2 p-2 rounded-lg ${config.cls}`}
                    data-testid={statusTestId}
                >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{content}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent data-testid={tooltipTestId} className="max-w-[220px] text-xs">
                Percentual de respostas independentes para este estimulo nesta sessao.
            </TooltipContent>
        </Tooltip>
    );
}

function mapRegistroToAttempt(session: Sessao): SessionAttempt[] {
    return session.registros.map((registro) => {
        const type: SessionAttempt['type'] =
            registro.resultado === 'erro'
                ? 'error'
                : registro.resultado === 'ajuda'
                  ? 'prompted'
                  : 'independent';

        const fallbackId = registro.stimulusId ?? `stim-${registro.tentativa}`;
        const fallbackLabel = registro.stimulusLabel ?? `Estimulo ${registro.tentativa}`;

        return {
            id: `${session.id}-${registro.tentativa}`,
            attemptNumber: registro.tentativa,
            stimulusId: fallbackId,
            stimulusLabel: fallbackLabel,
            type,
            timestamp: new Date(session.data).toISOString(),
        } satisfies SessionAttempt;
    });
}

function buildSummaries(attempts: SessionAttempt[]): StimulusSummary[] {
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
            const counts = sumCounts(EMPTY_COUNTS, increment);
            map.set(attempt.stimulusId, {
                stimulusId: attempt.stimulusId,
                stimulusLabel: attempt.stimulusLabel,
                counts,
                status: calcStatus(counts),
            });
            continue;
        }

        const counts = sumCounts(existing.counts, increment);
        map.set(attempt.stimulusId, {
            stimulusId: existing.stimulusId,
            stimulusLabel: existing.stimulusLabel,
            counts,
            status: calcStatus(counts),
        });
    }

    return Array.from(map.values());
}

export default function LastSessionPreview({ lastSession, patientId }: LastSessionPreviewProps) {
    const [attempts, setAttempts] = useState<SessionAttempt[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadSession = async () => {
            if (!lastSession) {
                setAttempts([]);
                return;
            }

            setLoading(true);
            try {
                let session: Sessao | null = null;
                if (patientId) {
                    session = await getSessionById(patientId, lastSession.id);
                }
                if (!session) {
                    session = await findSessionById(lastSession.id);
                }
                if (!session || cancelled) {
                    setAttempts([]);
                    return;
                }
                setAttempts(mapRegistroToAttempt(session));
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSession();

        return () => {
            cancelled = true;
        };
    }, [lastSession, patientId]);

    const summaries = useMemo(() => buildSummaries(attempts), [attempts]);

    if (!lastSession) {
        return null;
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const showEmptyState = !loading && summaries.length === 0;

    const helperText = (
        <span>
            Resumo por estimulo desta sessao: contagens de Erro, Ajuda e Indep., Total e o{' '}
            <strong>Status</strong> calculado pelo % de respostas independentes.
        </span>
    );

    return (
        <Card className="rounded-lg px-6 py-0 md:px-8 md:py-10 lg:px-8 lg:py-2" data-print-block>
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle
                            className="text-base flex items-center gap-2"
                            data-testid="ultima-sessao-title"
                        >
                            <Clock className="h-4 w-4" />
                            Ultima sessao - desempenho por estimulo ({formatDate(lastSession.date)})
                        </CardTitle>
                        <Badge variant="outline" data-testid="ultima-sessao-meta-badge">
                            Meta: Independencia &gt;= 80%
                        </Badge>
                    </div>
                    <div
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                        data-testid="ultima-sessao-helper"
                    >
                        {helperText}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground"
                                        data-testid="ultima-sessao-tip"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[260px] text-xs">
                                    Status = INDEP / (Erro + Ajuda + INDEP). Positivo &gt;80%,
                                    Mediano &gt;60% e &lt;=80%, Atenção &lt;=60%. Se total {'<'}
                                    5, exibimos "Coleta insuficiente".
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <TooltipProvider>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">
                            Carregando dados da ultima sessao...
                        </div>
                    ) : showEmptyState ? (
                        <div className="text-sm text-muted-foreground">
                            Nenhum dado de tentativa foi encontrado para esta sessao.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {summaries.map((summary) => (
                                <div
                                    key={summary.stimulusId}
                                    className="border rounded-lg"
                                    data-testid={`stim-summary-row-${summary.stimulusId}`}
                                >
                                    <div className="px-4 py-3 bg-muted/30">
                                        <div className="font-medium text-sm truncate">
                                            {summary.stimulusLabel}
                                        </div>
                                    </div>
                                    <div className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="outline" className="p-2 rounded-lg">
                                                Erro: {summary.counts.erro}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-lg">
                                                Ajuda: {summary.counts.ajuda}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-lg">
                                                Indep.: {summary.counts.indep}
                                            </Badge>
                                            <div className="ml-auto flex items-center gap-3">
                                                <StatusBadge
                                                    summary={summary}
                                                    statusTestId={`stim-status-${summary.stimulusId}`}
                                                    tooltipTestId={`stim-status-tip-${summary.stimulusId}`}
                                                />
                                                <Badge
                                                    variant="outline"
                                                    className="font-semibold p-2 rounded-lg"
                                                >
                                                    Total: {summary.status.total}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
