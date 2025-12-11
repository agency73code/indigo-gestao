import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

export interface MusiParticipacaoData {
    media: number; // 0-5
    tendencia?: number; // variação em relação ao período anterior
    totalRegistros: number;
}

interface MusiParticipacaoChartProps {
    data: MusiParticipacaoData | null;
    loading?: boolean;
}

const chartConfig = {
    participacao: {
        label: 'Participação',
        color: 'hsl(var(--chart-1))',
    },
    background: {
        label: 'Restante',
        color: 'hsl(var(--muted))',
    },
} satisfies ChartConfig;

/**
 * Retorna o label descritivo baseado no valor de participação (0-5)
 */
function getParticipacaoLabel(valor: number): string {
    if (valor >= 4.5) return 'Supera as expectativas';
    if (valor >= 3.5) return 'Participa conforme esperado';
    if (valor >= 2.5) return 'Participa, mas não como esperado';
    if (valor >= 1.5) return 'Tenta participar, não consegue';
    if (valor >= 0.5) return 'Percebe, mas não participa';
    return 'Não participa';
}

/**
 * Retorna a cor baseada no valor de participação
 */
function getParticipacaoColor(valor: number): string {
    if (valor >= 4) return 'hsl(142, 76%, 36%)'; // Verde - excelente
    if (valor >= 3) return 'hsl(262, 83%, 58%)'; // Roxo - bom
    if (valor >= 2) return 'hsl(45, 93%, 47%)'; // Amarelo - atenção
    return 'hsl(0, 84%, 60%)'; // Vermelho - crítico
}

export function MusiParticipacaoChart({ data, loading }: MusiParticipacaoChartProps) {
    if (loading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center pb-0">
                    <Skeleton className="h-[200px] w-[200px] rounded-full" />
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                </CardFooter>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-base">Participação Média</CardTitle>
                    <CardDescription>Nível de engajamento nas atividades</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center py-8">
                    <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
                </CardContent>
            </Card>
        );
    }

    const media = data.media;
    const percentual = (media / 5) * 100;
    const restante = 100 - percentual;
    const cor = getParticipacaoColor(media);

    const chartData = [
        { 
            name: 'Participação', 
            participacao: percentual, 
            background: restante 
        }
    ];

    const TrendIcon = data.tendencia && data.tendencia > 0 
        ? TrendingUp 
        : data.tendencia && data.tendencia < 0 
            ? TrendingDown 
            : Minus;

    const trendColor = data.tendencia && data.tendencia > 0 
        ? 'text-green-600' 
        : data.tendencia && data.tendencia < 0 
            ? 'text-red-600' 
            : 'text-muted-foreground';

    return (
        <Card className="flex flex-col border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-base">Participação Média</CardTitle>
                <CardDescription>Nível de engajamento nas atividades</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto w-full max-w-[250px] h-[140px]">
                    <RadialBarChart
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={130}
                        cy="70%"
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 16}
                                                    className="fill-foreground text-3xl font-bold"
                                                    style={{ fontFamily: 'Sora, sans-serif' }}
                                                >
                                                    {media.toFixed(1)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 8}
                                                    className="fill-muted-foreground text-sm"
                                                >
                                                    de 5
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="background"
                            stackId="a"
                            cornerRadius={5}
                            fill="hsl(var(--muted))"
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="participacao"
                            stackId="a"
                            cornerRadius={5}
                            fill={cor}
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                {data.tendencia !== undefined && (
                    <div className={`flex items-center gap-2 leading-none font-medium ${trendColor}`}>
                        {data.tendencia > 0 ? '+' : ''}{data.tendencia.toFixed(1)} este período
                        <TrendIcon className="h-4 w-4" />
                    </div>
                )}
                <div className="text-muted-foreground leading-none text-center">
                    {getParticipacaoLabel(media)}
                </div>
                <div className="text-xs text-muted-foreground/70">
                    Baseado em {data.totalRegistros} registros
                </div>
            </CardFooter>
        </Card>
    );
}
