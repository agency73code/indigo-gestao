'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import type { SerieLinha } from '../types';
import { CardDescription } from '@/ui/card';

const chartConfig = {
    acerto: {
        label: '✅ Acerto Geral',
        color: 'hsl(var(--chart-1))',
    },
    independencia: {
        label: '🖐️ Independência',
        color: 'hsl(var(--chart-2))',
    },
    erro: {
        label: '❌ Erro',
        color: '#ef4444',
    },
} satisfies ChartConfig;

interface DualLineProgressProps {
    data: SerieLinha[];
    loading?: boolean;
}

// Função para adicionar o cálculo de erro aos dados
const addErrorData = (data: SerieLinha[]) => {
    return data.map((item) => ({
        ...item,
        erro: 100 - item.acerto, // Erro = 100% - Acerto%
    }));
};

export function DualLineProgress({ data, loading = false }: DualLineProgressProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Evolução do Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    // Adicionar campo de erro calculado aos dados
    const dataWithError = addErrorData(data);

    return (
        <Card className="px-6 py-6 md:px-8 md:py-10 lg:px-8 lg:py-8 mx-0">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <CardTitle>Evolução do desempenho</CardTitle>
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        Meta: Convergência
                    </span>
                </div>
                <CardDescription>
                    <strong>Meta: convergência.</strong> Quando <em>Acerto</em> e{' '}
                    <em>Independência</em> se sobrepõem,
                    <strong> 100% dos acertos foram independentes</strong>. Acompanhe o{' '}
                    <em>gap de autonomia</em>: quanto menor, melhor.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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

                        {/* Linhas guia de porcentagem */}
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
                                <div className="flex justify-center gap-6 mt-4">
                                    {payload?.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-sm"
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
