import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { getDashboardData } from '../services/dashboard.service';
import type { DashboardData } from '../types';
import {
    MetricsGrid,
    SessoesMensaisChart,
    SessoesPorAreaChart,
    PerformanceChart,
    AtividadesRecentes,
    EstimulosAtencao,
} from '../components';

export default function DashboardPage() {
    const { setPageTitle } = usePageTitle();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            try {
                const result = await getDashboardData();
                if (active) {
                    setData(result);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };
        loadData();
        return () => {
            active = false;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-64px)] p-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-[100px] rounded-lg" />
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-12 gap-3">
                    <Skeleton className="col-span-12 lg:col-span-4 rounded-lg" />
                    <Skeleton className="col-span-12 lg:col-span-4 rounded-lg" />
                    <Skeleton className="col-span-12 lg:col-span-4 rounded-lg" />
                </div>
                <div className="flex-1 grid grid-cols-12 gap-3">
                    <Skeleton className="col-span-12 lg:col-span-6 rounded-lg" />
                    <Skeleton className="col-span-12 lg:col-span-6 rounded-lg" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <p className="text-muted-foreground">Erro ao carregar dashboard</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] p-4 flex flex-col gap-3 overflow-hidden">
            {/* Row 1: Metrics Cards */}
            <MetricsGrid metrics={data.metrics} />

            {/* Row 2: Charts - Sessões por Mês, Sessões por Área, Performance */}
            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
                <div className="col-span-12 lg:col-span-4">
                    <SessoesMensaisChart data={data.sessoesPorMes} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <SessoesPorAreaChart data={data.sessoesPorArea} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <PerformanceChart data={data.evolucaoPerformance} />
                </div>
            </div>

            {/* Row 3: Activity & Alerts */}
            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
                <div className="col-span-12 lg:col-span-6">
                    <AtividadesRecentes data={data.atividadesRecentes} />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <EstimulosAtencao data={data.estimulosAtencao} />
                </div>
            </div>
        </div>
    );
}
