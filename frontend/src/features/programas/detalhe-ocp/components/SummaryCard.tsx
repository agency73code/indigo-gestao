import { BarChart3, TrendingUp, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionListItem } from '../types';

interface SummaryCardProps {
    sessions: SessionListItem[];
}

export default function SummaryCard({ sessions }: SummaryCardProps) {
    if (sessions.length === 0) {
        return null;
    }

    // Calcular métricas baseadas nas sessões disponíveis
    const validSessions = sessions.filter(
        (session) => session.overallScore !== null && session.overallScore !== undefined,
    );

    const totalSessions = sessions.length;

    const overallAverage =
        validSessions.length > 0
            ? validSessions.reduce((sum, session) => sum + (session.overallScore || 0), 0) /
              validSessions.length
            : 0;

    const independenceValidSessions = sessions.filter(
        (session) => session.independenceRate !== null && session.independenceRate !== undefined,
    );

    const independenceAverage =
        independenceValidSessions.length > 0
            ? independenceValidSessions.reduce(
                  (sum, session) => sum + (session.independenceRate || 0),
                  0,
              ) / independenceValidSessions.length
            : 0;

    // Calcular total de tentativas baseado nos previews disponíveis
    const totalAttempts = sessions.reduce(
        (sum, session) => sum + (session.preview ? session.preview.length : 0),
        0,
    );

    const formatPercentage = (value: number) => {
        return `${Math.round(value)}%`;
    };

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-2">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Resumo Geral
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Acerto Geral */}
                    <div className="text-center p-4 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Acerto Geral
                            </span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                            {formatPercentage(overallAverage)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Média das últimas {validSessions.length} sessões
                        </div>
                    </div>

                    {/* Taxa de Independência */}
                    <div className="text-center p-4 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Independência
                            </span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                            {formatPercentage(independenceAverage)}
                        </div>
                        <div className="text-xs text-muted-foreground">Taxa média</div>
                    </div>

                    {/* Total de Tentativas */}
                    <div className="text-center p-4 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Tentativas
                            </span>
                        </div>
                        <div className="text-xl font-bold text-purple-600">{totalAttempts}</div>
                        <div className="text-xs text-muted-foreground">
                            Em {totalSessions} sessões
                        </div>
                    </div>
                </div>

                {validSessions.length === 0 && (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                            Registre mais sessões para ver as estatísticas.
                        </p>
                    </div>
                )}
            </CardContent>
            
        </Card>
    );
}
