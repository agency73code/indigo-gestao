import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { TrendingUp, BarChart3, Target, Calendar } from 'lucide-react';
import type { KpisRelatorio } from '../types';

interface KpiCardProps {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
}

function KpiCard({ title, value, hint, icon, trend, trendValue, bgColor, textColor, borderColor }: KpiCardProps) {
    return (
        <Card className={`px-1 py-4 md:px-8 md:py-10 lg:px-0 lg:py-2 ${bgColor} ${borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${textColor}`}>{title}</CardTitle>
                <div className={`h-4 w-4 ${textColor}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${textColor}`} style={{ fontFamily: 'Sora, sans-serif' }}>
                    {typeof value === 'number' && title.includes('%')
                        ? `${value.toFixed(1)}%`
                        : value}
                </div>
                {hint && <p className={`text-xs ${textColor} opacity-90 mt-1`}>{hint}</p>}
                {trend && trendValue && <div className="flex items-center mt-2"></div>}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-print-kpi-grid>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-print-kpi-grid>
            <KpiCard
                title="Acerto geral"
                value={data.acerto + '%'}
                hint="Percentual de respostas corretas"
                icon={<Target className="h-4 w-4" />}
                trend="up"
                trendValue="+2.3%"
                bgColor="bg-green-50 dark:bg-green-900/20"
                textColor="text-green-700 dark:text-green-400"
                borderColor="border-green-200 dark:border-green-800"
            />

            <KpiCard
                title="Independência"
                value={data.independencia + '%'}
                hint="Respostas sem ajuda"
                icon={<TrendingUp className="h-4 w-4" />}
                trend="up"
                trendValue="+1.8%"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
                textColor="text-blue-700 dark:text-blue-400"
                borderColor="border-blue-200 dark:border-blue-800"
            />

            <KpiCard
                title="Tentativas"
                value={data.tentativas}
                hint="Total de tentativas registradas"
                icon={<BarChart3 className="h-4 w-4" />}
                bgColor="bg-purple-50 dark:bg-purple-900/20"
                textColor="text-purple-700 dark:text-purple-400"
                borderColor="border-purple-200 dark:border-purple-800"
            />

            <KpiCard
                title="Sessões"
                value={data.sessoes}
                hint="Sessões realizadas no período"
                icon={<Calendar className="h-4 w-4" />}
                bgColor="bg-pink-50 dark:bg-pink-900/20"
                textColor="text-pink-700 dark:text-pink-400"
                borderColor="border-pink-200 dark:border-pink-800"
            />
        </div>
    );
}
