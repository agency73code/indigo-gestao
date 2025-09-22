import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { LinhaBarras } from '../types';

interface SessionStackedBarsProps {
    data: LinhaBarras[];
    loading?: boolean;
}

export function SessionStackedBars({ data, loading = false }: SessionStackedBarsProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição de Respostas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    // Normalizar dados para porcentagem (100%)
    const normalizedData = data.map((item) => {
        const total = item.acerto + item.ajuda + item.erro;
        return {
            sessao: item.sessao,
            acerto: total > 0 ? (item.acerto / total) * 100 : 0,
            ajuda: total > 0 ? (item.ajuda / total) * 100 : 0,
            erro: total > 0 ? (item.erro / total) * 100 : 0,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Sora, sans-serif' }}>
                    Distribuição de Respostas por Sessão
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Proporção de acertos, ajuda e erros em cada sessão
                </p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={normalizedData}
                        margin={{
                            top: 20,
                            right: 0,
                            left: 0,
                            bottom: 0,
                        }}
                        stackOffset="expand"
                    >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="sessao"
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            tickFormatter={(value) => `${Math.round(value)}%`}
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-background border border-border rounded-lg shadow-md p-3">
                                            <p className="font-medium mb-2">{`${label}`}</p>
                                            {payload.map((entry, index) => (
                                                <p key={index} style={{ color: entry.color }}>
                                                    {entry.name}:{' '}
                                                    {typeof entry.value === 'number'
                                                        ? entry.value.toFixed(1)
                                                        : entry.value}
                                                    %
                                                </p>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Bar
                            dataKey="acerto"
                            name="✅ Acerto"
                            stackId="a"
                            fill="var(--primary)"
                        />
                        <Bar
                            dataKey="ajuda"
                            name="🖐️ Ajuda"
                            stackId="a"
                            fill="hsl(45, 93%, 47%)" // Amarelo/laranja
                        />
                        <Bar
                            dataKey="erro"
                            name="❌ Erro"
                            stackId="a"
                            fill="hsl(var(--destructive))"
                        />
                    </BarChart>
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>✅ Acerto</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: 'hsl(45, 93%, 47%)' }}
                        />
                        <span>🖐️ Ajuda</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span>❌ Erro</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
