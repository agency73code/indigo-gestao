import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export interface ToAutonomyData {
  categoria: string;
  autonomia: number; // Porcentagem de autonomia (0-100)
}

interface ToAutonomyByCategoryChartProps {
  data: ToAutonomyData[];
  loading?: boolean;
}

export function ToAutonomyByCategoryChart({ data, loading = false }: ToAutonomyByCategoryChartProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Autonomia por Categoria</CardTitle>
          <CardDescription>Carregando dados de autonomia...</CardDescription>
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
          <CardTitle>Autonomia por Categoria</CardTitle>
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Autonomia por Categoria</CardTitle>
        <CardDescription>
          Nível de independência nas diferentes áreas trabalhadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            return (
              <div key={index} className="space-y-1.5">
                {/* Barra com valor */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded transition-all duration-300"
                      style={{ width: `${Math.max(item.autonomia, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap min-w-10 text-right">
                    {item.autonomia}%
                  </span>
                </div>
                {/* Nome da categoria abaixo */}
                <p className="text-xs text-muted-foreground leading-tight">
                  {item.categoria}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
