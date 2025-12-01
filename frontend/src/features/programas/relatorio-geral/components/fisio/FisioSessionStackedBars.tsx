'use client';

import { Bar, BarChart, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  desempenhou: {
    label: 'Desempenhou',
    color: 'hsl(142, 76%, 36%)', // verde
  },
  comAjuda: {
    label: 'Com Ajuda',
    color: 'hsl(48, 96%, 53%)', // amarelo
  },
  naoDesempenhou: {
    label: 'Não Desempenhou',
    color: 'hsl(0, 84%, 60%)', // vermelho
  },
} satisfies ChartConfig;

export interface ToSessionData {
  sessao: string;
  desempenhou: number;
  comAjuda: number;
  naoDesempenhou: number;
}

interface ToSessionStackedBarsProps {
  data: ToSessionData[];
  loading?: boolean;
}

export function ToSessionStackedBars({ data, loading = false }: ToSessionStackedBarsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Sessão</CardTitle>
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
          <CardTitle>Desempenho por Sessão</CardTitle>
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
        <CardTitle>Desempenho por Sessão</CardTitle>
        <CardDescription>
          Acompanhamento do desempenho nas atividades de vida diária
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
              dataKey="desempenhou"
              stackId="performance"
              fill="var(--color-desempenhou)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="comAjuda"
              stackId="performance"
              fill="var(--color-comAjuda)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="naoDesempenhou"
              stackId="performance"
              fill="var(--color-naoDesempenhou)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
