import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  carga: {
    label: 'Carga',
    color: '#9333EA', // Roxo para diferenciação
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig;

export interface FisioActivityLoadData {
  atividade: string;
  carga: number; // Carga média em kg
}

interface FisioActivityLoadChartProps {
  data: FisioActivityLoadData[];
  loading?: boolean;
}

export function FisioActivityDurationChart({ data, loading = false }: FisioActivityLoadChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carga por Atividade</CardTitle>
          <CardDescription>Carregando dados de carga...</CardDescription>
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
          <CardTitle>Carga por Atividade</CardTitle>
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
        <CardTitle>Carga por Atividade</CardTitle>
        <CardDescription>
          Carga média utilizada em cada exercício (em kg)
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
            <XAxis dataKey="carga" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="carga"
              layout="vertical"
              fill="var(--color-carga)"
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
                dataKey="carga"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value} kg`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
