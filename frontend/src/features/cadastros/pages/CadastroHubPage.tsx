import { Link } from 'react-router-dom';
import { User, Users, UserPlus, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getCardsOverview } from '@/lib/api';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';
import type { Actions, Subjects } from '@/features/auth/abilities/ability';

export default function CadastroHubPage() {
    const [totalTerapeutas, setTotalTerapeutas] = useState(24);
    const [totalClientes, setTotalClientes] = useState(156);
    const [novosTerapeutas, setNovosTerapeutas] = useState(3);
    const [novosClientes, setNovosClientes] = useState(12);
    const [totalNovosRegistros, setTotalNovosRegistros] = useState(180);

    const mainActions = [
        {
            title: 'Cadastrar Terapeuta',
            description: 'Inclua um novo profissional no sistema com todos os dados necessários',
            icon: User,
            href: '/app/cadastro/terapeuta',
            iconColor: 'text-slate-600',
            bgColor: 'bg-[#CBD5E1]',
            ability: { action: 'manage', subject: 'all' },
        },
        {
            title: 'Cadastrar Cliente',
            description: 'Crie o cadastro completo do cliente no sistema',
            icon: Users,
            href: '/app/cadastro/cliente',
            iconColor: 'text-blue-600',
            bgColor: 'bg-[#DBEAFE]',
            ability: { action: 'create', subject: 'Cadastro' },
        },
        {
            title: 'Vínculos',
            description: 'Gerencie vínculos entre clientes e terapeutas no sistema',
            icon: Link2,
            href: '/app/cadastros/vinculos',
            iconColor: 'text-green-600',
            bgColor: 'bg-[#D1FAE5]',
            ability: { action: 'create', subject: 'Cadastro' },
        },
    ];

    useEffect(() => {
        getCardsOverview()
            .then(({ totalTerapeutas, totalClientes, novosTerapeutas, novosClientes }) => {
                setTotalTerapeutas(totalTerapeutas);
                setTotalClientes(totalClientes);
                setNovosTerapeutas(novosTerapeutas);
                setNovosClientes(novosClientes);
                setTotalNovosRegistros(novosTerapeutas + novosClientes);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="flex flex-col min-h-full w-full p-0 pt-4 md:p-4 lg:p-4 space-y-4">
            {/* Header Section */}
            <div className="space-y-0 p">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-medium text-primary"
                >
                    Cadastro
                </h1>
                
            </div>

            {/* Main Action Cards */}
            <div className="space-y-5 p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                    {mainActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <RequireAbility
                                key={index}
                                action={(action.ability?.action ?? 'read') as Actions}
                                subject={(action.ability?.subject ?? 'Dashboard') as Subjects}
                            >
                                <Link
                                    to={action.href}
                                    className="block"
                                    aria-label={`${action.title}: ${action.description}`}
                                >
                                    <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-xl bg-[#F1F5F9] h-full">
                                        <CardHeader className="space-y-5 p-1">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Cadastros Este Mês
                            </CardTitle>
                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalNovosRegistros}</div>
                            <p className="text-xs text-muted-foreground">{`+${totalNovosRegistros} desde o mês passado`}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Terapeutas Cadastrados
                            </CardTitle>
                            <User className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTerapeutas}</div>
                            <p className="text-xs text-muted-foreground">{`${novosTerapeutas} novos este mês`}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Clientes Cadastrados
                            </CardTitle>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalClientes}</div>
                            <p className="text-xs text-muted-foreground">{`${novosClientes} novos este mês`}</p>
                        </CardContent>
                    </Card>

                    
                </div>
            </div>
        </div>
    );
}
