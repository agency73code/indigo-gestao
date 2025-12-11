import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface FisioActivityLoadData {
  atividade: string;
  carga: number; // Carga média em kg
}

interface FisioActivityLoadChartProps {
  data: FisioActivityLoadData[];
  loading?: boolean;
}

export function FisioActivityDurationChart({ data, loading = false }: FisioActivityLoadChartProps) {
  const maxCarga = Math.max(...data.map(d => d.carga), 1);

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
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = maxCarga > 0 ? (item.carga / maxCarga) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1.5">
                {/* Barra com valor */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9333EA] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap min-w-[50px] text-right">
                    {item.carga} kg
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
