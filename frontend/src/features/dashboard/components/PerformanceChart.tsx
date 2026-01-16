import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EvolucaoPerformance } from '../types';

interface PerformanceChartProps {
  data: EvolucaoPerformance[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const hasData = data.some((item) => item.independencia > 0 || item.ajuda > 0);

  return (
    <Card className="h-full border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Evolução da Performance</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Independente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary/40" />
              <span className="text-muted-foreground">Com ajuda</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {hasData ? (
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIndep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAjuda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="semana" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`]}
                />
                <Area
                  type="monotone"
                  dataKey="independencia"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorIndep)"
                  name="Independente"
                />
                <Area
                  type="monotone"
                  dataKey="ajuda"
                  stroke="hsl(var(--primary) / 0.5)"
                  strokeWidth={2}
                  fill="url(#colorAjuda)"
                  name="Com ajuda"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
            Sem dados disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
}
