/**
 * MusiEvolutionChart
 * Gráfico de evolução de Participação e Suporte para a página de detalhe do programa
 * Mostra a evolução ao longo das sessões
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Users, HeartHandshake } from 'lucide-react';

/**
 * Dados de evolução de Participação e Suporte
 */
export interface MusiEvolutionDataPoint {
    x: string; // Data formatada (ex: "01/10")
    participacao: number; // Média de participação (0-5)
    suporte: number; // Média de suporte (1-5)
}

interface MusiEvolutionChartProps {
    data: MusiEvolutionDataPoint[];
    loading?: boolean;
}

const chartConfig = {
    participacao: {
        label: 'Participação',
        color: 'hsl(262 83% 58%)', // Violet
    },
    suporte: {
        label: 'Suporte',
        color: 'hsl(330 81% 60%)', // Pink
    },
} satisfies ChartConfig;

export default function MusiEvolutionChart({ data, loading = false }: MusiEvolutionChartProps) {
    if (loading) {
        return (
            <Card className="px-6 py-6 md:px-8 md:py-10 lg:px-8 lg:py-8 mx-0">
                <CardHeader>
                    <CardTitle>Evolução de Participação e Suporte</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="px-6 py-6 md:px-8 md:py-10 lg:px-8 lg:py-8 mx-0">
                <CardHeader>
                    <CardTitle>Evolução de Participação e Suporte</CardTitle>
                    <CardDescription>
                        Acompanhamento ao longo das sessões
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Nenhum dado disponível para o período selecionado
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="px-6 py-6 md:px-8 md:py-10 lg:px-8 lg:py-8 mx-0">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <CardTitle>Evolução de Participação e Suporte</CardTitle>
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        Meta: ↑ Participação ↓ Suporte
                    </span>
                </div>
                <CardDescription>
                    <strong>Ideal:</strong> Participação aumentando (maior engajamento) e 
                    Suporte diminuindo (maior independência). Escala de 0-5.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="aspect-video h-[300px] w-full">
                    <LineChart
                        data={data}
                        margin={{ left: 24, right: 8, top: 26, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="1 1" opacity={0.1} />
                        <XAxis 
                            dataKey="x" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={14} 
                        />
                        <YAxis
                            domain={[0, 5]}
                            ticks={[0, 1, 2, 3, 4, 5]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            width={22}
                        />
                        <ChartTooltip
                            cursor={{ strokeDasharray: '4 4' }}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    labelFormatter={(label) => `Data: ${label}`}
                                    formatter={(value, name) => {
                                        const labels: Record<string, string> = {
                                            participacao: 'Participação',
                                            suporte: 'Suporte',
                                        };
                                        const displayName = labels[name as string] || name;
                                        
                                        return [
                                            `${new Intl.NumberFormat('pt-BR', {
                                                maximumFractionDigits: 1,
                                            }).format(
                                                typeof value === 'number' ? value : Number(value),
                                            )}/5`,
                                            displayName,
                                        ];
                                    }}
                                />
                            }
                        />

                        {/* Linhas de referência horizontais */}
                        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={1} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={2} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={3} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.3} />
                        <ReferenceLine y={4} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={5} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.3} />

                        <Line
                            type="linear"
                            dataKey="participacao"
                            stroke="hsl(262 83% 58%)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                        <Line
                            type="linear"
                            dataKey="suporte"
                            stroke="hsl(330 81% 60%)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            isAnimationActive
                        />
                    </LineChart>
                </ChartContainer>
                
                {/* Legenda customizada */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(262 83% 58%)' }} />
                        <Users className="h-4 w-4 text-violet-600" />
                        <span className="text-sm text-muted-foreground">Participação (↑ melhor)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(330 81% 60%)' }} />
                        <HeartHandshake className="h-4 w-4 text-pink-600" />
                        <span className="text-sm text-muted-foreground">Suporte (↓ melhor)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
