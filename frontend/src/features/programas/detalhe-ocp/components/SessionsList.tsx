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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <Card className="rounded-lg">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessoes
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Nenhuma sessao registrada ainda.
                        </p>
                        <Button onClick={handleNewSession} size="sm" className="h-9">
                            Registrar primeira sessao
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-lg px-6 py-0 md:px-8 md:py-10 lg:px-8 lg:py-2" data-print-block>
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessoes recentes
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs no-print"
                        onClick={handleSeeAll}
                    >
                        Ver todas
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-3">
                    {sessionsWithSummaries.map(({ session, counts, status }) => {
                        return (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
                                data-testid={`sess-rec-row-${session.id}`}
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {formatDate(session.date)}
                                        </span>
                                        <Badge variant="outline" className="font-semibold">
                                            {formatPercentage(session.overallScore)} acerto
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        {session.therapistName}
                                    </div>

                                    <StatusBadge
                                        summary={{ ...status, counts }}
                                        testId={`sess-rec-indep-status-${session.id}`}
                                        tooltipId={`sess-rec-indep-tip-${session.id}`}
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 ml-3"
                                    onClick={() => handleViewSession(session)}
                                    aria-label="Ver sessao"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
