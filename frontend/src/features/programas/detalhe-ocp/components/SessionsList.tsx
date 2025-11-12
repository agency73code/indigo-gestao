import { useMemo, type ComponentType } from 'react';
import {
    Calendar,
    User,
    Eye,
    AlertCircle,
    CheckCircle,
    Info,
    MinusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import type { SessionListItem, ProgramDetail } from '../types';

interface SessionsListProps {
    sessions: SessionListItem[];
    program: ProgramDetail;
}

type Counts = {
    erro: number;
    ajuda: number;
    indep: number;
};

type StatusKind = 'insuficiente' | 'positivo' | 'mediano' | 'atencao';

type StatusBadgeConfig = {
    icon: ComponentType<{ className?: string }>;
    badge: string;
    label: string;
};

const STATUS_CONFIG: Record<StatusKind, StatusBadgeConfig> = {
    insuficiente: {
        icon: Info,
        badge: 'border-muted text-muted-foreground bg-muted/40',
        label: 'Coleta insuficiente',
    },
    positivo: {
        icon: CheckCircle,
        badge: 'border-green-500/40 text-green-700 bg-green-50',
        label: 'Positivo',
    },
    mediano: {
        icon: MinusCircle,
        badge: 'border-amber-500/40 text-amber-700 bg-amber-50',
        label: 'Mediano',
    },
    atencao: {
        icon: AlertCircle,
        badge: 'border-orange-500/40 text-orange-700 bg-orange-50',
        label: 'Atencao',
    },
};

function countAttempts(session: SessionListItem): Counts {
    const preview = session.preview ?? [];
    const erro = preview.filter((result) => result === 'error').length;
    const ajuda = preview.filter((result) => result === 'prompted').length;
    const indep = preview.filter((result) => result === 'independent').length;
    return { erro, ajuda, indep };
}

function getStatus(counts: Counts): { kind: StatusKind; ti: number; total: number } {
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

function StatusBadge({
    summary,
    testId,
    tooltipId,
}: {
    summary: { kind: StatusKind; ti: number; total: number; counts: Counts };
    testId: string;
    tooltipId: string;
}) {
    const { kind, ti, total, counts } = summary;
    const config = STATUS_CONFIG[kind];
    const Icon = config.icon;

    const content =
        kind === 'insuficiente'
            ? config.label
            : `${config.label} - ${ti}% (${counts.indep}/${total})`;

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
                Percentual de respostas independentes nesta sessao: INDEP / (ERRO + AJUDA + INDEP).
                Positivo &gt;80%, Mediano &gt;60% e &lt;=80%, Atenção &lt;=60%, Insuficiente {'<'}5
                tentativas.
            </TooltipContent>
        </Tooltip>
    );
}

export default function SessionsList({ sessions, program }: SessionsListProps) {
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
        navigate(`/app/programas/sessoes/${session.id}?pacienteId=${program.patientId}`, {
            state: { sessionDate: session.date },
        });
    };

    const handleNewSession = () => {
        navigate(
            `/app/programas/sessoes/nova?programaId=${program.id}&patientId=${program.patientId}`,
        );
    };

    const handleSeeAll = () => {
        navigate(`/app/programas/sessoes/consultar?pacienteId=${program.patientId}`);
    };

    const sessionsWithSummaries = useMemo(() => {
        return sessions.map((session) => {
            const counts = countAttempts(session);
            const status = getStatus(counts);
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
                        Sessoes
                    </CardTitleHub>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Nenhuma sessao registrada ainda.
                        </p>
                        <Button onClick={handleNewSession} size="sm" className="h-9 rounded-full">
                            Registrar primeira sessao
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
                        Sessoes recentes
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
                    {sessionsWithSummaries.map(({ session, counts, status }) => {
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
                                        summary={{ ...status, counts }}
                                        testId={`sess-rec-indep-status-${session.id}`}
                                        tooltipId={`sess-rec-indep-tip-${session.id}`}
                                    />

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 w-9 p-0 flex-shrink-0 border-border/40 dark:border-white/15"
                                        onClick={() => handleViewSession(session)}
                                        aria-label="Ver sessao"
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
