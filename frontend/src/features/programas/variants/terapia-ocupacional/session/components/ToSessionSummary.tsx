import { CheckCircle, XCircle, CircleHelp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ToSessionSummary } from '../types';

interface ToSessionSummaryProps {
    summary: ToSessionSummary;
}

export default function ToSessionSummary({ summary }: ToSessionSummaryProps) {
    const { desempenhou, desempenhouComAjuda, naoDesempenhou, totalAttempts } = summary;

    if (totalAttempts === 0) {
        return (
            <div className="space-y-4 mb-24 sm:mb-0">
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-[5px]">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Resumo será exibido após registrar tentativas</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-32 lg:mb-0">
            {/* Grid de três cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{/* Card 1: Desempenhou */}
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
                                Tentativas com desempenho independente
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-green-700 dark:text-green-400">
                                {desempenhou}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Número de tentativas em que o cliente desempenhou a atividade de forma independente, sem necessidade de ajuda.
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
                            <p className="text-sm text-muted-foreground">Tentativas com suporte</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-amber-700 dark:text-amber-400">
                                {desempenhouComAjuda}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs">
                                            Número de tentativas em que o cliente precisou de ajuda ou suporte do terapeuta para desempenhar a atividade.
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
                                Tentativas sem desempenho
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-red-700 dark:text-red-400">{naoDesempenhou}</div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Número de tentativas em que o cliente não conseguiu desempenhar a atividade, mesmo com ajuda.
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
