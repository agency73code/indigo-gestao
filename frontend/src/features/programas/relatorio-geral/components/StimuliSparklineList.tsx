import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { SparkItem } from '../types';

const getStatusColor = (status: 'manutencao' | 'aprendizagem' | 'dominar') => {
    switch (status) {
        case 'manutencao':
            return 'bg-green-100 text-green-700';
        case 'aprendizagem':
            return 'bg-yellow-100 text-yellow-700';
        case 'dominar':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const getStatusLabel = (status: 'manutencao' | 'aprendizagem' | 'dominar') => {
    switch (status) {
        case 'manutencao':
            return 'Manutenção';
        case 'aprendizagem':
            return 'Em aprendizagem';
        case 'dominar':
            return 'A dominar';
        default:
            return status;
    }
};

interface StimuliSparklineListProps {
    data: SparkItem[];
    loading?: boolean;
}

export function StimuliSparklineList({ data, loading = false }: StimuliSparklineListProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Estímulos - Independência</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border rounded">
                                <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Pegar apenas os top 5
    const topEstimulos = data.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Sora, sans-serif' }}>
                    Top 5 Estímulos - Evolução da Independência
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Acompanhe o progresso dos principais estímulos trabalhados
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {topEstimulos.map((item, index) => {
                        // Valor atual (último ponto da série)
                        const valorAtual =
                            item.serie.length > 0 ? item.serie[item.serie.length - 1].y : 0;

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                {/* Nome do estímulo */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="font-medium text-sm truncate"
                                        title={item.estimulo}
                                    >
                                        {item.estimulo}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {valorAtual.toFixed(1)}% independência
                                    </p>
                                </div>

                                {/* Badge de status */}
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(item.status)}`}
                                >
                                    {getStatusLabel(item.status)}
                                </span>

                                {/* Mini gráfico */}
                                <div className="w-24 h-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={item.serie}>
                                            <Line
                                                type="monotone"
                                                dataKey="y"
                                                stroke={
                                                    item.status === 'manutencao'
                                                        ? 'hsl(var(--primary))'
                                                        : item.status === 'aprendizagem'
                                                          ? 'hsl(45, 93%, 47%)'
                                                          : 'hsl(var(--destructive))'
                                                }
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {data.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">
                            Nenhum estímulo encontrado no período selecionado.
                        </p>
                    </div>
                )}

                {data.length > 5 && (
                    <div className="text-center mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Exibindo os 5 principais estímulos de {data.length} totais
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
