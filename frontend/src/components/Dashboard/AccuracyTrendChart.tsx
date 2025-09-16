import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TrendPoint } from '@/lib/types/dashboard';

export type AccuracyRange = '7d' | '30d' | '90d';
export type AccuracyView = 'general' | 'program' | 'patient';

const rangeLabels: Record<AccuracyRange, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
};

const viewLabels: Record<AccuracyView, string> = {
    general: 'Geral (média)',
    program: 'Por programa OCP',
    patient: 'Por paciente',
};

interface AccuracyTrendChartProps {
    data: TrendPoint[];
    rangeData?: Partial<Record<AccuracyRange, TrendPoint[]>>;
    viewData?: Partial<Record<AccuracyView, Partial<Record<AccuracyRange, TrendPoint[]>>>>;
    defaultRange?: AccuracyRange;
    defaultView?: AccuracyView;
}

const chartConfig = {
    accuracy: {
        label: 'Acurácia média (%)',
        color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

export function AccuracyTrendChart({
    data,
    rangeData,
    viewData,
    defaultRange = '30d',
    defaultView = 'general',
}: AccuracyTrendChartProps) {
    const availableViews = useMemo(() => {
        if (!viewData) {
            return [] as AccuracyView[];
        }
        return (Object.keys(viewData) as AccuracyView[]).filter((view) => viewData[view]);
    }, [viewData]);

    const [selectedView, setSelectedView] = useState<AccuracyView>(() => {
        if (viewData && viewData[defaultView]) {
            return defaultView;
        }
        return availableViews[0] ?? 'general';
    });

    useEffect(() => {
        if (!viewData) {
            return;
        }
        if (!viewData[selectedView]) {
            const fallback = availableViews[0];
            if (fallback) {
                setSelectedView(fallback);
            }
        }
    }, [availableViews, selectedView, viewData]);

    const [selectedRange, setSelectedRange] = useState<AccuracyRange>(defaultRange);

    useEffect(() => {
        const validRanges: AccuracyRange[] = ['7d', '30d', '90d'];
        if (!validRanges.includes(selectedRange)) {
            setSelectedRange(validRanges.includes(defaultRange) ? defaultRange : '30d');
        }
    }, [selectedRange, defaultRange]);

    const currentData = useMemo(() => {
        if (viewData) {
            const viewDataset = viewData[selectedView];
            if (viewDataset?.[selectedRange]) {
                return viewDataset[selectedRange] ?? [];
            }
        }
        if (rangeData?.[selectedRange]) {
            return rangeData[selectedRange] ?? [];
        }
        return data;
    }, [data, rangeData, selectedRange, selectedView, viewData]);

    const hasData = currentData.length > 0;

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-foreground">
                        Evolução da Acurácia de Estímulos
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Média de acertos por semana</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {availableViews.length > 0 && (
                        <Select value={selectedView} onValueChange={(value) => setSelectedView(value as AccuracyView)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Selecionar visão" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[10px]">
                                {availableViews.map((view) => (
                                    <SelectItem key={view} value={view} className="rounded-[8px]">
                                        {viewLabels[view]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Tabs value={selectedRange} onValueChange={(value) => setSelectedRange(value as AccuracyRange)}>
                        <TabsList className="grid grid-cols-3">
                            {(Object.keys(rangeLabels) as AccuracyRange[]).map((range) => (
                                <TabsTrigger key={range} value={range} className="rounded-[8px]">
                                    {rangeLabels[range]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {hasData ? (
                    <ChartContainer
                        config={chartConfig}
                        className="text-primary aspect-[16/9] h-[320px] w-full"
                    >
                        <AreaChart
                            data={currentData}
                            margin={{ left: 0, right: 0, top: 16, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.3} />
                            <XAxis
                                dataKey="week"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={32}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <ChartTooltip
                                cursor={{ strokeDasharray: '4 4' }}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        labelFormatter={(label) => String(label)}
                                        formatter={(value) => [
                                            `${new Intl.NumberFormat('pt-BR', {
                                                maximumFractionDigits: 1,
                                            }).format(typeof value === 'number' ? value : Number(value))}%`,
                                            'Acurácia média (%)',
                                        ]}
                                    />
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="accuracy"
                                stroke="currentColor"
                                strokeWidth={2}
                                fill="currentColor"
                                fillOpacity={0.16}
                                dot={{ r: 3 }}
                                isAnimationActive
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
                        <h3 className="text-base font-semibold text-foreground">Sem dados para o período</h3>
                        <p className="text-sm text-muted-foreground">
                            Ajuste o filtro de data ou registre novos estímulos.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
