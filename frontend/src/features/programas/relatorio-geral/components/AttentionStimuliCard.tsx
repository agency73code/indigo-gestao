import { useState, useEffect } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAttentionStimuli } from '../services/relatorio.service';
import type { AttentionStimuliParams, AttentionStimulusItem } from '../types';

type Props = {
    pacienteId: string;
    programaId?: string;
    terapeutaId?: string;
    periodo?: AttentionStimuliParams['periodo'];
    area: string;
};

const WINDOW_OPTIONS = [
    { label: 'Últimas 1', value: 1 as const },
    { label: 'Últimas 3', value: 3 as const },
    { label: 'Últimas 5', value: 5 as const },
];

const STATUS_CLASSES = {
    atencao: 'border-orange-500/40 text-orange-700 bg-orange-50',
    mediano: 'border-amber-500/40 text-amber-700 bg-amber-50',
    positivo: 'border-green-500/40 text-green-700 bg-green-50',
    insuficiente: 'border-muted text-muted-foreground bg-muted/40',
};

const STATUS_LABELS = {
    atencao: 'Atenção',
    mediano: 'Mediano',
    positivo: 'Positivo',
    insuficiente: 'Insuficiente',
};

export function AttentionStimuliCard({ pacienteId, programaId, terapeutaId, periodo, area }: Props) {
    const [lastSessions, setLastSessions] = useState<1 | 3 | 5>(5);
    const [data, setData] = useState<AttentionStimulusItem[]>([]);
    const [hasSufficientData, setHasSufficientData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!pacienteId) {
                setLoading(false);
                setData([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result = await fetchAttentionStimuli({
                    pacienteId,
                    programaId,
                    terapeutaId,
                    periodo,
                    lastSessions,
                    area,
                });

                setData(result.items);
                setHasSufficientData(result.hasSufficientData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [pacienteId, programaId, terapeutaId, periodo, lastSessions, area]);

    const subtitle = `Baseado nas últimas ${lastSessions} sessões. Mostra apenas estímulos com status Atenção.`;

    return (
        <Card className="rounded-[5px] px-6 py-6 md:px-8 lg:px-8">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold">
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
                                        (Indep./Total): Positivo &gt; 80%, Mediano &gt;60% e &lt;=80%,
                                        Atenção &lt;=60%. Ordenamos por menor independência.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <ToggleGroup
                        type="single"
                        value={String(lastSessions)}
                        onValueChange={(v) => v && setLastSessions(Number(v) as 1 | 3 | 5)}
                        className="w-full max-w-[280px] lg:w-auto"
                    >
                        {WINDOW_OPTIONS.map((opt) => (
                            <ToggleGroupItem
                                key={opt.value}
                                value={String(opt.value)}
                                className="flex-1 px-3 py-2 text-xs font-medium"
                            >
                                {opt.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-[5px] border">
                                <div className="border-b bg-muted/40 px-4 py-2">
                                    <Skeleton className="h-5 w-3/4" />
                                </div>
                                <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
                                    <div className="flex flex-1 flex-wrap gap-2">
                                        <Skeleton className="h-7 w-20 rounded-full" />
                                        <Skeleton className="h-7 w-20 rounded-full" />
                                        <Skeleton className="h-7 w-20 rounded-full" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Skeleton className="h-7 w-32 rounded-full" />
                                        <Skeleton className="h-7 w-20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : !hasSufficientData ? (
                    <div className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Não há tentativas suficientes para os filtros atuais.</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="rounded-md border px-4 py-4 text-sm text-muted-foreground">
                        <p className="font-medium">
                            Tudo certo por aqui! Nenhum estímulo com status Atenção nas últimas{' '}
                            {lastSessions} sessões.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Continue acompanhando a autonomia do paciente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.map((item) => (
                            <div key={item.id} className="rounded-[5px] border">
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
                                            className={`gap-2 px-3 py-1 text-xs font-medium ${STATUS_CLASSES[item.status]}`}
                                        >
                                            <span>{STATUS_LABELS[item.status]}</span>
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
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
