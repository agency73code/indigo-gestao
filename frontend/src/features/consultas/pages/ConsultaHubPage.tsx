import { Link } from 'react-router-dom';
import { User, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getCardsOverview } from '@/lib/api';
import type { Actions, Subjects } from '@/features/auth/abilities/ability';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';

export default function ConsultaHubPage() {
    const [totalTerapeutas, setTotalTerapeutas] = useState(24);
    const [totalClientes, setTotalClientes] = useState(156);
    const [novosTerapeutas, setNovosTerapeutas] = useState(3);
    const [novosClientes, setNovosClientes] = useState(12);
    const [totalRegistros, setTotalRegistros] = useState(180);

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
            title: 'Consultar Terapeutas',
            description: 'Visualize e gerencie os terapeutas cadastrados no sistema',
            icon: User,
            href: '/app/consultar/terapeutas',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
            ability: { action: 'manage', subject: 'Consultar' },
        },
        {
            title: 'Consultar Clientes',
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
            {/* Header Section */}
            <div className="space-y-2">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-medium text-primary"
                >
                    Consultar
                </h1>
                {/* <p className="text-sm sm:text-base text-muted-foreground">
                    Visualize e gerencie os registros do sistema
                </p> */}
            </div>

            {/* Main Action Cards */}
            <div className="space-y-5 p-1">
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
                                    <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-xl bg-[#F1F5F9] h-full">
                                        <CardHeader className="space-y-3 p-2">
                                            <div className={`h-14 w-14 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                                                <Icon className={`h-7 w-7 ${action.iconColor}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-semibold text-foreground">
                                                    {action.title}
                                                </CardTitle>
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
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-lg sm:text-xl font-medium text-foreground"
                >
                    Visão Geral
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Terapeutas</CardTitle>
                            <User className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTerapeutas}</div>
                            <p className="text-xs text-muted-foreground">{`+${novosTerapeutas} desde o mês passado`}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalClientes}</div>
                            <p className="text-xs text-muted-foreground">{`+${novosClientes} novos este mês`}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Registros Ativos</CardTitle>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRegistros}</div>
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
