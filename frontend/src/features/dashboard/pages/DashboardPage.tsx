import { useEffect, useMemo, useState } from 'react';

import { AccuracyTrendChart } from '@/components/Dashboard/AccuracyTrendChart';
import { DataTable } from '@/components/Dashboard/data-table';
import { DashboardCards } from '@/components/Dashboard/DashboardCards';
import { Skeleton } from '@/components/ui/skeleton';
import type { AccuracyRange, AccuracyView } from '@/components/Dashboard/AccuracyTrendChart';
import { getDashboardOverview } from '@/lib/api/dashboard';
import type { DashboardOverview, TrendPoint } from '@/lib/types/dashboard';

const mockData = [
    {
        id: 1,
        header: 'Consulta - João Silva',
        type: 'Consulta Individual',
        status: 'Agendado',
        target: 'Terapeuta: Maria Santos',
        limit: '2025-01-15',
        reviewer: 'Dr. Carlos',
    },
    {
        id: 2,
        header: 'Terapia - Ana Costa',
        type: 'Terapia em Grupo',
        status: 'Em Andamento',
        target: 'Terapeuta: João Oliveira',
        limit: '2025-01-20',
        reviewer: 'Dr. Carlos',
    },
    {
        id: 3,
        header: 'Avaliação - Pedro Lima',
        type: 'Avaliação Inicial',
        status: 'Concluído',
        target: 'Terapeuta: Maria Santos',
        limit: '2025-01-10',
        reviewer: 'Dr. Ana',
    },
    {
        id: 4,
        header: 'Sessão - Carla Mendes',
        type: 'Sessão Individual',
        status: 'Agendado',
        target: 'Terapeuta: Ana Silva',
        limit: '2025-01-18',
        reviewer: 'Dr. Pedro',
    },
    {
        id: 5,
        header: 'Consulta - Roberto Santos',
        type: 'Consulta Familiar',
        status: 'Pendente',
        target: 'Terapeuta: João Oliveira',
        limit: '2025-01-22',
        reviewer: 'Dr. Carlos',
    },
];

type RangeDataset = Record<AccuracyRange, TrendPoint[]>;

const clampAccuracy = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const buildRangeData = (base: TrendPoint[]): RangeDataset => {
    const normalized = base.map((point, index) => ({
        week: point.week || `Semana ${index + 1}`,
        accuracy: clampAccuracy(point.accuracy),
    }));

    const lastAccuracy = normalized.at(-1)?.accuracy ?? 70;

    const sevenDayTrend = Array.from({ length: 7 }, (_, index) => ({
        week: `Dia ${index + 1}`,
        accuracy: clampAccuracy(lastAccuracy + (index - 3) * 2),
    }));

    const ninetyDayTrend = Array.from({ length: 12 }, (_, index) => {
        const source = normalized[index % normalized.length];
        return {
            week: `Semana ${index + 1}`,
            accuracy: clampAccuracy(source.accuracy + (index % 4) - 2),
        };
    });

    return {
        '7d': sevenDayTrend,
        '30d': normalized,
        '90d': ninetyDayTrend,
    };
};

const adjustTrend = (trend: TrendPoint[], adjust: (index: number, point: TrendPoint) => number) =>
    trend.map((point, index) => ({
        week: point.week,
        accuracy: clampAccuracy(point.accuracy + adjust(index, point)),
    }));

const buildViewData = (ranges: RangeDataset) => ({
    general: ranges,
    program: {
        '7d': adjustTrend(ranges['7d'], (index) => (index % 2 === 0 ? -3 : 1)),
        '30d': adjustTrend(ranges['30d'], (index) => (index % 2 === 0 ? -4 : 2)),
        '90d': adjustTrend(ranges['90d'], (index) => (index % 3 === 0 ? -3 : 2)),
    },
    patient: {
        '7d': adjustTrend(ranges['7d'], (index) => (index % 2 === 0 ? 3 : 0)),
        '30d': adjustTrend(ranges['30d'], (index) => (index % 3 === 0 ? 5 : -1)),
        '90d': adjustTrend(ranges['90d'], (index) => (index % 4 === 0 ? 4 : -2)),
    },
}) satisfies Partial<Record<AccuracyView, Partial<Record<AccuracyRange, TrendPoint[]>>>>;

export default function DashboardPage() {
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const loadOverview = async () => {
            try {
                const data = await getDashboardOverview();
                if (active) {
                    setOverview(data);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };
        loadOverview();
        return () => {
            active = false;
        };
    }, []);

    const rangeData = useMemo(() => (overview ? buildRangeData(overview.moodAccuracyTrend) : null), [overview]);
    const viewData = useMemo(() => (rangeData ? buildViewData(rangeData) : null), [rangeData]);

    return (
        <div className="flex min-h-screen flex-1 flex-col space-y-6 p-1 md:p-4 lg:p-8">
            <div className="@container/main flex flex-1 flex-col gap-6">
                <section className="flex flex-col gap-6">
                    {isLoading && (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-[150px] w-full rounded-[5px]" />
                            ))}
                        </div>
                    )}
                    {overview && <DashboardCards overview={overview} />}

                    <div>
                        {isLoading && !overview && (
                            <Skeleton className="h-[360px] w-full rounded-[5px]" />
                        )}
                        {overview && rangeData && (
                            <AccuracyTrendChart
                                data={rangeData['30d']}
                                rangeData={rangeData}
                                viewData={viewData ?? undefined}
                                defaultRange="30d"
                                defaultView="general"
                            />
                        )}
                    </div>

                    <div>
                        <DataTable data={mockData} />
                    </div>
                </section>
            </div>
        </div>
    );
}
