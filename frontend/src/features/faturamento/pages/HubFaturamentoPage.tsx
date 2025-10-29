import { Link } from 'react-router-dom';
import { FilePlus, Clock, Table2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HubFaturamentoPage() {
    const mainActions = [
        {
            title: 'Registrar Lançamento',
            description: 'Lançar horas e valores de um atendimento',
            icon: FilePlus,
            href: '/app/faturamento/registrar-lancamento',
            bgColor: 'bg-[var(--card-primary)]',
            textColor: 'text-white',
        },
        {
            title: 'Minhas horas',
            description: 'Histórico e totais das suas sessões',
            icon: Clock,
            href: '/app/faturamento/minhas-horas',
            bgColor: 'bg-green-500',
            textColor: 'text-white',
        },
        {
            title: 'Gestão (gerente)',
            description: 'Listagem global com filtros por cliente e terapeuta',
            icon: Table2,
            href: '/app/faturamento/gestao',
            bgColor: 'bg-purple-500',
            textColor: 'text-white',
        },
        {
            title: 'Relatórios/Exportar',
            description: 'Exportar lançamentos filtrados',
            icon: Download,
            href: '/app/faturamento/relatorios',
            bgColor: 'bg-gray-500',
            textColor: 'text-white',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            {/* Header Section */}
            <div className="space-y-2">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-semibold text-primary"
                >
                    Faturamento
                </h1>
                
            </div>

            {/* Main Action Cards */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Horas no Mês</CardTitle>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45h</div>
                            <p className="text-xs text-muted-foreground">
                                +8h desde a semana passada
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Lançamentos
                            </CardTitle>
                            <FilePlus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">28</div>
                            <p className="text-xs text-muted-foreground">
                                12 pendentes, 16 aprovados
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                            <Download className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ 2.250</div>
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
