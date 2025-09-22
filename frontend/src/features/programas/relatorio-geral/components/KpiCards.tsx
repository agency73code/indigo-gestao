import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Target, Calendar } from 'lucide-react';
import type { KpisRelatorio } from '../types';

interface KpiCardProps {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

function KpiCard({ title, value, hint, icon, trend, trendValue }: KpiCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {typeof value === 'number' && title.includes('%')
                        ? `${value.toFixed(1)}%`
                        : value}
                </div>
                {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
                {trend && trendValue && (
                    <div className="flex items-center mt-2">
                        {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                        {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
                        <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                                trend === 'up'
                                    ? 'bg-green-100 text-green-700'
                                    : trend === 'down'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {trendValue}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface KpiCardsProps {
    data: KpisRelatorio;
    loading?: boolean;
}

export function KpiCards({ data, loading = false }: KpiCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                    <Card key={i}>
                        <CardHeader className="space-y-0 pb-2">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
                title="Acerto geral"
                value={data.acerto}
                hint="Percentual de respostas corretas"
                icon={<Target className="h-4 w-4" />}
                trend="up"
                trendValue="+2.3%"
            />

            <KpiCard
                title="Independência"
                value={data.independencia}
                hint="Respostas sem ajuda"
                icon={<TrendingUp className="h-4 w-4" />}
                trend="up"
                trendValue="+1.8%"
            />

            <KpiCard
                title="Tentativas"
                value={data.tentativas}
                hint="Total de tentativas registradas"
                icon={<BarChart3 className="h-4 w-4" />}
            />

            <KpiCard
                title="Sessões"
                value={data.sessoes}
                hint="Sessões realizadas no período"
                icon={<Calendar className="h-4 w-4" />}
            />

           
        </div>
    );
}
