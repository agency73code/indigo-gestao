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
        bgColor: string;
        textColor: string;
        ability: { action: Actions; subject: Subjects };
    }

    const mainActions: ActionConfig[] = [
        {
            title: 'Consultar Terapeutas',
            description: 'Visualize e gerencie os terapeutas cadastrados no sistema',
            icon: User,
            href: '/app/consultas/terapeutas',
            bgColor: 'bg-[var(--card-primary)]',
            textColor: 'text-white',
            ability: { action: 'manage', subject: 'all' },
        },
        {
            title: 'Consultar Pacientes',
            description: 'Visualize e gerencie os pacientes cadastrados no sistema',
            icon: Users,
            href: '/app/consultas/pacientes',
            bgColor: 'bg-blue-500',
            textColor: 'text-white',
            ability: { action: 'read', subject: 'all' },
        },
    ];

    useEffect(() => {
        getCardsOverview()
            .then(({ totalTerapeutas, totalClientes, novosTerapeutas, novosClientes }) => {
                setTotalTerapeutas(totalTerapeutas);
                setTotalClientes(totalClientes);
                setNovosTerapeutas(novosTerapeutas);
                setNovosClientes(novosClientes);
                setTotalRegistros(totalTerapeutas + totalClientes);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="flex flex-col min-h-full w-full px-1 py-4 md:p-4 sm:p-4 lg:p-8 space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-semibold text-primary"
                >
                    Consulta
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Visualize e gerencie os registros do sistema
                </p>
            </div>

            {/* Main Action Cards */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mainActions.map((action, index) => (
                        <RequireAbility key={index} action={action.ability.action} subject={action.ability.subject}>
                            <Card
                                className={`overflow-hidden hover:shadow-md p-1 md:p-4 lg:p-8 transition-shadow rounded-[5px] ${action.bgColor} ${action.textColor}`}
                            >
                                <Link
                                    to={action.href}
                                    className="block h-full"
                                    aria-label={`${action.title}: ${action.description}`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-medium text-base sm:text-lg">
                                                    {action.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm opacity-90">
                                                    {action.description}
                                                </p>
                                            </div>
                                            <div className="bg-white/20 rounded-full p-3 ml-3">
                                                <action.icon className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                    </RequireAbility>
                    ))}
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
                            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
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
