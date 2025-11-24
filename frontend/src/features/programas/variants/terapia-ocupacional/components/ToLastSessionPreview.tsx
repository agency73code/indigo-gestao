/**
 * ToLastSessionPreview
 * Versão adaptada de LastSessionPreview para Terapia Ocupacional
 * 
 * Mudanças de terminologia:
 * - "Estímulo" → "Objetivo Específico (Atividade)"
 * - "Erro" → "Não Desempenhou"
 * - "Ajuda" → "Desempenhou com Ajuda"
 * - "Indep." → "Desempenhou"
 * - Status baseado no resultado PREDOMINANTE (o que mais ocorreu)
 */

import type { ComponentType } from 'react';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    CircleSlash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ToActivitySummary } from '../types';

interface ToLastSessionPreviewProps {
    sessionDate: string;
    activitiesSummary: ToActivitySummary[];
}

// Status TO: apenas o resultado predominante
type ToStatusKind = 'desempenhou' | 'desempenhou_com_ajuda' | 'nao_desempenhou';

type StatusBadgeConfig = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    cls: string;
};

const TO_STATUS_CONFIG: Record<ToStatusKind, StatusBadgeConfig> = {
    desempenhou: {
        icon: CheckCircle,
        label: 'Desempenhou',
        cls: 'border-green-500/40 text-green-700 bg-green-50 dark:border-green-500/30 dark:text-green-400 dark:bg-green-950/30',
    },
    desempenhou_com_ajuda: {
        icon: AlertCircle,
        label: 'Desempenhou com Ajuda',
        cls: 'border-orange-500/40 text-orange-700 bg-orange-50 dark:border-orange-500/30 dark:text-orange-400 dark:bg-orange-950/30',
    },
    nao_desempenhou: {
        icon: CircleSlash,
        label: 'Não Desempenhou',
        cls: 'border-red-500/40 text-red-700 bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:bg-red-950/30',
    },
};

interface StatusBadgeProps {
    activity: ToActivitySummary;
}

function StatusBadge({ activity }: StatusBadgeProps) {
    // Determinar o predominante
    const { desempenhou, desempenhouComAjuda, naoDesempenhou } = activity.counts;
    
    let predominantStatus: ToStatusKind;
    let predominantCount: number;
    
    if (desempenhou >= desempenhouComAjuda && desempenhou >= naoDesempenhou) {
        predominantStatus = 'desempenhou';
        predominantCount = desempenhou;
    } else if (desempenhouComAjuda >= naoDesempenhou) {
        predominantStatus = 'desempenhou_com_ajuda';
        predominantCount = desempenhouComAjuda;
    } else {
        predominantStatus = 'nao_desempenhou';
        predominantCount = naoDesempenhou;
    }
    
    const config = TO_STATUS_CONFIG[predominantStatus];
    const Icon = config.icon;
    const content = `${config.label} - ${predominantCount}/${activity.total}`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    className={`gap-2 p-2 rounded-lg ${config.cls}`}
                >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{content}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px] text-xs">
                Resultado predominante para esta atividade nesta sessão: o que mais ocorreu entre Desempenhou, Desempenhou com Ajuda e Não Desempenhou.
            </TooltipContent>
        </Tooltip>
    );
}

export default function ToLastSessionPreview({ sessionDate, activitiesSummary }: ToLastSessionPreviewProps) {
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
                        <div className="space-y-3">
                            {activitiesSummary.map((activity) => (
                                <div
                                    key={activity.activityId}
                                    className="border border-border/40 dark:border-white/15 rounded-lg overflow-hidden"
                                    style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                                >
                                    <div className="px-4 py-3 bg-muted/10 dark:bg-white/5 border-b border-border/40 dark:border-white/15">
                                        <div className="font-medium text-sm truncate">
                                            {activity.activityName}
                                        </div>
                                    </div>
                                    <div className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="outline" className="p-2 rounded-lg border-border/40 dark:border-white/15">
                                                Não Desempenhou: {activity.counts.naoDesempenhou}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-lg border-border/40 dark:border-white/15">
                                                Desempenhou com Ajuda: {activity.counts.desempenhouComAjuda}
                                            </Badge>
                                            <Badge variant="outline" className="p-2 rounded-lg border-border/40 dark:border-white/15">
                                                Desempenhou: {activity.counts.desempenhou}
                                            </Badge>
                                            <div className="ml-auto flex items-center gap-3">
                                                <StatusBadge activity={activity} />
                                                <Badge
                                                    variant="outline"
                                                    className="font-semibold p-2 rounded-lg border-border/40 dark:border-white/15"
                                                >
                                                    Total: {activity.total}
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
