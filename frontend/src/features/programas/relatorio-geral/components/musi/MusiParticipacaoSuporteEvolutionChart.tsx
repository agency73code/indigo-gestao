'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Heart } from 'lucide-react';

/**
 * Dados de evolução de Participação e Suporte ao longo do tempo
 */
export interface MusiEvolutionData {
    x: string; // Data (ex: "01/10")
    participacao: number; // Média de participação (0-5)
    suporte: number; // Média de suporte (1-5)
}

interface MusiParticipacaoSuporteEvolutionChartProps {
    data: MusiEvolutionData[];
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

/**
 * Gráfico de linhas mostrando a evolução de Participação e Suporte ao longo do tempo.
 * 
 * - Participação (0-5): Quanto maior, melhor. Indica engajamento nas atividades.
 * - Suporte (1-5): Quanto menor, melhor. Indica independência (1 = independente).
 * 
 * O ideal é ver a linha de Participação subindo e a de Suporte descendo.
 */
export function MusiParticipacaoSuporteEvolutionChart({ 
    data, 
    loading = false 
}: MusiParticipacaoSuporteEvolutionChartProps) {
    if (loading) {
        return (
            <Card className="px-6 py-6 md:px-8 md:py-10 lg:px-8 lg:py-8 mx-0">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full rounded" />
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
                                        const numValue = Number(value);
                                        const formattedValue = numValue.toFixed(1);
                                        
                                        if (name === 'participacao') {
                                            return [`${formattedValue}/5`, 'Participação'];
                                        }
                                        if (name === 'suporte') {
                                            return [`${formattedValue}/5`, 'Suporte'];
                                        }
                                        return [formattedValue, String(name)];
                                    }}
                                />
                            }
                        />

                        {/* Linhas guia horizontais tracejadas */}
                        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={1} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={2} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={3} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.3} />
                        <ReferenceLine y={4} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.2} />
                        <ReferenceLine y={5} stroke="var(--muted-foreground)" strokeDasharray="2 2" strokeOpacity={0.3} />

                        {/* Legenda na parte de baixo */}
                        <Legend
                            content={() => (
                                <div className="flex justify-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(262 83% 58%)' }} />
                                        <Users className="h-3.5 w-3.5 text-violet-600" />
                                        <span className="text-sm text-muted-foreground">Participação (↑ melhor)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(330 81% 60%)' }} />
                                        <Heart className="h-3.5 w-3.5 text-pink-500" />
                                        <span className="text-sm text-muted-foreground">Suporte (↓ melhor)</span>
                                    </div>
                                </div>
                            )}
                        />

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
            </CardContent>
        </Card>
    );
}
