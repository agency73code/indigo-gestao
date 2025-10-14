import { useMemo, useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Filters } from '../types';
import type { Sessao } from '@/features/programas/consulta-sessao/types';
import {
    aggregateByStimulus,
    getStatusConfig,
    sortBySeverity,
    sumCounts,
    ti,
    toStatus,
    total,
    type Counts,
    type StatusKind,
} from '@/features/programas/consulta-sessao/pages/helpers';

type WindowSize = 1 | 3 | 5;

type AttentionStimuliBlockProps = {
    sessions: Sessao[];
    filters: Filters;
    loading?: boolean;
    error?: string | null;
};

type AggregatedStimulus = {
    id: string;
    label: string;
    counts: Counts;
    total: number;
    independence: number;
    status: StatusKind;
};

const SEVERITY_WHITELIST: StatusKind[] = ['critico', 'atencao'];

const WINDOW_OPTIONS: Array<{ label: string; value: WindowSize }> = [
    { label: 'Últimas 1', value: 1 },
    { label: 'Últimas 3', value: 3 },
    { label: 'Últimas 5', value: 5 },
];

function severityRank(kind: StatusKind) {
    if (kind === 'critico') return 0;
    if (kind === 'atencao') return 1;
    return 2;
}

function filterSessionsByFilters(sessions: Sessao[], filters: Filters): Sessao[] {
    const { periodo, terapeutaId, programaId } = filters;
    const now = Date.now();

    const startDate =
        periodo.mode === '30d'
            ? new Date(now - 30 * 24 * 60 * 60 * 1000)
            : periodo.mode === '90d'
              ? new Date(now - 90 * 24 * 60 * 60 * 1000)
              : periodo.mode === 'custom' && periodo.start
                ? new Date(periodo.start)
                : undefined;

    const endDate =
        periodo.mode === 'custom' && periodo.end ? new Date(periodo.end) : periodo.mode === 'custom' ? undefined : new Date();

    return sessions.filter((session) => {
        if (terapeutaId && session.terapeutaId !== terapeutaId) return false;
        if (programaId) {
            const sessionProgramId = (session as { programaId?: string | null }).programaId;
            if (sessionProgramId && sessionProgramId !== programaId) return false;
        }

        if (periodo.mode === 'custom' && startDate && endDate) {
            const sessionDate = new Date(session.data);
            if (sessionDate < startDate || sessionDate > endDate) return false;
        } else if (periodo.mode === '30d' && startDate) {
            if (new Date(session.data) < startDate) return false;
        } else if (periodo.mode === '90d' && startDate) {
            if (new Date(session.data) < startDate) return false;
        }

        return true;
    });
}

function aggregateStimuli(
    sessions: Sessao[],
    filters: Filters,
): { all: AggregatedStimulus[]; filtered: AggregatedStimulus[] } {
    const { estimuloId } = filters;

    const aggregated = new Map<string, { label: string; counts: Counts }>();

    sessions.forEach((session) => {
        const countsByStimulus = aggregateByStimulus(session.registros);

        Object.entries(countsByStimulus).forEach(([stimulusId, counts]) => {
            if (stimulusId === 'unknown') return;
            if (estimuloId && stimulusId !== estimuloId) return;

            const label =
                session.registros.find((registro) => registro.stimulusId === stimulusId)
                    ?.stimulusLabel ?? 'Estímulo sem nome';

            const existing = aggregated.get(stimulusId);
            if (existing) {
                aggregated.set(stimulusId, {
                    label: existing.label || label,
                    counts: sumCounts(existing.counts, counts),
                });
            } else {
                aggregated.set(stimulusId, {
                    label,
                    counts,
                });
            }
        });
    });

    const list: AggregatedStimulus[] = Array.from(aggregated.entries()).map(
        ([id, { label, counts }]) => {
            const totalAttempts = total(counts);
            const independence = ti(counts);
            const status = toStatus(counts);
            return {
                id,
                label,
                counts,
                total: totalAttempts,
                independence,
                status,
            };
        },
    );

    const filtered = list
        .filter((item) => SEVERITY_WHITELIST.includes(item.status))
        .sort((a, b) => {
            const severityDiff = sortBySeverity(a.status, b.status);
            if (severityDiff !== 0) return severityDiff;
            const rankDiff = severityRank(a.status) - severityRank(b.status);
            if (rankDiff !== 0) return rankDiff;
            if (a.independence !== b.independence) {
                return a.independence - b.independence;
            }
            return b.total - a.total;
        });

    return { all: list, filtered };
}

export function AttentionStimuliBlock({
    sessions,
    filters,
    loading = false,
    error,
}: AttentionStimuliBlockProps) {
    const [windowSize, setWindowSize] = useState<WindowSize>(5);

    const filteredSessions = useMemo(() => {
        if (!sessions.length) return [];

        const scopedSessions = filterSessionsByFilters(sessions, filters);

        return [...scopedSessions].sort(
            (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
        );
    }, [sessions, filters]);

    const lastSessions = useMemo(
        () => filteredSessions.slice(0, windowSize),
        [filteredSessions, windowSize],
    );

    const aggregation = useMemo(
        () => aggregateStimuli(lastSessions, filters),
        [lastSessions, filters],
    );

    const hasSufficientAttempts = aggregation.all.some((item) => item.total >= 5);

    const handleWindowChange = (value: string) => {
        if (!value) return;
        const parsed = Number(value) as WindowSize;
        setWindowSize(parsed);
    };

    const subtitle = `Baseado nas últimas ${windowSize} sessões. Mostra apenas Crítico e Atenção.`;

    const showEmptyState =
        !loading &&
        !error &&
        lastSessions.length > 0 &&
        hasSufficientAttempts &&
        aggregation.filtered.length === 0;

    const showNoDataState =
        !loading &&
        !error &&
        (lastSessions.length === 0 || aggregation.all.length === 0 || !hasSufficientAttempts);

    return (
        <Card className="rounded-[5px] px-6 py-6 md:px-8 lg:px-8">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <CardTitle id="attention-stimuli-title" className="text-base font-semibold">
                                Estímulos que precisam de atenção
                            </CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Como calculamos o status"
                                            className="text-muted-foreground"
                                        >
                                            <Info className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                                        Status calculado pelo % de respostas independentes
                                        (Indep./Total): Positivo &gt;= 80%, Mediano 60-79%, Atenção 40-59%,
                                        Crítico &lt; 40%. Ordenamos por severidade e menor independência.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <ToggleGroup
                        type="single"
                        value={String(windowSize)}
                        onValueChange={handleWindowChange}
                        className="w-full max-w-[280px] lg:w-auto"
                        aria-label="Alterar janela de sessões"
                    >
                        {WINDOW_OPTIONS.map((option) => (
                            <ToggleGroupItem
                                key={option.value}
                                value={String(option.value)}
                                className="flex-1 px-3 py-2 text-xs font-medium"
                            >
                                {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3" role="status" aria-live="polite">
                        <div className="h-16 rounded border border-dashed border-muted animate-pulse" />
                        <div className="h-16 rounded border border-dashed border-muted animate-pulse" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : showNoDataState ? (
                    <div className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Não há tentativas suficientes para os filtros atuais.</span>
                    </div>
                ) : showEmptyState ? (
                    <div className="rounded-md border px-4 py-4 text-sm text-muted-foreground">
                        <p className="font-medium">
                            Tudo certo por aqui! Nenhum estímulo Crítico ou de Atenção nas últimas{' '}
                            {windowSize} sessões.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Continue acompanhando a autonomia do paciente.
                        </p>
                    </div>
                ) : (
                    <div role="list" aria-labelledby="attention-stimuli-title" className="space-y-3">
                        {aggregation.filtered.map((item) => {
                            const statusConfig = getStatusConfig(item.status);
                            return (
                                <div
                                    key={item.id}
                                    role="listitem"
                                    className="rounded-[5px] border"
                                >
                                    <div className="border-b bg-muted/40 px-4 py-2">
                                        <p className="text-sm font-medium truncate">{item.label}</p>
                                    </div>
                                    <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
                                        <div className="flex flex-1 flex-wrap gap-2">
                                            <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                                <span className="text-xs">Erro:</span>
                                                <span className="font-semibold">{item.counts.erro}</span>
                                            </Badge>
                                            <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                                <span className="text-xs">Ajuda:</span>
                                                <span className="font-semibold">{item.counts.ajuda}</span>
                                            </Badge>
                                            <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                                <span className="text-xs">Indep.:</span>
                                                <span className="font-semibold">{item.counts.indep}</span>
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge
                                                variant="outline"
                                                className={`gap-2 px-3 py-1 text-xs font-medium ${statusConfig.cls}`}
                                            >
                                                <span>{statusConfig.label}</span>
                                                <span>
                                                    {item.independence}% ({item.counts.indep}/{item.total})
                                                </span>
                                            </Badge>
                                            <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                                <span className="text-xs">Total:</span>
                                                <span className="font-semibold">{item.total}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AttentionStimuliBlock;
