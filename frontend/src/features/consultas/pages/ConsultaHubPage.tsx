import { Link } from 'react-router-dom';
import { User, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getCardsOverview } from '@/lib/api';
import type { Actions, Subjects } from '@/features/auth/abilities/ability';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

export default function ConsultaHubPage() {
    const { setPageTitle } = usePageTitle();
    const [totalTerapeutas, setTotalTerapeutas] = useState(24);
    const [totalClientes, setTotalClientes] = useState(156);
    const [novosTerapeutas, setNovosTerapeutas] = useState(3);
    const [novosClientes, setNovosClientes] = useState(12);
    const [totalRegistros, setTotalRegistros] = useState(180);
    
    useEffect(() => {
        setPageTitle('Consultar');
    }, [setPageTitle]);

    type ActionConfig = {
        title: string;
        description: string;
        icon: React.ElementType;
        href: string;
        iconColor: string;
        bgColor: string;
        ability: { action: Actions; subject: Subjects };
    };

    const mainActions: ActionConfig[] = [
        {
            title: 'Terapeutas',
            description: 'Visualize e gerencie os terapeutas cadastrados no sistema',
            icon: User,
            href: '/app/consultar/terapeutas',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
            ability: { action: 'read', subject: 'Consultar' },
        },
        {
            title: 'Clientes',
            description: 'Visualize e gerencie os clientes cadastrados no sistema',
            icon: Users,
            href: '/app/consultar/pacientes',
            iconColor: 'text-blue-600',
            bgColor: 'bg-[#DBEAFE]',
            ability: { action: 'read', subject: 'Consultar' },
        },
    ];

    useEffect(() => {
        getCardsOverview()
            .then(
                ({
                    totalTerapeutas,
                    totalClientes,
                    novosTerapeutas,
                    novosClientes,
                    TerapeutasAtivos,
                    ClientesAtivos,
                }) => {
                    setTotalTerapeutas(totalTerapeutas);
                    setTotalClientes(totalClientes);
                    setNovosTerapeutas(novosTerapeutas);
                    setNovosClientes(novosClientes);
                    setTotalRegistros(TerapeutasAtivos + ClientesAtivos);
                },
            )
            .catch(() => {});
    }, []);

    return (
        <div className="flex flex-col min-h-full w-full px-1 py-4 md:p-4 sm:p-4 lg:p-4 space-y-4">
            {/* Main Action Cards */}
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mainActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <RequireAbility
                                key={index}
                                action={action.ability.action}
                                subject={action.ability.subject}
                            >
                                <Link
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
                            </RequireAbility>
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
                            <CardTitleHub className="text-base">Total Terapeutas</CardTitleHub>
                            <User className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalTerapeutas}
                            </div>
                            <p className="text-xs text-muted-foreground">{`+${novosTerapeutas} desde o mês passado`}</p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">Total Clientes</CardTitleHub>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalClientes}
                            </div>
                            <p className="text-xs text-muted-foreground">{`+${novosClientes} novos este mês`}</p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">Registros Ativos</CardTitleHub>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalRegistros}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total de registros ativos
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
