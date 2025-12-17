'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
// Progress component inline implementation
interface ProgressProps {
    value: number;
    className?: string;
}

const Progress = ({ value, className }: ProgressProps) => (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden h-2 ${className || ''}`}>
        <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
    </div>
);
import { Calendar, CheckCircle, PlayCircle } from 'lucide-react';

interface OcpDeadlineProps {
    inicio?: string; // ISO date
    fim?: string; // ISO date
    percent?: number; // Percentual pré-calculado (opcional)
    label?: string; // Label pré-calculada (opcional)
    hoje?: string; // opcional (para testes); default: now
    loading?: boolean;
}

export function OcpDeadlineCard({
    inicio,
    fim,
    percent,
    label,
    hoje,
    loading = false,
}: OcpDeadlineProps) {
    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-2">
                    <CardTitle>Prazo do Programa (OCP)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="h-16 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-12 bg-muted animate-pulse rounded" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-16 bg-muted animate-pulse rounded-lg" />
                            <div className="h-16 bg-muted animate-pulse rounded-lg" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Usar hoje atual se não fornecido
    const dataHoje = hoje ? new Date(hoje) : new Date();

    // Calcular status e percentual
    const calcularProgresso = () => {
        if (!inicio || !fim) {
            return {
                percent: 0,
                status: 'Não iniciado',
                tempo: 'Indefinido',
                diasRestantes: 0,
                statusColor: 'text-muted-foreground',
                icon: <PlayCircle className="h-4 w-4 text-muted-foreground" />,
                texto: 'Dados de início e fim não definidos',
            };
        }

        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);

        // Calcular total de dias e dias decorridos
        const totalDias = Math.max(
            1,
            Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)),
        );
        const diasDecorridos = Math.max(
            0,
            Math.min(
                Math.ceil((dataHoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)),
                totalDias,
            ),
        );

        // Usar percentual pré-calculado se disponível senão calcular
        const calculatedPercent =
            percent !== undefined ? percent : Math.round((diasDecorridos / totalDias) * 100);

        const diasRestantes = Math.max(
            0,
            Math.ceil((dataFim.getTime() - dataHoje.getTime()) / (1000 * 60 * 60 * 24)),
        );

        // Determinar status
        if (dataHoje < dataInicio) {
            const diasParaIniciar = Math.ceil(
                (dataInicio.getTime() - dataHoje.getTime()) / (1000 * 60 * 60 * 24),
            );
            return {
                percent: 0,
                status: 'Não iniciado',
                tempo: 'A iniciar',
                diasRestantes: diasParaIniciar,
                statusColor: 'text-muted-foreground',
                icon: <PlayCircle className="h-4 w-4 text-muted-foreground" />,
                texto: `Início em ${diasParaIniciar} dias • 0% do período decorrido`,
            };
        } else if (dataHoje >= dataInicio && dataHoje <= dataFim) {
            // Usar label pré-calculado se disponível
            const textoCalculado =
                label ||
                (diasRestantes === 0
                    ? `Termina hoje • ${calculatedPercent}% do período decorrido`
                    : `${diasRestantes} dias restantes • ${calculatedPercent}% do período decorrido`);

            return {
                percent: calculatedPercent,
                status: 'No prazo',
                tempo: 'Em andamento',
                diasRestantes,
                statusColor: 'text-primary',
                icon: <Calendar className="h-4 w-4 text-primary" />,
                texto: textoCalculado,
            };
        } else {
            const diasAposVencimento = Math.ceil(
                (dataHoje.getTime() - dataFim.getTime()) / (1000 * 60 * 60 * 24),
            );
            return {
                percent: 100,
                status: 'Concluído',
                tempo: 'Encerrado',
                diasRestantes: 0,
                statusColor: 'text-destructive',
                icon: <CheckCircle className="h-4 w-4 text-destructive" />,
                texto: `Encerrado há ${diasAposVencimento} dias • 100% do período decorrido`,
            };
        }
    };

    const progresso = calcularProgresso();

    return (
        <Card className="w-full px-1 py-0 md:px-4 md:py-10 lg:px-2 lg:py-2">
            <CardHeader className="pb-2">
                <CardTitle style={{ fontFamily: 'Sora, sans-serif' }} className='text-primary font-normal'>
                    Prazo do Programa / Objetivo
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Acompanhe o progresso temporal do programa atual
                </p>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <div className="space-y-4 md:space-y-6">
                    {/* Indicador central grande */}
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div
                            className="text-4xl md:text-5xl font-semibold"
                            style={{ fontFamily: 'Sora, sans-serif' }}
                        >
                            {progresso.percent}%
                        </div>
                        <div className={`text-sm font-medium ${progresso.statusColor}`}>
                            {progresso.status}
                        </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progresso do período</span>
                            <span className="font-medium">{progresso.percent}%</span>
                        </div>
                        <Progress
                            value={progresso.percent}
                            className="h-2"
                            aria-label={`Progresso do programa: ${progresso.percent}%`}
                        />
                    </div>

                    {/* Pílula informativa */}
                    <div className="rounded-lg px-4 py-3 bg-muted">
                        <div className="flex items-center gap-2 text-sm">
                            {progresso.icon}
                            <span>{progresso.texto}</span>
                        </div>
                    </div>

                    {/* Dois cartões resumidos */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="rounded-lg bg-muted p-4">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                Status
                            </div>
                            <div className={`text-sm font-medium mt-1 ${progresso.statusColor}`}>
                                {progresso.status}
                            </div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                Tempo
                            </div>
                            <div className="text-sm font-medium mt-1">{progresso.tempo}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
