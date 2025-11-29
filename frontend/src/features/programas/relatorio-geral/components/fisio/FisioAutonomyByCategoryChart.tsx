import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  autonomia: {
    label: 'Autonomia',
    color: '#10B981',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

export interface FisioAutonomyData {
  categoria: string;
  autonomia: number; // Porcentagem de autonomia (0-100)
}

interface FisioAutonomyByCategoryChartProps {
  data: ToAutonomyData[];
  loading?: boolean;
}

export function FisioAutonomyByCategoryChart({ data, loading = false }: FisioAutonomyByCategoryChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Autonomia por Categoria</CardTitle>
          <CardDescription>Carregando dados de autonomia...</CardDescription>
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
          <CardTitle>Autonomia por Categoria</CardTitle>
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
        <CardTitle>Autonomia por Categoria</CardTitle>
        <CardDescription>
          Nível de independência nas diferentes áreas trabalhadas
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
              dataKey="categoria"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="autonomia" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="autonomia"
              layout="vertical"
              fill="var(--color-autonomia)"
              radius={4}
            >
              <LabelList
                dataKey="categoria"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
              />
              <LabelList
                dataKey="autonomia"
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
