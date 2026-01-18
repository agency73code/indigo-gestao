import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { SessoesPorMes } from '../types';

interface SessoesMensaisChartProps {
  data: SessoesPorMes[];
}

export function SessoesMensaisChart({ data }: SessoesMensaisChartProps) {
  const hasData = data.some((item) => item.total > 0);
  
  // Calcular o total do mês atual (último item) e variação
  const mesAtual = data[data.length - 1];
  const mesAnterior = data[data.length - 2];
  const totalMesAtual = mesAtual?.total ?? 0;
  const variacao = mesAnterior?.total 
    ? Number(((totalMesAtual - mesAnterior.total) / mesAnterior.total * 100).toFixed(1))
    : 0;

  // Período dos dados
  const primeiroMes = data[0]?.mes ?? '';
  const ultimoMes = data[data.length - 1]?.mes ?? '';

  return (
    <Card padding="none" className="h-full border-0 shadow-none p-4 flex flex-col" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex pb-2 items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Sessões Mensais
          
        </CardTitle>
        <p className="text-xs text-muted-foreground">{primeiroMes} - {ultimoMes}</p>
      </CardHeader>
      <CardContent className="px-3 flex-1 min-h-0">
        {hasData ? (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, left: -5, bottom: 0 }}
              >
                <CartesianGrid 
                  vertical={false} 
                  strokeDasharray="4 4" 
                  stroke="#e5e7eb"
                  strokeOpacity={0.8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  width={40}
                />
                <XAxis 
                  dataKey="mes" 
                  tickLine={false} 
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--background)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value} sessões`, '']}
                  labelStyle={{ fontWeight: 500 }}
                />
                <Line
                  dataKey="total"
                  type="monotone"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem dados disponíveis
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 pt-0 pb-3 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          {variacao >= 0 ? (
            <>
              <span>Crescimento de {Math.abs(variacao)}% este mês</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </>
          ) : (
            <>
              <span>Queda de {Math.abs(variacao)}% este mês</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Mostrando sessões dos últimos {data.length} meses
        </p>
      </CardFooter>
    </Card>
  );
}
