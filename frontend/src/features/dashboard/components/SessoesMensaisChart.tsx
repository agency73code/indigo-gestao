import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessoesPorMes } from '../types';

interface SessoesMensaisChartProps {
  data: SessoesPorMes[];
}

export function SessoesMensaisChart({ data }: SessoesMensaisChartProps) {
  const hasData = data.some((item) => item.total > 0);

  return (
    <Card className="h-full border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Sessões por Mês</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {hasData ? (
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="mes" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value} sessões`, 'Total']}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === data.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
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
