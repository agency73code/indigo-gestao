import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  desempenho: {
    label: 'Desempenho',
    color: '#10B981', // Verde para sucesso
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

export interface FisioPerformanceRateData {
  atividade: string;
  desempenho: number; // Porcentagem de sucesso (0-100)
}

interface FisioPerformanceRateChartProps {
  data: FisioPerformanceRateData[];
  loading?: boolean;
}

export function FisioAutonomyByCategoryChart({ data, loading = false }: FisioPerformanceRateChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Desempenho</CardTitle>
          <CardDescription>Carregando dados de desempenho...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
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
          <CardTitle>Taxa de Desempenho</CardTitle>
          <CardDescription>Nenhum dado disponível para exibição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Sem dados para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Desempenho por Atividade</CardTitle>
        <CardDescription>
          Percentual de execução independente em cada exercício
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 60,
              bottom: 5,
              left: 5,
            }}
            barSize={20}
            barGap={1}
            barCategoryGap={3}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="atividade"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="desempenho" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="desempenho"
              layout="vertical"
              fill="var(--color-desempenho)"
              radius={4}
            >
              <LabelList
                dataKey="atividade"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
              />
              <LabelList
                dataKey="desempenho"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
