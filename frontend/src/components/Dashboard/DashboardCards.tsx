import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DashboardOverview } from '@/lib/types/dashboard';

type CardKey = keyof Pick<
    DashboardOverview,
    'activePatients' | 'weeklySessions' | 'activeOCPPrograms' | 'stimuliAccuracy'
>;

interface MetricCardConfig {
    key: CardKey;
    title: string;
    subcopy: string;
    tooltip: string;
    emptyState: string;
    ariaLabel: string;
    actionLabel: string;
    actionHref: string;
    formatValue?: (value: number) => string;
}

const metricCards: MetricCardConfig[] = [
    {
        key: 'activePatients',
        title: 'Clientes Ativos',
        subcopy: 'Em acompanhamento no momento',
        tooltip: 'Contagem de clientes com acompanhamento vigente ou sessões futuras.',
        emptyState: 'Sem clientes ativos agora.',
        ariaLabel: 'Total de clientes ativos',
        actionLabel: 'Ver lista',
        actionHref: '#',
        formatValue: (value) => value.toLocaleString('pt-BR'),
    },
    {
        key: 'weeklySessions',
        title: 'Sessões nesta semana',
        subcopy: 'Consultas agendadas nos próximos 7 dias',
        tooltip: 'Inclui atendimentos presenciais e online confirmados.',
        emptyState: 'Nenhuma sessão marcada para esta semana.',
        ariaLabel: 'Total de sessões na semana',
        actionLabel: 'Ver agenda',
        actionHref: '#',
        formatValue: (value) => value.toLocaleString('pt-BR'),
    },
    {
        key: 'activeOCPPrograms',
        title: 'Programas OCP Ativos',
        subcopy: 'Programas em execução por cliente',
        tooltip: 'Soma de programas OCP ativos entre todos os clientes.',
        emptyState: 'Nenhum programa OCP ativo.',
        ariaLabel: 'Total de programas OCP ativos',
        actionLabel: 'Ver por cliente',
        actionHref: '#',
        formatValue: (value) => value.toLocaleString('pt-BR'),
    },
    {
        key: 'stimuliAccuracy',
        title: 'Acurácia de Estímulos',
        subcopy: 'Média de acertos nas últimas 4 semanas',
        tooltip: 'Taxa média de acerto dos estímulos registrados em OCP.',
        emptyState: 'Sem registros recentes de estímulos.',
        ariaLabel: 'Média de acurácia de estímulos',
        actionLabel: 'Ver registros',
        actionHref: '#',
        formatValue: (value) =>
            `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`,
    },
];

interface DashboardCardsProps {
    overview: DashboardOverview;
}

export function DashboardCards({ overview }: DashboardCardsProps) {
    return (
        <TooltipProvider>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-4 lg:mt-0 sm:mt-0">
                {metricCards.map((metric) => {
                    const value = overview[metric.key] ?? 0;
                    const isEmpty = value === 0;
                    const label = isEmpty ? metric.emptyState : metric.subcopy;
                    const formattedValue = metric.formatValue?.(value) ?? value.toString();

                    return (
                        <Card
                            key={metric.key}
                            aria-label={metric.ariaLabel}
                            role="region"
                            className="rounded-[5px] border bg-card"
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-2">
                                    <CardTitle className="text-base font-semibold text-foreground">
                                        {metric.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{label}</p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            className="text-primary"
                                            aria-label={`Informações sobre ${metric.title}`}
                                        >
                                            <Info className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[220px] text-xs">
                                        {metric.tooltip}
                                    </TooltipContent>
                                </Tooltip>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-3xl font-semibold tracking-tight text-foreground">
                                    {formattedValue}
                                </p>
                                <a
                                    href={metric.actionHref}
                                    className="inline-flex text-sm font-medium text-primary hover:underline"
                                >
                                    {metric.actionLabel}
                                </a>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
