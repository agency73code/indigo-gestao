import { BarChart3, CircleHelp, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { SerieLinha } from '../../../relatorio-geral/types';
import ToPerformanceChart from './FisioPerformanceChart';

interface ToSummaryCardProps {
    sessions: SessionListItem[];
    chartData?: SerieLinha[];
    chartLoading?: boolean;
}

export default function ToSummaryCard({
    sessions,
    chartData,
    chartLoading = false,
}: ToSummaryCardProps) {
    const performedAverage = sessions.reduce((sum, s) => sum + s.kpis!.performedPct, 0) / sessions.length;
    const assistedAverage = sessions.reduce((sum, s) => sum + s.kpis!.assistedPct, 0)  / sessions.length;
    const notPerformedAverage = sessions.reduce((sum, s) => sum + s.kpis!.notPerformedPct, 0)  / sessions.length;

    const formatPercentage = (value: number) => {
        return `${Math.round(value)}%`;
    };

    return (
        <div className="space-y-4 mx-0 px-0" data-print-block>
            {/* Grid de três cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-print-kpi-grid>
                {/* Card 1: Desempenhou */}
                <Card 
                    padding="hub" 
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                            <CheckCircle className="h-7 w-7 text-green-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Desempenhou</CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                Média das últimas {sessions.length} sessões
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-green-700 dark:text-green-400">
                                {formatPercentage(performedAverage)}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Percentual médio de atividades que o cliente conseguiu 
                                            desempenhar de forma independente nas últimas sessões deste programa.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Desempenhou com Ajuda */}
                <Card 
                    padding="hub" 
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                            <Activity className="h-7 w-7 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Desempenhou com Ajuda</CardTitleHub>
                            <p className="text-sm text-muted-foreground">Média das últimas {sessions.length} sessões</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-amber-700 dark:text-amber-400">
                                {formatPercentage(assistedAverage)}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Percentual médio de atividades que o cliente conseguiu 
                                            desempenhar com apoio do terapeuta nas últimas sessões.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Não Desempenhou */}
                <Card 
                    padding="hub" 
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                            <XCircle className="h-7 w-7 text-red-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Não Desempenhou</CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                Média das últimas {sessions.length} sessões
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-red-700 dark:text-red-400">
                                {formatPercentage(notPerformedAverage)}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Percentual médio de atividades que o cliente não conseguiu 
                                            desempenhar, mesmo com ajuda, nas últimas sessões.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {sessions.length === 0 && (
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
                    <ToPerformanceChart data={chartData} loading={chartLoading} />
                </div>
            )}
        </div>
    );
}
