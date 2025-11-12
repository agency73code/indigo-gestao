import { Link } from 'react-router-dom';
import { Plus, ClipboardEdit, FileText, Eye, BarChart3, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';

export default function HubPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Fonoaudiologia & Psicopedagogia');
    }, [setPageTitle]);

    const mainActions = [
        {
            title: 'Criar Programa',
            description: 'Criar um novo programa de treino personalizado',
            icon: Plus,
            href: '/app/programas/novo',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
        },
        {
            title: 'Consultar Programas',
            description: 'Visualizar e gerenciar programas existentes',
            icon: FileText,
            href: '/app/programas/lista',
            iconColor: 'text-blue-600',
            bgColor: 'bg-[#DBEAFE]',
        },
        {
            title: 'Consultar Sessão',
            description: 'Visualizar e acompanhar sessões registradas',
            icon: Eye,
            href: '/app/programas/sessoes/consultar',
            iconColor: 'text-teal-600',
            bgColor: 'bg-[#CCFBF1]',
        },
        {
            title: 'Registrar Sessão',
            description: 'Registrar uma nova sessão de treino',
            icon: ClipboardEdit,
            href: '/app/programas/sessoes/nova',
            iconColor: 'text-green-600',
            bgColor: 'bg-[#D1FAE5]',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            {/* Main Action Cards */}
            <div className="space-y-5 p-1">
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
                    <Card className="rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">4 concluídas, 4 pendentes</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
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

