import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
          <CardTitle>Taxa de Desempenho por Atividade</CardTitle>
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
          <CardTitle>Taxa de Desempenho por Atividade</CardTitle>
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
        <div className="space-y-4">
          {data.map((item, index) => {
            // Para desempenho, o máximo é 100%
            const percentage = Math.min(item.desempenho, 100);
            
            return (
              <div key={index} className="space-y-1.5">
                {/* Barra com valor */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap min-w-[50px] text-right">
                    {item.desempenho}%
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
