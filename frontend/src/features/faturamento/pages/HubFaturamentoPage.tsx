import { Link } from 'react-router-dom';
import { FilePlus, Clock, Table2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';

export default function HubFaturamentoPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Faturamento');
    }, [setPageTitle]);

    const mainActions = [
        {
            title: 'Registrar Lançamento',
            description: 'Lançar horas e valores de um atendimento',
            icon: FilePlus,
            href: '/app/faturamento/registrar-lancamento',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
        },
        {
            title: 'Minhas horas',
            description: 'Histórico e totais das suas sessões',
            icon: Clock,
            href: '/app/faturamento/minhas-horas',
            iconColor: 'text-green-600',
            bgColor: 'bg-[#D1FAE5]',
        },
        {
            title: 'Gestão (gerente)',
            description: 'Listagem global com filtros por cliente e terapeuta',
            icon: Table2,
            href: '/app/faturamento/gestao',
            iconColor: 'text-purple-600',
            bgColor: 'bg-[#E9D5FF]',
        },
        {
            title: 'Relatórios/Exportar',
            description: 'Exportar lançamentos filtrados',
            icon: Download,
            href: '/app/faturamento/relatorios',
            iconColor: 'text-gray-600',
            bgColor: 'bg-[#E5E7EB]',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            {/* Main Action Cards */}
            <div className="space-y-5 p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mainActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={index}
                                to={action.href}
                                className="block"
                                aria-label={`${action.title}: ${action.description}`}
                            >
                                <Card 
                                    padding="hub" 
                                    className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-lg h-full"
                                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                                >
                                    <CardHeader className="space-y-3">
                                        <div className={`h-14 w-14 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                                            <Icon className={`h-7 w-7 ${action.iconColor}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitleHub className="text-lg">
                                                {action.title}
                                            </CardTitleHub>
                                            <p className="text-sm text-muted-foreground">
                                                {action.description}
                                            </p>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="space-y-4">
                <h2
                    style={{ 
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 'var(--hub-section-title-font-weight)'
                    }}
                    className="text-lg sm:text-xl text-foreground"
                >
                    Visão Geral
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">Horas no Mês</CardTitleHub>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                45h
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +8h desde a semana passada
                            </p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Total de Lançamentos
                            </CardTitleHub>
                            <FilePlus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                28
                            </div>
                            <p className="text-xs text-muted-foreground">
                                12 pendentes, 16 aprovados
                            </p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">Valor Estimado</CardTitleHub>
                            <Download className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                R$ 2.250
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +12% desde o mês passado
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
