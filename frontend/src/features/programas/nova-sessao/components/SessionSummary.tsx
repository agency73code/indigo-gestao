import { TrendingUp, CircleHelp, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SessionSummary } from '../types';

interface SessionSummaryProps {
    summary: SessionSummary;
}

export default function SessionSummary({ summary }: SessionSummaryProps) {
    const { overallAccuracy, independenceRate, totalAttempts } = summary;

    if (totalAttempts === 0) {
        return (
            <div className="space-y-4 mb-24 sm:mb-0">
                {/* Título da seção */}
                
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-[5px]">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Resumo será exibido após registrar tentativas</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-32 lg:mb-0">
            {/* Título da seção */}

            {/* Grid de três cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Acerto geral */}
                <Card 
                    padding="hub"
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                            <Target className="h-7 w-7 text-green-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Acerto geral</CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                Tentativas independentes
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-green-700 dark:text-green-400">
                                {Math.round(overallAccuracy)}%
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Percentual de tentativas independentes em relação ao
                                            total. Quanto maior, melhor o desempenho geral do
                                            cliente.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Independência */}
                <Card 
                    padding="hub"
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                            <TrendingUp className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Independência</CardTitleHub>
                            <p className="text-sm text-muted-foreground">Respostas sem ajuda</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-blue-700 dark:text-blue-400">
                                {Math.round(independenceRate)}%
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Taxa de respostas corretas sem ajuda do terapeuta.
                                            Indica o nível de autonomia do cliente nas tarefas
                                            propostas.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Tentativas */}
                <Card 
                    padding="hub"
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
                            <Activity className="h-7 w-7 text-indigo-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Tentativas</CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                Total de tentativas registradas
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-purple-700 dark:text-purple-400">{totalAttempts}</div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Total de tentativas registradas nesta sessão, incluindo
                                            erros, ajudas e respostas independentes.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
