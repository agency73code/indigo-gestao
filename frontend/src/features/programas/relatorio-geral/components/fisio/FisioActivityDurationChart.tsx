import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  duracao: {
    label: 'Duração',
    color: '#2C7FFF',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

export interface FisioActivityDurationData {
  atividade: string;
  duracao: number;
}

interface FisioActivityDurationChartProps {
  data: FisioActivityDurationData[];
  loading?: boolean;
}

export function FisioActivityDurationChart({ data, loading = false }: FisioActivityDurationChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo por Atividade</CardTitle>
          <CardDescription>Carregando dados de duração...</CardDescription>
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
          <CardTitle>Tempo por Atividade</CardTitle>
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
        <CardTitle>Tempo por Atividade</CardTitle>
        <CardDescription>
          Duração média de cada atividade trabalhada (em minutos)
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
              right: 40,
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
            <XAxis dataKey="duracao" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="duracao"
              layout="vertical"
              fill="var(--color-duracao)"
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
                dataKey="duracao"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value} min`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
