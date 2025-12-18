import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import type { SerieLinha } from '../../../relatorio-geral/types';
import { CardDescription } from '@/ui/card';

// Configuração do gráfico para TO com terminologia específica
// IMPORTANTE: TO não usa "acerto" ou "erro" - usamos terminologia de desempenho funcional
// acerto (dataKey) = Desempenhou (paciente realizou a atividade de forma independente)
// independencia (dataKey) = Desempenhou com Ajuda (paciente realizou com suporte do terapeuta)
// erro (dataKey calculado) = Não Desempenhou (paciente não conseguiu realizar a atividade)
const chartConfig = {
    acerto: {
        label: 'Desempenhou',
        color: 'hsl(var(--chart-1))',
    },
    independencia: {
        label: 'Desempenhou com Ajuda',
        color: 'hsl(var(--chart-2))',
    },
    erro: {
        label: 'Não Desempenhou',
        color: '#ef4444',
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

// Função para adicionar o cálculo de "não desempenhou" aos dados
// IMPORTANTE: Em TO não usamos "erro" - o paciente "não desempenhou" a atividade
// Mapeamento dos dataKeys:
// - acerto (dataKey backend) → Desempenhou (sem ajuda)
// - independencia (dataKey backend) → Desempenhou com Ajuda
// - erro (dataKey calculado) → Não Desempenhou = 100% - (Desempenhou + Desempenhou com Ajuda)
const addErrorData = (data: SerieLinha[]) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
        const erro = Math.max(0, 100 - (item.acerto ?? 0)); // "Não desempenhou" = 100% - (desempenhou + com ajuda)
        
        return {
            ...item,
            erro,
        };
    });
};

export default function ToPerformanceChart({
    data,
    loading = false,
    title,
    description,
    metaLabel,
}: ToPerformanceChartProps) {
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
    const dataWithError = addErrorData(data || []);
    console.log(data)
    const chartTitle = title ?? 'Evolução do desempenho';
    const chartMetaLabel = metaLabel ?? 'Meta: Convergência';

    let descriptionContent: ReactNode;
    if (description === undefined) {
        descriptionContent = (
            <CardDescription>
                <strong>Meta: convergência.</strong> Quando <em>Desempenhou</em> e{' '}
                <em>Desempenhou com Ajuda</em> se sobrepõem,
                <strong> 100% das atividades foram realizadas de forma independente</strong>. Acompanhe o{' '}
                <em>gap de autonomia</em>: quanto menor, melhor.
            </CardDescription>
        );
    } else if (typeof description === 'string') {
        descriptionContent = <CardDescription>{description}</CardDescription>;
    } else {
        descriptionContent = description;
    }

    return (
        <Card className="px-6 py-6 md:px-8 md:py-10 lg:px-8 lg:py-8 mx-0">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{chartTitle}</CardTitle>
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        {chartMetaLabel}
                    </span>
                </div>
                {descriptionContent}
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
                                    formatter={(value, name) => {
                                        // Traduzir os dataKeys para labels corretos
                                        const labels: Record<string, string> = {
                                            acerto: 'Desempenhou',
                                            independencia: 'Desempenhou com Ajuda',
                                            erro: 'Não Desempenhou',
                                        };
                                        const displayName = labels[name as string] || name;
                                        
                                        return [
                                            `${new Intl.NumberFormat('pt-BR', {
                                                maximumFractionDigits: 1,
                                            }).format(
                                                typeof value === 'number' ? value : Number(value),
                                            )}%`,
                                            displayName,
                                        ];
                                    }}
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
                                    {payload?.map((entry, index) => {
                                        // Traduzir os dataKeys para labels corretos
                                        const labels: Record<string, string> = {
                                            acerto: 'Desempenhou',
                                            independencia: 'Desempenhou com Ajuda',
                                            erro: 'Não Desempenhou',
                                        };
                                        const displayName = labels[entry.dataKey as string] || entry.value;
                                        
                                        return (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-sm"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {displayName}
                                                </span>
                                            </div>
                                        );
                                    })}
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
