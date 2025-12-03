import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export interface ToActivityDurationData {
  atividade: string;
  duracao: number;
}

interface ToActivityDurationChartProps {
  data: ToActivityDurationData[];
  loading?: boolean;
}

export function ToActivityDurationChart({ data, loading = false }: ToActivityDurationChartProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tempo por Atividade</CardTitle>
          <CardDescription>Carregando dados de duração...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tempo por Atividade</CardTitle>
          <CardDescription>Nenhum dado disponível para exibição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[280px] text-center gap-2">
            <BarChart3 className="h-10 w-10 opacity-30 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Sem dados para mostrar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Encontrar o valor máximo para calcular proporções
  const maxDuracao = Math.max(...data.map(d => d.duracao));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tempo por Atividade</CardTitle>
        <CardDescription>
          Duração média de cada atividade trabalhada (em minutos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = maxDuracao > 0 ? (item.duracao / maxDuracao) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1.5">
                {/* Barra com valor */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-[#2C7FFF] rounded transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap min-w-[50px] text-right">
                    {item.duracao} min
                  </span>
                </div>
                {/* Nome da atividade abaixo */}
                <p className="text-xs text-muted-foreground leading-tight">
                  {item.atividade}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
