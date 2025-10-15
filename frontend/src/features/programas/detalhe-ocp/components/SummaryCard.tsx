import { BarChart3, CircleHelp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SessionListItem } from '../types';
import type { SerieLinha } from '../../relatorio-geral/types';
import PerformanceChart from './PerformanceChart';

interface SummaryCardProps {
    sessions: SessionListItem[];
    chartData?: SerieLinha[];
    chartLoading?: boolean;
}

export default function SummaryCard({
    sessions,
    chartData,
    chartLoading = false,
}: SummaryCardProps) {
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
        <div className="space-y-4 mx-0 px-0" data-print-block>
            {/* Grid de três cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-print-kpi-grid>
                {/* Card 1: Acerto Geral */}
                <Card className="rounded-[5px] py-6 m-0">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Acerto geral</CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Percentual médio de acertos nas últimas sessões deste
                                            programa. Inclui respostas corretas e respostas com
                                            ajuda.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Média das últimas {validSessions.length} sessões
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">
                            {formatPercentage(overallAverage)}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Independência */}
                <Card className="rounded-[5px] py-6 m-0">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Independência</CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Taxa média de independência nas últimas sessões.
                                            Representa o percentual de respostas corretas sem
                                            qualquer ajuda do terapeuta.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Taxa média</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600">
                            {formatPercentage(independenceAverage)}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Tentativas */}
                <Card className="rounded-[5px]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Tentativas</CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Total acumulado de tentativas registradas em todas as
                                            sessões deste programa. Quanto mais tentativas, mais
                                            dados para análise do progresso.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Em {totalSessions} sessões
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totalAttempts}</div>
                    </CardContent>
                </Card>
            </div>

            {validSessions.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-[5px]">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Registre mais sessões para ver as estatísticas.
                    </p>
                </div>
            )}

            {/* Gráfico de Evolução do Desempenho */}
            {chartData && chartData.length > 0 && (
                <div className="mt-6">
                    <PerformanceChart data={chartData} loading={chartLoading} />
                </div>
            )}
        </div>
    );
}
