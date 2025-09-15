import { Calendar, User, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { SessionListItem, ProgramDetail } from '../types';

interface SessionsListProps {
    sessions: SessionListItem[];
    program: ProgramDetail;
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
        if (value === null || value === undefined) return '—';
        return `${Math.round(value)}%`;
    };

    const handleViewSession = (sessionId: string) => {
        // Se existir rota de detalhe da sessão, navegar para ela
        // Caso contrário, pode implementar modal ou outra ação
        navigate(`/programas/sessoes/${sessionId}`);
    };

    const handleNewSession = () => {
        navigate(`/programas/sessoes/nova?programaId=${program.id}&patientId=${program.patientId}`);
    };

    if (sessions.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessões
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            Nenhuma sessão registrada ainda.
                        </p>
                        <Button onClick={handleNewSession} size="sm" className="h-9">
                            Registrar primeira sessão
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] p-1 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessões recentes
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => navigate(`/programas/${program.id}/sessoes`)}
                    >
                        Ver todas
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        {formatDate(session.date)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatPercentage(session.overallScore)} acerto
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    {session.therapistName}
                                </div>

                                {session.independenceRate !== null &&
                                    session.independenceRate !== undefined && (
                                        <div className="text-xs text-muted-foreground">
                                            {formatPercentage(session.independenceRate)}{' '}
                                            independência
                                        </div>
                                    )}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 ml-3"
                                onClick={() => handleViewSession(session.id)}
                                aria-label="Ver sessão"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
