import { useState } from 'react';
import { Info, CheckCircle, HandHelping, XCircle, Users, HeartHandshake, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Item de atividade com atenção - Musicoterapia
 * Inclui participação e suporte além dos contadores de desempenho
 */
export interface MusiAttentionActivityItem {
    id: string;
    nome: string;
    order: number;
    counts: {
        desempenhou: number;
        comAjuda: number;
        naoDesempenhou: number;
    };
    total: number;
    participacao?: number | null; // 0-5
    suporte?: number | null; // 1-5
}

interface MusiAttentionActivitiesCardProps {
    data: MusiAttentionActivityItem[];
    loading?: boolean;
}

const WINDOW_OPTIONS = [
    { label: 'Últimas 1', value: 1 },
    { label: 'Últimas 3', value: 3 },
    { label: 'Últimas 5', value: 5 },
];

type StatusKind = 'verde' | 'laranja' | 'vermelho' | 'neutro';

function getActivityStatus(counts: { desempenhou: number; comAjuda: number; naoDesempenhou: number }): StatusKind {
    const total = counts.desempenhou + counts.comAjuda + counts.naoDesempenhou;
    if (total === 0) return 'neutro';
    
    const max = Math.max(counts.desempenhou, counts.comAjuda, counts.naoDesempenhou);
    if (counts.desempenhou === max) return 'verde';
    if (counts.comAjuda === max) return 'laranja';
    return 'vermelho';
}

function getStatusConfig(status: StatusKind) {
    switch (status) {
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

function formatParticipacao(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Percebe, mas não participa',
        2: 'Tenta participar, mas não consegue',
        3: 'Participa, mas não como esperado',
        4: 'Conforme esperado',
        5: 'Supera expectativas',
    };
    
    return labels[Math.round(value)] || `${value}`;
}

function formatSuporte(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Visual',
        4: 'Parcialmente físico',
        5: 'Totalmente físico',
    };
    
    return labels[Math.round(value)] || `${value}`;
}

export function MusiAttentionActivitiesCard({ data, loading = false }: MusiAttentionActivitiesCardProps) {
    const [lastSessions, setLastSessions] = useState<number>(5);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(data.map(a => a.id)));

    // Filtrar apenas atividades com "não desempenhou" > 0
    const attentionActivities = data
        .filter(item => item.counts.naoDesempenhou > 0)
        .sort((a, b) => b.counts.naoDesempenhou - a.counts.naoDesempenhou);

    const subtitle = `Baseado nas últimas ${lastSessions} sessões. Mostra atividades que precisam ser reforçadas.`;

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

    return (
        <Card 
            padding="hub" 
            className="border-0 shadow-none"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <CardTitleHub>
                                Atividades que precisam de atenção
                            </CardTitleHub>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Critério de atenção"
                                            className="text-muted-foreground"
                                        >
                                            <Info className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                                        Exibe atividades onde o paciente não desempenhou em pelo menos uma tentativa.
                                        Ordenadas pela quantidade de "não desempenhou".
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <Tabs value={String(lastSessions)} onValueChange={(v) => setLastSessions(Number(v))}>
                        <TabsList className="grid w-full grid-cols-3 h-10 p-1">
                            {WINDOW_OPTIONS.map((opt) => (
                                <TabsTrigger key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-lg border bg-background">
                                <div className="px-4 py-3 flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-5 w-3/4" />
                                </div>
                                <div className="px-4 pb-4 pt-2 border-t space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        <Skeleton className="h-16 rounded-lg" />
                                        <Skeleton className="h-16 rounded-lg" />
                                        <Skeleton className="h-16 rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Skeleton className="h-20 rounded-lg" />
                                        <Skeleton className="h-20 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : attentionActivities.length === 0 ? (
                    <div className="rounded-md border px-4 py-4 text-sm text-muted-foreground">
                        <p className="font-medium">
                            Excelente! Nenhuma atividade com dificuldade nas últimas {lastSessions} sessões.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Continue acompanhando o desempenho do paciente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attentionActivities.map((item) => {
                            const status = getActivityStatus(item.counts);
                            const config = getStatusConfig(status);
                            const isExpanded = expandedIds.has(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all"
                                >
                                    {/* Header da Atividade */}
                                    <button
                                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                                        onClick={() => toggleExpand(item.id)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                                {item.order}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm truncate">{item.nome}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.total} tentativas
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

                                    {/* Detalhes Expandidos - Tudo em uma linha */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-3 border-t border-inherit">
                                            <div className="flex items-center gap-3">
                                                {/* Contadores compactos */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                        <span className="text-xs text-muted-foreground">Desemp.</span>
                                                        <span className="text-sm font-semibold">{item.counts.desempenhou}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                        <HandHelping className="h-3.5 w-3.5 text-amber-600" />
                                                        <span className="text-xs text-muted-foreground">Ajuda</span>
                                                        <span className="text-sm font-semibold">{item.counts.comAjuda}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                        <span className="text-xs text-muted-foreground">Não</span>
                                                        <span className="text-sm font-semibold">{item.counts.naoDesempenhou}</span>
                                                    </div>
                                                </div>

                                                {/* Separador vertical */}
                                                <div className="h-8 w-px bg-border shrink-0" />

                                                {/* Participação e Suporte com mais espaço */}
                                                {(item.participacao !== undefined || item.suporte !== undefined) && (
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        {item.participacao !== undefined && (
                                                            <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#EDE9FE]/50">
                                                                <div className="h-10 w-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                                                    <Users className="h-5 w-5 text-violet-600" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs text-muted-foreground">Participação</p>
                                                                    <p className="text-sm font-medium text-foreground truncate">
                                                                        {formatParticipacao(item.participacao)}
                                                                    </p>
                                                                </div>
                                                                <span className="text-sm font-semibold text-violet-600 shrink-0">
                                                                    {item.participacao?.toFixed(1)}/5
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.suporte !== undefined && (
                                                            <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#FCE7F3]/50">
                                                                <div className="h-10 w-10 rounded-lg bg-[#FCE7F3] flex items-center justify-center shrink-0">
                                                                    <HeartHandshake className="h-5 w-5 text-pink-600" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs text-muted-foreground">Suporte</p>
                                                                    <p className="text-sm font-medium text-foreground truncate">
                                                                        {formatSuporte(item.suporte)}
                                                                    </p>
                                                                </div>
                                                                <span className="text-sm font-semibold text-pink-600 shrink-0">
                                                                    {item.suporte?.toFixed(1)}/5
                                                                </span>
                                                            </div>
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
                )}
            </CardContent>
        </Card>
    );
}
