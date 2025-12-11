import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Mic2,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    FileText
} from 'lucide-react';

type StimulusInfo = {
    id: string;
    label: string;
    order: number;
    objetivoEspecifico?: string | null;
};

type Counts = {
    erro: number;
    ajuda: number;
    indep: number;
};

type SortType = 'order' | 'severity' | 'performance';

interface FonoStimuliPerformanceListProps {
    stimuli: StimulusInfo[];
    countsByStimulus: Record<string, Counts>;
    defaultSort?: SortType;
}

type StatusKind = 'verde' | 'laranja' | 'vermelho' | 'neutro';

function getStimulusStatus(counts: Counts): StatusKind {
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

export default function FonoStimuliPerformanceList({
    stimuli,
    countsByStimulus,
    defaultSort = 'order',
}: FonoStimuliPerformanceListProps) {
    const [sortBy, setSortBy] = useState<SortType>(defaultSort);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(stimuli.map(s => s.id)));

    const sortedStimuli = useMemo(() => {
        const stimuliWithData = stimuli.map((stimulus) => ({
            ...stimulus,
            counts: countsByStimulus[stimulus.id] || { erro: 0, ajuda: 0, indep: 0 },
            hasData: !!countsByStimulus[stimulus.id],
        }));

        return stimuliWithData.sort((a, b) => {
            switch (sortBy) {
                case 'severity':
                    return getSeverityScore(b.counts) - getSeverityScore(a.counts);
                case 'performance':
                    return getPerformanceScore(b.counts) - getPerformanceScore(a.counts);
                case 'order':
                default:
                    return a.order - b.order;
            }
        });
    }, [stimuli, countsByStimulus, sortBy]);

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

    const workedStimuli = sortedStimuli.filter((s) => s.hasData);
    const notWorkedStimuli = sortedStimuli.filter((s) => !s.hasData);

    if (stimuli.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Mic2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum estímulo encontrado</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-lg border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Mic2 className="h-4 w-4" />
                    Desempenho por Estímulo
                    <Badge variant="secondary" className="ml-2">
                        {workedStimuli.length}/{stimuli.length}
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
                {/* Estímulos Trabalhados */}
                {workedStimuli.map((stimulus) => {
                    const status = getStimulusStatus(stimulus.counts);
                    const config = getStatusConfig(status);
                    const isExpanded = expandedIds.has(stimulus.id);
                    const total = stimulus.counts.erro + stimulus.counts.ajuda + stimulus.counts.indep;

                    return (
                        <div
                            key={stimulus.id}
                            className="rounded-lg border-0 overflow-hidden transition-all bg-background"
                        >
                            {/* Header do Estímulo */}
                            <button
                                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-muted/50 transition-colors"
                                onClick={() => toggleExpand(stimulus.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                        {stimulus.order}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{stimulus.label}</p>
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
                                    {/* Descrição do Estímulo */}
                                    {stimulus.objetivoEspecifico && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileText className="h-3 w-3 shrink-0" />
                                                <span className="font-medium">Descrição</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                    OBJETIVO ESPECÍFICO
                                                </p>
                                                <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                    {stimulus.objetivoEspecifico}
                                                </p>
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
                                                        {stimulus.counts.indep}
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
                                                        {stimulus.counts.ajuda}
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
                                                        {stimulus.counts.erro}
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

                {/* Estímulos Não Trabalhados */}
                {notWorkedStimuli.length > 0 && (
                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                            Estímulos não trabalhados ({notWorkedStimuli.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {notWorkedStimuli.map((stimulus) => (
                                <div
                                    key={stimulus.id}
                                    className="px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 flex items-center gap-2"
                                >
                                    <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                                        {stimulus.order}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {stimulus.label}
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
