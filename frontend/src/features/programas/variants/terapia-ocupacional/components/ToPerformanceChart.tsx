'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { SerieLinha } from '../../../relatorio-geral/types';
import { CardDescription } from '@/ui/card';

// Tipo interno para dados do gráfico de TO
type ToChartDataPoint = {
    x: string;
    desempenhou?: number;
    desempenhou_com_ajuda?: number;
    nao_desempenhou?: number;
};

// Configuração do gráfico para TO com terminologia específica
const chartConfig = {
    desempenhou: {
        label: 'Desempenhou',
        color: 'var(--chart-primary-foreground)', // Mesma cor de "independencia" do Fono
    },
    desempenhou_com_ajuda: {
        label: 'Desempenhou com Ajuda',
        color: 'var(--chart-secondary-foreground)', // Mesma cor de "acerto" do Fono
    },
    nao_desempenhou: {
        label: 'Não Desempenhou',
        color: '#ef4444', // Mesma cor de "erro" do Fono
    },
} satisfies ChartConfig;

interface ToPerformanceChartProps {
    data: SerieLinha[];
    loading?: boolean;
    title?: string;
    description?: ReactNode;
    metaLabel?: string;
    className?: string;
}

/**
 * Transforma os dados do formato SerieLinha[] para o formato de TO
 * O backend retorna: { x: 'DD/MM', acerto: number, independencia: number }
 * Para TO, mapeamos:
 * - acerto -> desempenhou
 * - independencia -> desempenhou_com_ajuda  
 * - (100 - acerto) -> nao_desempenhou
 */
const transformToChartData = (series: SerieLinha[]): ToChartDataPoint[] => {
    return series.map((ponto) => ({
        x: ponto.x,
        desempenhou: ponto.acerto,
        desempenhou_com_ajuda: ponto.independencia,
        nao_desempenhou: Math.max(0, 100 - ponto.acerto),
    }));
};

export default function ToPerformanceChart({
    data,
    loading = false,
    title,
    description,
    metaLabel,
    className,
}: ToPerformanceChartProps) {
    if (loading) {
        return (
            <Card 
                padding="hub" 
                className="rounded-lg border-0 shadow-none"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <CardHeader>
                    <CardTitleHub>Evolução do Desempenho</CardTitleHub>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return null;
    }

    const chartData = transformToChartData(data);
    const chartTitle = title ?? 'Evolução de desempenho da atividade';
    const chartMetaLabel = metaLabel ?? 'Meta: Independência Total';

    let descriptionContent: ReactNode;
    if (description === undefined) {
        descriptionContent = (
            <CardDescription>
                <strong>Meta: independência total.</strong> Acompanhe a evolução do desempenho: 
                quanto mais verde (<em>Desempenhou</em>) e menos vermelho (<em>Não Desempenhou</em>), 
                melhor o progresso na atividade.
            </CardDescription>
        );
    } else if (typeof description === 'string') {
        descriptionContent = <CardDescription>{description}</CardDescription>;
    } else {
        descriptionContent = description;
    }

    // Calcular o máximo valor para o domínio do eixo Y (sempre 0-100 para porcentagens)
    const yDomain = [0, 100];

    return (
        <Card
            padding="hub"
            className={`rounded-lg border-0 shadow-none ${className ?? ''}`}
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                    <CardTitleHub>{chartTitle}</CardTitleHub>
                    <span className="rounded-full border border-border/40 dark:border-white/15 px-2 py-0.5 text-xs text-muted-foreground">
                        {chartMetaLabel}
                    </span>
                </div>
                {descriptionContent}
            </CardHeader>
            <CardContent className="pt-6" data-print-chart>
                <ChartContainer config={chartConfig} className="aspect-video h-[300px] w-full">
                    <LineChart
                        data={chartData}
                        margin={{ left: 24, right: 8, top: 26, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="1 1" opacity={0.1} />
                        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={14} />
                        <YAxis
                            domain={yDomain}
                            ticks={[0, 25, 50, 75, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={32}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip
                            cursor={{ strokeDasharray: '4 4' }}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    labelFormatter={(label) => `Data: ${label}`}
                                    formatter={(value, name) => [
                                        `${new Intl.NumberFormat('pt-BR', {
                                            maximumFractionDigits: 1,
                                        }).format(
                                            typeof value === 'number' ? value : Number(value),
                                        )}%`,
                                        name,
                                    ]}
                                />
                            }
                        />

                        <Legend
                            content={({ payload }) => (
                                <div className="mt-4 flex justify-center gap-6">
                                    {payload?.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-sm"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {entry.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />

                        <Line
                            type="linear"
                            dataKey="desempenhou"
                            stroke="var(--chart-primary-foreground)"
                            fill="var(--chart-primary-foreground)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                        <Line
                            type="linear"
                            dataKey="desempenhou_com_ajuda"
                            stroke="var(--chart-secondary-foreground)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                        <Line
                            type="linear"
                            dataKey="nao_desempenhou"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
