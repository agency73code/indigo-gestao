'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import type { SerieLinha } from '../types';

const chartConfig = {
    acerto: {
        label: '✅ Acerto Geral',
        color: 'hsl(var(--chart-1))',
    },
    independencia: {
        label: '🖐️ Independência',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

interface DualLineProgressProps {
    data: SerieLinha[];
    loading?: boolean;
}

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

    return (
        <Card>
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Sora, sans-serif' }}>
                    Evolução do Desempenho
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Acompanhe a progressão de acerto e independência ao longo das sessões
                </p>
            </CardHeader>
            <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="aspect-[16/9] h-[300px] w-full">
                    <LineChart data={data} margin={{ left: 24, right: 8, top: 16, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.3} />
                        <XAxis dataKey="x" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
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

                        {/* Linha de meta (90%) */}
                        <ReferenceLine
                            y={90}
                            stroke="var(--muted-foreground)"
                            strokeDasharray="5 5"
                            strokeOpacity={0.5}
                        />

                        <Line
                            type="monotone"
                            dataKey="acerto"
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />

                        <Line
                            type="monotone"
                            dataKey="independencia"
                            stroke="var(--chart-4)"
                            fill="var(--chart-4)"
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
