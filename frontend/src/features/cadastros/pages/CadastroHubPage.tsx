import { Link } from 'react-router-dom';
import { User, Users, UserPlus, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getCardsOverview } from '@/lib/api';

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
            bgColor: 'bg-[var(--card-primary)]',
            textColor: 'text-white',
        },
        {
            title: 'Cadastrar Cliente',
            description: 'Crie o cadastro completo do paciente/cliente no sistema',
            icon: Users,
            href: '/app/cadastro/cliente',
            bgColor: 'bg-blue-500',
            textColor: 'text-white',
        },
        {
            title: 'Vínculos',
            description: 'Gerencie vínculos entre clientes e terapeutas no sistema',
            icon: Link2,
            href: '/app/cadastros/vinculos',
            bgColor: 'bg-green-500',
            textColor: 'text-white',
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
                    className="text-2xl sm:text-2xl font-semibold text-primary"
                >
                    Cadastro
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Registre novos usuários e profissionais no sistema
                </p>
            </div>

            {/* Main Action Cards */}
            <div className="space-y-4 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                    {mainActions.map((action, index) => (
                        <Card
                            key={index}
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
