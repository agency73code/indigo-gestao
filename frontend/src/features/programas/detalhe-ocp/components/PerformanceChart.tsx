'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import type { SerieLinha } from '../../relatorio-geral/types';
import { CardDescription } from '@/ui/card';

const chartConfig = {
    acerto: {
        label: 'Pct. Acerto Geral',
        color: 'hsl(var(--chart-1))',
    },
    independencia: {
        label: 'Pct. Independência',
        color: 'hsl(var(--chart-2))',
    },
    erro: {
        label: 'Pct. Erro',
        color: '#ef4444',
    },
} satisfies ChartConfig;

interface PerformanceChartProps {
    data: SerieLinha[];
    loading?: boolean;
    title?: string;
    description?: ReactNode;
    metaLabel?: string;
    className?: string;
}

const addErrorData = (data: SerieLinha[]) => {
    return data.map((item) => ({
        ...item,
        erro: 100 - item.acerto,
    }));
};

export default function PerformanceChart({
    data,
    loading = false,
    title,
    description,
    metaLabel,
    className,
}: PerformanceChartProps) {
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

    const dataWithError = addErrorData(data);
    const chartTitle = title ?? 'Evolução de desempenho do programa';
    const chartMetaLabel = metaLabel ?? 'Meta: Convergência';

    let descriptionContent: ReactNode;
    if (description === undefined) {
        descriptionContent = (
            <CardDescription>
                <strong>Meta: convergência.</strong> Quando <em>Acerto</em> e <em>Independência</em>{' '}
                se sobrepõem, <strong>100% dos acertos foram independentes</strong>. Acompanhe o{' '}
                <em>gap de autonomia</em>: quanto menor, melhor.
            </CardDescription>
        );
    } else if (typeof description === 'string') {
        descriptionContent = <CardDescription>{description}</CardDescription>;
    } else {
        descriptionContent = description;
    }

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
                <ChartContainer config={chartConfig} className="aspect-[16/9] h-[300px] w-full">
                    <LineChart
                        data={dataWithError}
                        margin={{ left: 24, right: 8, top: 26, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="1 1" opacity={0.1} />
                        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={14} />
                        <YAxis
                            domain={[0, 100]}
                            ticks={[0, 25, 50, 75, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={22}
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

                        <ReferenceLine
                            y={0}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="2 2"
                            strokeOpacity={0.2}
                        />
                        <ReferenceLine
                            y={25}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="2 2"
                            strokeOpacity={0.2}
                        />
                        <ReferenceLine
                            y={50}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="2 2"
                            strokeOpacity={0.3}
                        />
                        <ReferenceLine
                            y={75}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="2 2"
                            strokeOpacity={0.2}
                        />
                        <ReferenceLine
                            y={100}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="2 2"
                            strokeOpacity={0.3}
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
                            dataKey="acerto"
                            stroke="var(--chart-secondary-foreground)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                        <Line
                            type="linear"
                            dataKey="independencia"
                            stroke="var(--chart-primary-foreground)"
                            fill="var(--chart-primary-foreground)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                        <Line
                            type="linear"
                            dataKey="erro"
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
