import { CheckCircle, XCircle, Activity, Users, HeartHandshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CircleHelp } from 'lucide-react';
import type { MusiSessionSummary } from '../types';

interface MusiSessionSummaryProps {
    summary: MusiSessionSummary;
}

function formatParticipacao(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Percebe, não participa',
        2: 'Tenta, não consegue',
        3: 'Não como esperado',
        4: 'Conforme esperado',
        5: 'Supera expectativas',
    };
    
    const rounded = Math.round(value);
    return labels[rounded] || value.toFixed(1);
}

function formatSuporte(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Visual',
        4: 'Parcial físico',
        5: 'Total físico',
    };
    
    const rounded = Math.round(value);
    return labels[rounded] || value.toFixed(1);
}

export default function MusiSessionSummaryComponent({ summary }: MusiSessionSummaryProps) {
    const { desempenhou, desempenhouComAjuda, naoDesempenhou, totalAttempts, avgParticipacao, avgSuporte } = summary;

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
            {/* Linha 1: Cards de Desempenho */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            Número de tentativas em que o cliente desempenhou a atividade de forma independente.
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
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Número de tentativas em que o cliente necessitou de algum tipo de suporte.
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
                            <p className="text-sm text-muted-foreground">Tentativas sem desempenho</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-red-700 dark:text-red-400">
                                {naoDesempenhou}
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Número de tentativas em que o cliente não conseguiu desempenhar a atividade.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Linha 2: Cards de Participação e Suporte (específicos de Musicoterapia) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 4: Participação */}
                <Card 
                    padding="hub"
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
                            <Users className="h-7 w-7 text-violet-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Participação</CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                Nível de engajamento nas atividades
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-violet-700 dark:text-violet-400">
                                {formatParticipacao(avgParticipacao)}
                            </div>
                            {avgParticipacao !== null && (
                                <span className="text-sm text-muted-foreground">
                                    ({avgParticipacao.toFixed(1)}/5)
                                </span>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[280px]">
                                        <p className="text-xs">
                                            <strong>0</strong> - Não participa<br/>
                                            <strong>1</strong> - Percebe, mas não participa<br/>
                                            <strong>2</strong> - Tenta participar, não consegue<br/>
                                            <strong>3</strong> - Participa, não como esperado<br/>
                                            <strong>4</strong> - Participa conforme esperado<br/>
                                            <strong>5</strong> - Supera as expectativas
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 5: Suporte Necessário */}
                <Card 
                    padding="hub"
                    className="rounded-lg border-0 shadow-none"
                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                >
                    <CardHeader className="space-y-5">
                        <div className="h-14 w-14 rounded-lg bg-[#FCE7F3] flex items-center justify-center">
                            <HeartHandshake className="h-7 w-7 text-pink-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitleHub className="text-lg">Suporte Necessário</CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                Nível de suporte durante a sessão
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-medium text-pink-700 dark:text-pink-400">
                                {formatSuporte(avgSuporte)}
                            </div>
                            {avgSuporte !== null && (
                                <span className="text-sm text-muted-foreground">
                                    ({avgSuporte.toFixed(1)}/5)
                                </span>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[280px]">
                                        <p className="text-xs">
                                            <strong>1</strong> - Sem suporte (independente)<br/>
                                            <strong>2</strong> - Mínimo (verbal)<br/>
                                            <strong>3</strong> - Visual<br/>
                                            <strong>4</strong> - Moderado (parcial físico)<br/>
                                            <strong>5</strong> - Máximo (total físico)
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Total */}
            <div className="text-center text-sm text-muted-foreground">
                Total de tentativas: <span className="font-medium">{totalAttempts}</span>
            </div>
        </div>
    );
}
