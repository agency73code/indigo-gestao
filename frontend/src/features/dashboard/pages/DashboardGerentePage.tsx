import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { getDashboardGerenteData } from '../services/dashboard.service';
import type { DashboardGerenteData } from '../types';
import {
    GerenteMetricsGrid,
    SessoesMensaisChart,
    SessoesPorAreaChart,
    EquipePerformanceChart,
    TerapeutasRanking,
    PacientesAtencao,
} from '../components';

export default function DashboardGerentePage() {
    const { setPageTitle } = usePageTitle();
    const [data, setData] = useState<DashboardGerenteData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Dashboard - Gerente');
    }, [setPageTitle]);

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            try {
                const result = await getDashboardGerenteData();
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
        return <DashboardSkeleton />;
    }

    if (!data) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <p className="text-muted-foreground">Erro ao carregar dashboard</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] p-4 flex flex-col gap-3 overflow-hidden">
            {/* Row 1: Metrics Cards */}
            <GerenteMetricsGrid metrics={data.metrics} />

            {/* Row 2: Charts */}
            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
                <div className="col-span-12 lg:col-span-4">
                    <SessoesMensaisChart data={data.sessoesPorMes} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <SessoesPorAreaChart data={data.sessoesPorArea} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <EquipePerformanceChart data={data.equipePerformance} />
                </div>
            </div>

            {/* Row 3: Rankings & Alerts */}
            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
                <div className="col-span-12 lg:col-span-6">
                    <TerapeutasRanking data={data.terapeutasRanking} />
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <PacientesAtencao data={data.pacientesAtencao} />
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
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
