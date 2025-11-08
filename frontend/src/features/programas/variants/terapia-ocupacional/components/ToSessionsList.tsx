// Lista de sessões TO
// Adaptado do componente base para mostrar dados específicos de TO

import {
    Calendar,
    User,
    Eye,
    CheckCircle,
    XCircle,
    MinusCircle,
    Clock,
    Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ToSessionListItem, ToAchieved } from '../types';

interface ToSessionsListProps {
    sessions: ToSessionListItem[];
    onViewDetails: (sessionId: string) => void;
    emptyMessage?: string;
}

function getAchievedBadge(achieved: ToAchieved) {
    const configs = {
        sim: {
            icon: CheckCircle,
            label: 'Conseguiu',
            cls: 'border-green-500/40 text-green-700 bg-green-50 dark:bg-green-900/20',
        },
        nao: {
            icon: XCircle,
            label: 'Não conseguiu',
            cls: 'border-red-500/40 text-red-700 bg-red-50 dark:bg-red-900/20',
        },
        parcial: {
            icon: MinusCircle,
            label: 'Parcial',
            cls: 'border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-900/20',
        },
        nao_aplica: {
            icon: MinusCircle,
            label: 'N/A',
            cls: 'border-muted text-muted-foreground bg-muted/40',
        },
    };
    return configs[achieved];
}

export default function ToSessionsList({
    sessions,
    onViewDetails,
    emptyMessage = 'Nenhuma sessão encontrada',
}: ToSessionsListProps) {
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

    if (sessions.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Sessões
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-6 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Sessões recentes
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-3">
                    {sessions.map((session) => {
                        const achievedConfig = getAchievedBadge(session.achieved);
                        const AchievedIcon = achievedConfig.icon;

                        return (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1 space-y-2">
                                    {/* Data e terapeuta */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {formatDate(session.date)}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <User className="h-3.5 w-3.5" />
                                            <span>{session.therapistName}</span>
                                        </div>
                                    </div>

                                    {/* Programa */}
                                    <div className="text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            Programa:{' '}
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {session.programName}
                                        </span>
                                    </div>

                                    {/* Objetivo */}
                                    <div className="text-sm flex items-start gap-1.5">
                                        <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground line-clamp-2">
                                            {session.goalTitle}
                                        </span>
                                    </div>

                                    {/* Badges com informações */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Conseguiu? */}
                                        <Badge
                                            variant="outline"
                                            className={`gap-1 px-2 py-1 rounded-[5px] ${achievedConfig.cls}`}
                                        >
                                            <AchievedIcon className="h-3.5 w-3.5" />
                                            <span className="text-xs whitespace-nowrap">
                                                {achievedConfig.label}
                                            </span>
                                        </Badge>

                                        {/* Frequência */}
                                        {session.frequency != null && session.frequency > 0 && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 px-2 py-1 rounded-[5px] text-xs"
                                            >
                                                <span>{session.frequency}x</span>
                                            </Badge>
                                        )}

                                        {/* Duração */}
                                        {session.durationMin != null && session.durationMin > 0 && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 px-2 py-1 rounded-[5px] text-xs"
                                            >
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{session.durationMin} min</span>
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 ml-3 shrink-0"
                                    onClick={() => onViewDetails(session.id)}
                                    aria-label="Ver detalhes da sessão"
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

