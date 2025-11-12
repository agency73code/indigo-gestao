import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { TrendingUp, BarChart3, Target, Calendar } from 'lucide-react';
import type { KpisRelatorio } from '../types';

interface KpiCardProps {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ElementType;
    bgColor: string;
    iconColor: string;
    textColor: string;
}

function KpiCard({ title, value, hint, icon: Icon, bgColor, iconColor, textColor }: KpiCardProps) {
    return (
        <Card 
            padding="hub" 
            className="border-0 shadow-none h-full"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader className="space-y-5">
                <div className={`h-14 w-14 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
                <div className="space-y-1">
                    <CardTitleHub className="text-lg">
                        {title}
                    </CardTitleHub>
                    <div className={`text-3xl font-medium ${textColor}`} style={{ fontFamily: 'Sora, sans-serif' }}>
                        {typeof value === 'number' && title.includes('%')
                            ? `${value.toFixed(0)}%`
                            : value}
                    </div>
                    {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
                </div>
            </CardHeader>
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
                {Array.from({ length: 4 }, (_, i) => (
                    <Card 
                        key={i}
                        padding="hub"
                        className="border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="space-y-5">
                            <div className="h-14 w-14 bg-muted animate-pulse rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                                <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-3 bg-muted animate-pulse rounded w-full" />
                            </div>
                        </CardHeader>
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
                icon={Target}
                bgColor="bg-[#D1FAE5]"
                iconColor="text-green-600"
                textColor="text-green-700 dark:text-green-400"
            />

            <KpiCard
                title="Independência"
                value={data.independencia + '%'}
                hint="Respostas sem ajuda"
                icon={TrendingUp}
                bgColor="bg-[#DBEAFE]"
                iconColor="text-blue-600"
                textColor="text-blue-700 dark:text-blue-400"
            />

            <KpiCard
                title="Tentativas"
                value={data.tentativas}
                hint="Total de tentativas registradas"
                icon={BarChart3}
                bgColor="bg-[#E0E7FF]"
                iconColor="text-indigo-600"
                textColor="text-purple-700 dark:text-purple-400"
            />

            <KpiCard
                title="Sessões"
                value={data.sessoes}
                hint="Sessões realizadas no período"
                icon={Calendar}
                bgColor="bg-[#FCE7F3]"
                iconColor="text-pink-600"
                textColor="text-pink-700 dark:text-pink-400"
            />
        </div>
    );
}
