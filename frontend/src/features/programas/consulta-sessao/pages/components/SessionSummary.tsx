import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, CircleHelp } from 'lucide-react';
import type { Counts, StatusKind } from '../helpers';
import { total, ti, getStatusConfig } from '../helpers';

interface SessionSummaryProps {
    counts: Counts;
    duration?: string | null;
    planned?: number;
    worked: number;
    date: string;
    status: StatusKind;
}

export default function SessionSummary({ counts, planned, worked, status }: SessionSummaryProps) {
    const totalTentativas = total(counts);
    const tiPercent = ti(counts);
    const statusConfig = getStatusConfig(status);

    return (
        <div className="space-y-4">
            {/* Grid de três cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Tentativas */}
                <Card className="rounded-[5px]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Tentativas</CardTitle>
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
                        <p className="text-sm text-muted-foreground mt-1">
                            Total de tentativas registradas
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-3" data-testid="sess-tentativas">
                            {totalTentativas}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Estímulos trabalhados */}
                <Card className="rounded-[5px]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">
                                Estímulos trabalhados
                            </CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px]">
                                        <p className="text-xs">
                                            Quantidade de estímulos trabalhados em relação ao total
                                            planejado para esta sessão do programa.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {planned
                                ? `De ${planned} estímulos planejados`
                                : 'Estímulos desta sessão'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-3" data-testid="sess-estimulos">
                            {planned ? `${worked}/${planned}` : worked}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Status geral */}
                <Card className="rounded-[5px]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Status geral</CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px]">
                                        <p className="text-xs font-medium mb-1">
                                            Taxa de Independência (TI)
                                        </p>
                                        <p className="text-xs">
                                            Percentual de respostas independentes em relação ao
                                            total. Quanto maior, melhor o desempenho do cliente.
                                        </p>
                                        <p className="text-xs mt-2 opacity-80">
                                            Cálculo: INDEP ÷ (ERRO+AJUDA+INDEP)
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Taxa de independência da sessão
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            variant="outline"
                            className={`text-lg font-semibold px-3 py-2 gap-2 mb-2 ${statusConfig.cls}`}
                            data-testid="sess-status"
                        >
                            <TrendingUp className="h-5 w-5" />
                            <span className="whitespace-nowrap">
                                {status === 'insuficiente'
                                    ? statusConfig.label
                                    : `${statusConfig.label} — ${tiPercent}%`}
                            </span>
                        </Badge>
                        {status !== 'insuficiente' && (
                            <p className="text-sm text-muted-foreground">
                                {counts.indep} de {totalTentativas} independentes
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
