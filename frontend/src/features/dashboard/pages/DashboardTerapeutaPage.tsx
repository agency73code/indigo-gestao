import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { getDashboardTerapeutaData } from '../services/dashboard.service';
import type { DashboardTerapeutaData } from '../types';
import {
    MetricsGrid,
    SessoesMensaisChart,
    AtividadesRecentes,
    MeusClientes,
} from '../components';

export default function DashboardTerapeutaPage() {
    const { setPageTitle } = usePageTitle();
    const [data, setData] = useState<DashboardTerapeutaData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Dashboard - Terapeuta');
    }, [setPageTitle]);

    useEffect(() => {
        let active = true;
        const loadData = async () => {
            try {
                const result = await getDashboardTerapeutaData();
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
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <p className="text-muted-foreground">Erro ao carregar dashboard</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-85px)] p-4 flex flex-col gap-3 overflow-hidden">
            {/* Row 1: Metrics Cards */}
            <div className="shrink-0">
                <MetricsGrid metrics={data.metrics} />
            </div>

            {/* Row 2: Sessões Mensais + Meus Clientes */}
            <div className="flex-[2] grid grid-cols-12 gap-3 min-h-0">
                <div className="col-span-12 lg:col-span-5 min-h-0">
                    <SessoesMensaisChart data={data.sessoesPorMes} />
                </div>
                <div className="col-span-12 lg:col-span-7 min-h-0">
                    <MeusClientes data={data.meusClientes} />
                </div>
            </div>

            {/* Row 3: Atividades Recentes */}
            <div className="flex-1 min-h-0">
                <AtividadesRecentes data={data.atividadesRecentes} />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="h-[calc(100vh-64px)] p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[100px] rounded-lg" />
                ))}
            </div>
            <div className="flex-1 grid grid-cols-12 gap-3">
                <Skeleton className="col-span-12 lg:col-span-5 rounded-lg" />
                <Skeleton className="col-span-12 lg:col-span-7 rounded-lg" />
            </div>
            <div className="flex-1">
                <Skeleton className="h-full rounded-lg" />
            </div>
        </div>
    );
}
