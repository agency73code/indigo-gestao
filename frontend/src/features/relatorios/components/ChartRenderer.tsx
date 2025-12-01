import { Suspense } from 'react';
import type { ChartConfig } from '../configs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartRendererProps {
  config: ChartConfig;
  data: any;
  loading?: boolean;
}

/**
 * Renderizador genérico de gráficos
 * 
 * Factory pattern que instancia o componente correto baseado no tipo.
 * Suporta lazy loading dos componentes de gráfico.
 */
export function ChartRenderer({ config, data, loading }: ChartRendererProps) {
  const ChartComponent = config.component;
  
  if (!ChartComponent) {
    return (
      <Card className="rounded-[5px]">
        <CardHeader>
          <CardTitle className="text-base">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Componente de gráfico não configurado para: {config.type}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="rounded-[5px]">
        <CardHeader>
          <CardTitle className="text-base">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: config.height || 400 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Suspense
      fallback={
        <Card className="rounded-[5px]">
          <CardHeader>
            <CardTitle className="text-base">{config.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full" style={{ height: config.height || 400 }} />
          </CardContent>
        </Card>
      }
    >
      <ChartComponent 
        data={data} 
        loading={loading}
        title={config.title}
        height={config.height}
      />
    </Suspense>
  );
}
