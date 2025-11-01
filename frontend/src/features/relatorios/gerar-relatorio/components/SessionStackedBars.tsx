'use client';

import { Bar, BarChart, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import type { LinhaBarras } from '../types';

const chartConfig = {
    acerto: {
        label: 'Acerto',
        color: 'var(--chart-1)',
    },
    ajuda: {
        label: 'Ajuda',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

interface SessionStackedBarsProps {
    data: LinhaBarras[];
    loading?: boolean;
}

export function SessionStackedBars({ data, loading = false }: SessionStackedBarsProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição de Respostas por Sessão</CardTitle>
                    <CardDescription>Carregando dados das sessões...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição de Respostas por Sessão</CardTitle>
                    <CardDescription>Nenhum dado disponível para exibição</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                        Sem dados para mostrar
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribuição de Respostas por Sessão</CardTitle>
                <CardDescription>
                    Comparação entre acertos e respostas com ajuda por sessão
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        width={800}
                        height={400}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <XAxis
                            dataKey="sessao"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: string) => `Sessão ${value}`}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) => `${value}`}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                            dataKey="acerto"
                            stackId="responses"
                            fill="var(--color-acerto)"
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="ajuda"
                            stackId="responses"
                            fill="var(--color-ajuda)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default SessionStackedBars;
