/**
 * ToSessionsList
 * Versão adaptada de SessionsList para Terapia Ocupacional
 * 
 * Status baseado no resultado PREDOMINANTE:
 * - Verde: Desempenhou (maioria)
 * - Laranja: Desempenhou com Ajuda (maioria)
 * - Vermelho: Não Desempenhou (maioria)
 */

import { useMemo, type ComponentType } from 'react';
import {
    Calendar,
    User,
    Eye,
    CheckCircle,
    AlertCircle,
    CircleSlash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import type { SessionListItem, ProgramDetail } from '../../../detalhe-ocp/types';

interface ToSessionsListProps {
    sessions: SessionListItem[];
    program: ProgramDetail;
}

type Counts = {
    naoDesempenhou: number;
    desempenhouComAjuda: number;
    desempenhou: number;
};

// Status TO: apenas o resultado predominante
type ToStatusKind = 'desempenhou' | 'desempenhou_com_ajuda' | 'nao_desempenhou';

type StatusBadgeConfig = {
    icon: ComponentType<{ className?: string }>;
    badge: string;
    label: string;
};

const TO_STATUS_CONFIG: Record<ToStatusKind, StatusBadgeConfig> = {
    desempenhou: {
        icon: CheckCircle,
        badge: 'border-green-500/40 text-green-700 bg-green-50 dark:border-green-500/30 dark:text-green-400 dark:bg-green-950/30',
        label: 'Desempenhou',
    },
    desempenhou_com_ajuda: {
        icon: AlertCircle,
        badge: 'border-orange-500/40 text-orange-700 bg-orange-50 dark:border-orange-500/30 dark:text-orange-400 dark:bg-orange-950/30',
        label: 'Desempenhou com Ajuda',
    },
    nao_desempenhou: {
        icon: CircleSlash,
        badge: 'border-red-500/40 text-red-700 bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:bg-red-950/30',
        label: 'Não Desempenhou',
    },
};

function countAttempts(session: SessionListItem): Counts {
    const preview = session.preview ?? [];
    const naoDesempenhou = preview.filter((result) => result === 'error').length;
    const desempenhouComAjuda = preview.filter((result) => result === 'prompted').length;
    const desempenhou = preview.filter((result) => result === 'independent').length;
    return { naoDesempenhou, desempenhouComAjuda, desempenhou };
}

function getPredominantStatus(counts: Counts): { kind: ToStatusKind; count: number; total: number } {
    const { desempenhou, desempenhouComAjuda, naoDesempenhou } = counts;
    const total = desempenhou + desempenhouComAjuda + naoDesempenhou;
    
    let kind: ToStatusKind;
    let count: number;
    
    if (desempenhou >= desempenhouComAjuda && desempenhou >= naoDesempenhou) {
        kind = 'desempenhou';
        count = desempenhou;
    } else if (desempenhouComAjuda >= naoDesempenhou) {
        kind = 'desempenhou_com_ajuda';
        count = desempenhouComAjuda;
    } else {
        kind = 'nao_desempenhou';
        count = naoDesempenhou;
    }
    
    return { kind, count, total };
}

function StatusBadge({
    summary,
    testId,
    tooltipId,
}: {
    summary: { kind: ToStatusKind; count: number; total: number };
    testId: string;
    tooltipId: string;
}) {
    const { kind, count, total } = summary;
    const config = TO_STATUS_CONFIG[kind];
    const Icon = config.icon;
    const content = `${config.label} - ${count}/${total}`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    className={`gap-2 py-1 rounded-lg ${config.badge}`}
                    data-testid={testId}
                >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{content}</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent data-testid={tooltipId} className="max-w-[280px] text-xs">
                Resultado predominante nesta sessão: o que mais ocorreu entre Desempenhou, 
                Desempenhou com Ajuda e Não Desempenhou.
            </TooltipContent>
        </Tooltip>
    );
}

export default function ToSessionsList({ sessions, program }: ToSessionsListProps) {
    const navigate = useNavigate();

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

    const formatPercentage = (value?: number | null) => {
        if (value === null || value === undefined) return '0%';
        return `${Math.round(value)}%`;
    };

    const handleViewSession = (session: SessionListItem) => {
        navigate(`/app/programas/terapia-ocupacional/sessoes/${session.id}?pacienteId=${program.patientId}`, {
            state: { sessionDate: session.date },
        });
    };

    const handleNewSession = () => {
        navigate(
            `/app/programas/terapia-ocupacional/sessoes/nova?programaId=${program.id}&patientId=${program.patientId}`,
        );
    };

    const handleSeeAll = () => {
        navigate(`/app/programas/terapia-ocupacional/sessoes/consultar?pacienteId=${program.patientId}`);
    };

    const sessionsWithSummaries = useMemo(() => {
        return sessions.map((session) => {
            const counts = countAttempts(session);
            const status = getPredominantStatus(counts);
            return { session, counts, status };
        });
    }, [sessions]);

    if (sessions.length === 0) {
        return (
            <Card 
                padding="hub" 
                className="rounded-lg border-0 shadow-none"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <CardHeader className="pb-3">
                    <CardTitleHub className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessões
                    </CardTitleHub>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Nenhuma sessão registrada ainda.
                        </p>
                        <Button onClick={handleNewSession} size="sm" className="h-9 rounded-full">
                            Registrar primeira sessão
                        </Button>
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
            data-print-block
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitleHub className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessões recentes
                    </CardTitleHub>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs no-print rounded-full"
                        onClick={handleSeeAll}
                    >
                        Ver todas
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sessionsWithSummaries.map(({ session, status }) => {
                        return (
                            <div
                                key={session.id}
                                className="border border-border/40 dark:border-white/15 rounded-lg hover:bg-muted/30 dark:hover:bg-white/5 transition-colors overflow-hidden"
                                style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                                data-testid={`sess-rec-row-${session.id}`}
                            >
                                <div className="p-4 space-y-2 border-b border-border/40 dark:border-white/15">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {formatDate(session.date)}
                                        </span>
                                        <Badge variant="outline" className="font-semibold border-border/40 dark:border-white/15">
                                            {formatPercentage(session.overallScore)} acerto
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        {session.therapistName}
                                    </div>
                                </div>

                                <div className="p-4 flex items-center justify-between">
                                    <StatusBadge
                                        summary={status}
                                        testId={`sess-rec-status-${session.id}`}
                                        tooltipId={`sess-rec-tip-${session.id}`}
                                    />

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 w-9 p-0 flex-shrink-0 border-border/40 dark:border-white/15"
                                        onClick={() => handleViewSession(session)}
                                        aria-label="Ver sessão"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
