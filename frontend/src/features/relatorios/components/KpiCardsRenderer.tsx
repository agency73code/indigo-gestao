import type { KpiConfig } from '../configs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KpiCardsRendererProps {
  configs: KpiConfig[];
  data: Record<string, any>;
  loading?: boolean;
}

/**
 * Renderizador genérico de KPI cards
 * 
 * Recebe array de configs e dados, renderiza os cards dinamicamente.
 * Suporta qualquer tipo de KPI definido na configuração da área.
 */
export function KpiCardsRenderer({ configs, data, loading }: KpiCardsRendererProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {configs.map((_, index) => (
          <Card key={index} className="rounded-[5px]">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {configs.map((config) => {
        const value = data[config.dataKey];
        const Icon = config.icon;
        
        // Formatar valor baseado no tipo
        const formattedValue = typeof value === 'number' 
          ? value.toFixed(0) + (config.type.includes('percentual') ? '%' : '')
          : value || '0';

        return (
          <Card key={config.dataKey} className="rounded-[5px] border-l-4" style={{
            borderLeftColor: config.colorClass ? `var(--${config.colorClass})` : undefined
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {config.label}
                </p>
                <Icon className={cn('h-4 w-4', config.colorClass)} />
              </div>
              <div className="space-y-1">
                <p className={cn(
                  'text-2xl font-bold',
                  config.colorClass
                )}>
                  {formattedValue}
                </p>
                {/* Gap/variação se disponível */}
                {data[`gap${config.dataKey.charAt(0).toUpperCase() + config.dataKey.slice(1)}`] !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {data[`gap${config.dataKey.charAt(0).toUpperCase() + config.dataKey.slice(1)}`] > 0 ? '↑' : '↓'}
                    {' '}
                    {Math.abs(data[`gap${config.dataKey.charAt(0).toUpperCase() + config.dataKey.slice(1)}`])}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
