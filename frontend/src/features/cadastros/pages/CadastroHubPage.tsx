import { Link } from 'react-router-dom';
import { User, Users, UserPlus, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getCardsOverview } from '@/lib/api';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';
import type { Actions, Subjects } from '@/features/auth/abilities/ability';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

export default function CadastroHubPage() {
    // ✅ Definir título da página
    const { setPageTitle } = usePageTitle();
    
    useEffect(() => {
        setPageTitle('Cadastro');
    }, [setPageTitle]);
    
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
            {/* Main Action Cards */}
            <div className="space-y-5">
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
                                    <Card 
                                        padding="hub" 
                                        className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-lg h-full"
                                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                                    >
                                        <CardHeader className="space-y-5">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Cadastros Este Mês
                            </CardTitleHub>
                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalNovosRegistros}
                            </div>
                            <p className="text-xs text-muted-foreground">{`+${totalNovosRegistros} desde o mês passado`}</p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Terapeutas Cadastrados
                            </CardTitleHub>
                            <User className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalTerapeutas}
                            </div>
                            <p className="text-xs text-muted-foreground">{`${novosTerapeutas} novos este mês`}</p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Clientes Cadastrados
                            </CardTitleHub>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalClientes}
                            </div>
                            <p className="text-xs text-muted-foreground">{`${novosClientes} novos este mês`}</p>
                        </CardContent>
                    </Card>

                    
                </div>
            </div>
        </div>
    );
}
