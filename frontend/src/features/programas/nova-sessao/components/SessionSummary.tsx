import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionSummary } from '../types';

interface SessionSummaryProps {
    summary: SessionSummary;
}

export default function SessionSummary({ summary }: SessionSummaryProps) {
    const { overallAccuracy, independenceRate, totalAttempts } = summary;

    if (totalAttempts === 0) {
        return (
            <Card className="rounded-[5px] mb-24 sm:0 p-1 sm:p-4">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Resumo da Sessão
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-4 text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Resumo será exibido após registrar tentativas</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] mb-18 sm:0 p-1 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Resumo da Sessão
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Acerto Geral */}
                    <div className="text-center p-3 bg-muted/30 rounded-[5px]">
                        <Target className="h-5 w-5 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">{overallAccuracy}%</div>
                        <p className="text-xs text-muted-foreground">Acerto geral</p>
                    </div>

                    {/* Taxa de Independência */}
                    <div className="text-center p-3 bg-muted/30 rounded-[5px]">
                        <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">{independenceRate}%</div>
                        <p className="text-xs text-muted-foreground">Independência</p>
                    </div>

                    {/* Total de Tentativas */}
                    <div className="text-center p-3 bg-muted/30 rounded-[5px]">
                        <BarChart3 className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold text-purple-600">{totalAttempts}</div>
                        <p className="text-xs text-muted-foreground">Tentativas</p>
                    </div>
                </div>

                {/* Descrição adicional */}
                <div className="mt-4 p-3 bg-muted/20 rounded-[5px] text-xs text-muted-foreground">
                    <p>
                        <strong>Acerto geral:</strong> Percentual de tentativas independentes em
                        relação ao total.
                    </p>
                    <p className="mt-1">
                        <strong>Independência:</strong> Percentual de respostas corretas sem ajuda.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
