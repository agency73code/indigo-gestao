import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessoesPorArea } from '../types';

interface SessoesPorAreaChartProps {
  data: SessoesPorArea[];
}

export function SessoesPorAreaChart({ data }: SessoesPorAreaChartProps) {
  const filteredData = data.filter((item) => item.total > 0);
  const hasData = filteredData.length > 0;

  return (
    <Card className="h-full border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Sessões por Área</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {hasData ? (
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="total"
                  nameKey="label"
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number, name: string) => [`${value} sessões`, name]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
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
