import { Link } from 'react-router-dom';
import { Plus, Search, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HubPage() {
    const mainActions = [
        {
            title: 'Criar Programa',
            description: 'Criar um novo programa de treino personalizado',
            icon: Plus,
            href: '/app/programas/novo',
            bgColor: 'bg-[var(--card-primary)]',
            textColor: 'text-white',
        },
        {
            title: 'Consultar Programas',
            description: 'Visualizar e gerenciar programas existentes',
            icon: FileText,
            href: '/app/programas/lista',
            bgColor: 'bg-blue-500',
            textColor: 'text-white',
        },
        {
            title: 'Nova Sessão',
            description: 'Registrar uma nova sessão de treino',
            icon: Search,
            href: '/app/programas/sessoes/nova',
            bgColor: 'bg-green-500',
            textColor: 'text-white',
        },
        {
            title: 'Relatório Mensal',
            description: 'Visualizar relatórios e estatísticas',
            icon: BarChart3,
            href: '/app/programas/relatorios/mensal',
            bgColor: 'bg-purple-500',
            textColor: 'text-white',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-8 space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-semibold text-primary"
                >
                    Programas de Treino (OCP)
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Gerencie programas de treino personalizados e acompanhe o progresso dos
                    pacientes
                </p>
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
                            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">
                                4 concluídas, 4 pendentes
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                            <Plus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">87%</div>
                            <p className="text-xs text-muted-foreground">+5% desde o mês passado</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
