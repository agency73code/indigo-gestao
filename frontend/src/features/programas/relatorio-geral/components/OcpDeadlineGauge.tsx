import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Calendar, Clock, Target } from 'lucide-react';
import type { PrazoPrograma } from '../types';

interface OcpDeadlineGaugeProps {
    data: PrazoPrograma;
    loading?: boolean;
}

export function OcpDeadlineGauge({ data, loading = false }: OcpDeadlineGaugeProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Prazo do Programa</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-16 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Determinar cor baseada no percentual
    const getProgressColor = (percent: number) => {
        if (percent >= 90) return 'bg-destructive';
        if (percent >= 75) return 'bg-yellow-500';
        return 'bg-primary';
    };

    const getStatusIcon = (percent: number) => {
        if (percent >= 90) return <Clock className="h-4 w-4 text-destructive" />;
        if (percent >= 75) return <Calendar className="h-4 w-4 text-yellow-500" />;
        return <Target className="h-4 w-4 text-primary" />;
    };

    const getStatusText = (percent: number) => {
        if (percent >= 90) return { text: 'Crítico', color: 'text-destructive' };
        if (percent >= 75) return { text: 'Atenção', color: 'text-yellow-600' };
        return { text: 'No prazo', color: 'text-primary' };
    };

    const status = getStatusText(data.percent);

    return (
        <Card>
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Sora, sans-serif' }}>
                    Prazo do Programa (OCP)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Acompanhe o progresso temporal do programa atual
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Indicador visual principal */}
                    <div className="text-center">
                        <div className="relative">
                            {/* Círculo de progresso usando múltiplos elementos */}
                            <div className="relative w-32 h-32 mx-auto">
                                <svg
                                    className="transform -rotate-90 w-32 h-32"
                                    viewBox="0 0 100 100"
                                >
                                    {/* Círculo de fundo */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="hsl(var(--muted))"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="opacity-20"
                                    />
                                    {/* Círculo de progresso */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke={
                                            data.percent >= 90
                                                ? 'hsl(var(--destructive))'
                                                : data.percent >= 75
                                                  ? 'hsl(45, 93%, 47%)'
                                                  : 'hsl(var(--primary))'
                                        }
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.percent / 100)}`}
                                        className="transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Texto central */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span
                                        className="text-2xl font-bold"
                                        style={{ fontFamily: 'Sora, sans-serif' }}
                                    >
                                        {data.percent}%
                                    </span>
                                    <span className={`text-xs font-medium ${status.color}`}>
                                        {status.text}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progresso linear alternativa */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso do período</span>
                            <span className="font-medium">{data.percent}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(data.percent)}`}
                                style={{ width: `${data.percent}%` }}
                            />
                        </div>
                    </div>

                    {/* Informações detalhadas */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            {getStatusIcon(data.percent)}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{data.label}</p>
                            </div>
                        </div>

                        {/* Status cards */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-medium">Status</div>
                                <div className={status.color}>{status.text}</div>
                            </div>
                            <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-medium">Tempo</div>
                                <div className="text-muted-foreground">
                                    {data.percent < 100 ? 'Em andamento' : 'Concluído'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
