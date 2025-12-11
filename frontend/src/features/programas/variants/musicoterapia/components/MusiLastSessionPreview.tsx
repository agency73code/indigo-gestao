/**
 * MusiLastSessionPreview
 * Versão adaptada de LastSessionPreview para Musicoterapia
 * Com layout similar ao MusiAttentionActivitiesCard - incluindo Participação e Suporte
 */

import { useState } from 'react';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    HandHelping,
    Users,
    HeartHandshake,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MusiActivitySummary } from '../types';

interface MusiLastSessionPreviewProps {
    sessionDate: string;
    activitiesSummary: MusiActivitySummary[];
}

type StatusKind = 'verde' | 'laranja' | 'vermelho' | 'neutro';

function getActivityStatus(counts: { desempenhou: number; desempenhouComAjuda: number; naoDesempenhou: number }): StatusKind {
    const total = counts.desempenhou + counts.desempenhouComAjuda + counts.naoDesempenhou;
    if (total === 0) return 'neutro';
    
    const max = Math.max(counts.desempenhou, counts.desempenhouComAjuda, counts.naoDesempenhou);
    if (counts.desempenhou === max) return 'verde';
    if (counts.desempenhouComAjuda === max) return 'laranja';
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

export default function MusiLastSessionPreview({ sessionDate, activitiesSummary }: MusiLastSessionPreviewProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(activitiesSummary.map(a => a.activityId)));

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

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

    const showEmptyState = activitiesSummary.length === 0;

    const helperText = (
        <span>
            Resumo por atividade desta sessão: contagens de Não Desempenhou, Desempenhou com Ajuda e Desempenhou, Total e o{' '}
            <strong>Status</strong> que indica o resultado predominante (o que mais ocorreu).
        </span>
    );

    return (
        <Card 
            padding="hub" 
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitleHub
                            className="text-base flex items-center gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Última sessão - desempenho por atividade ({formatDate(sessionDate)})
                        </CardTitleHub>
                        <Badge variant="outline">
                            Meta: Independência &gt;= 80%
                        </Badge>
                    </div>
                    <div
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                        {helperText}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-muted-foreground"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[280px] text-xs">
                                    O Status mostra o resultado predominante: verde se a maioria desempenhou, 
                                    laranja se a maioria desempenhou com ajuda, vermelho se a maioria não desempenhou.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    {showEmptyState ? (
                        <div className="text-sm text-muted-foreground">
                            Nenhum dado de tentativa foi encontrado para esta sessão.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activitiesSummary.map((activity, index) => {
                                const status = getActivityStatus(activity.counts);
                                const config = getStatusConfig(status);
                                const isExpanded = expandedIds.has(activity.activityId);

                                return (
                                    <div
                                        key={activity.activityId}
                                        className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all"
                                    >
                                        {/* Header da Atividade */}
                                        <button
                                            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                                            onClick={() => toggleExpand(activity.activityId)}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{activity.activityName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.total} tentativas
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
                                                            <span className="text-sm font-semibold">{activity.counts.desempenhou}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                            <HandHelping className="h-3.5 w-3.5 text-amber-600" />
                                                            <span className="text-xs text-muted-foreground">Ajuda</span>
                                                            <span className="text-sm font-semibold">{activity.counts.desempenhouComAjuda}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50">
                                                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                            <span className="text-xs text-muted-foreground">Não</span>
                                                            <span className="text-sm font-semibold">{activity.counts.naoDesempenhou}</span>
                                                        </div>
                                                    </div>

                                                    {/* Separador vertical */}
                                                    <div className="h-8 w-px bg-border shrink-0" />

                                                    {/* Participação e Suporte com mais espaço */}
                                                    {(activity.participacao !== undefined || activity.suporte !== undefined) && (
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            {activity.participacao !== undefined && activity.participacao !== null && (
                                                                <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#EDE9FE]/50">
                                                                    <div className="h-10 w-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                                                                        <Users className="h-5 w-5 text-violet-600" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs text-muted-foreground">Participação</p>
                                                                        <p className="text-sm font-medium text-foreground truncate">
                                                                            {formatParticipacao(activity.participacao)}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-violet-600 shrink-0">
                                                                        {activity.participacao?.toFixed(1)}/5
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {activity.suporte !== undefined && activity.suporte !== null && (
                                                                <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#FCE7F3]/50">
                                                                    <div className="h-10 w-10 rounded-lg bg-[#FCE7F3] flex items-center justify-center shrink-0">
                                                                        <HeartHandshake className="h-5 w-5 text-pink-600" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs text-muted-foreground">Suporte</p>
                                                                        <p className="text-sm font-medium text-foreground truncate">
                                                                            {formatSuporte(activity.suporte)}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-pink-600 shrink-0">
                                                                        {activity.suporte?.toFixed(1)}/5
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
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
