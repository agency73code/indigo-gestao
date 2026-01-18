import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClienteSessoes } from '../types';

interface ClientesSessoesChartProps {
  data: ClienteSessoes[];
}

// Paleta de cores profissional para os clientes
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

export function ClientesSessoesChart({ data }: ClientesSessoesChartProps) {
  // Pegar os 8 clientes com mais sessões
  const topClientes = data
    .filter((item) => item.totalSessoes > 0)
    .sort((a, b) => b.totalSessoes - a.totalSessoes)
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));

  const hasData = topClientes.length > 0;
  const totalSessoes = topClientes.reduce((acc, item) => acc + item.totalSessoes, 0);

  return (
    <Card padding="none" className="h-full border-0 shadow-none flex flex-col p-4" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Sessões por Cliente</CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 min-h-0">
        {hasData ? (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  data={topClientes}
                  cx="45%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="totalSessoes"
                  nameKey="nome"
                >
                  {topClientes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--background)',
                  }}
                  formatter={(value: number, name: string) => {
                    const percentual = ((value / totalSessoes) * 100).toFixed(1);
                    return [`${value} sessões (${percentual}%)`, name];
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '5px', fontSize: '12px' }}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground truncate max-w-[90px] inline-block align-middle">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem dados disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
}
