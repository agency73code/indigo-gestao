import { Link } from 'react-router-dom';
import { Plus, ClipboardEdit, FileText, Eye, BarChart3, Search, FileStack } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useArea } from '@/contexts/AreaContext';

export default function HubPage() {
    const { setPageTitle } = usePageTitle();
    const { setCurrentArea } = useArea();

    useEffect(() => {
        // Define área como Fonoaudiologia quando acessa este hub
        setCurrentArea('fonoaudiologia');
        setPageTitle('Fonoaudiologia');
    }, [setPageTitle, setCurrentArea]);

    const mainActions = [
        {
            title: 'Criar Programa',
            description: 'Criar um novo programa de treino personalizado',
            icon: Plus,
            href: '/app/programas/novo',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
            available: true,
        },
        {
            title: 'Consultar Programas',
            description: 'Visualizar e gerenciar programas existentes',
            icon: FileText,
            href: '/app/programas/lista',
            iconColor: 'text-blue-600',
            bgColor: 'bg-[#DBEAFE]',
            available: true,
        },
        {
            title: 'Consultar Sessão',
            description: 'Visualizar e acompanhar sessões registradas',
            icon: Eye,
            href: '/app/programas/sessoes/consultar',
            iconColor: 'text-teal-600',
            bgColor: 'bg-[#CCFBF1]',
            available: true,
        },
        {
            title: 'Registrar Sessão',
            description: 'Registrar uma nova sessão de treino',
            icon: ClipboardEdit,
            href: '/app/programas/sessoes/nova',
            iconColor: 'text-green-600',
            bgColor: 'bg-[#D1FAE5]',
            available: true,
        },
        {
            title: 'Outros Modelos de Registro',
            description: 'Exportar formas específicas de registro.',
            icon: FileStack,
            href: '#',
            iconColor: 'text-amber-600',
            bgColor: 'bg-[#FEF3C7]',
            available: false,
            badge: 'Em breve',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-2 md:p-4 lg:p-4 space-y-4">
            {/* Main Action Cards */}
            <div className="space-y-5 p-1">
                {/* Mobile: 2 colunas, Desktop: 4 colunas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {mainActions.map((action, index) => {
                        const Icon = action.icon;
                        const isDisabled = !action.available;
                        
                        const cardContent = (
                            <Card 
                                padding="hub" 
                                className={`${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]'} border border-border/40 rounded-lg h-full`}
                                style={{ backgroundColor: 'var(--hub-card-background)' }}
                            >
                                {/* Mobile: padding e espaçamento menores */}
                                <CardHeader className="space-y-2 md:space-y-5 p-0">
                                    <div className="flex items-start justify-between">
                                        <div className={`h-10 w-10 md:h-14 md:w-14 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                                            <Icon className={`h-5 w-5 md:h-7 md:w-7 ${action.iconColor}`} />
                                        </div>
                                        {action.badge && (
                                            <Badge 
                                                variant="outline" 
                                                className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] md:text-xs px-1.5 md:px-2"
                                            >
                                                {action.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 md:space-y-1">
                                        <CardTitleHub className="text-sm md:text-lg leading-tight">
                                            {action.title}
                                        </CardTitleHub>
                                        {/* Descrição só aparece no desktop */}
                                        <p className="hidden md:block text-sm text-muted-foreground">
                                            {action.description}
                                        </p>
                                    </div>
                                </CardHeader>
                            </Card>
                        );

                        if (isDisabled) {
                            return (
                                <div key={index} aria-label={`${action.title}: ${action.description} (${action.badge})`}>
                                    {cardContent}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                to={action.href}
                                className="block"
                                aria-label={`${action.title}: ${action.description}`}
                            >
                                {cardContent}
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
                            <CardTitleHub className="text-base">Programas Ativos</CardTitleHub>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                12
                            </div>
                            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">Sessões Hoje</CardTitleHub>
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                8
                            </div>
                            <p className="text-xs text-muted-foreground">4 concluídas, 4 pendentes</p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">Taxa de Sucesso</CardTitleHub>
                            <Plus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                87%
                            </div>
                            <p className="text-xs text-muted-foreground">+5% desde o mês passado</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

