import { Link } from 'react-router-dom';
import { FileText, FilePlus, Search, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

export function RelatoriosHubPage() {
    const [totalRelatorios, setTotalRelatorios] = useState(0);
    const [relatoriosFinalizados, setRelatoriosFinalizados] = useState(0);
    const [relatoriosArquivados, setRelatoriosArquivados] = useState(0);
    const [relatoriosMesAtual, setRelatoriosMesAtual] = useState(0);
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Relatórios');
    }, [setPageTitle]);

    const mainActions = [
        {
            title: 'Gerar Relatório',
            description: 'Crie um novo relatório personalizado com filtros e análises',
            icon: FilePlus,
            href: '/app/relatorios/novo',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
        },
        {
            title: 'Relatórios Salvos',
            description: 'Consulte todos os relatórios salvos organizados por cliente',
            icon: Search,
            href: '/app/relatorios/lista',
            iconColor: 'text-blue-600',
            bgColor: 'bg-[#DBEAFE]',
        },
    ];

    useEffect(() => {
        // TODO: Implementar chamada à API para buscar estatísticas
        // Por enquanto, usando valores mockados
        setTotalRelatorios(47);
        setRelatoriosFinalizados(38);
        setRelatoriosArquivados(9);
        setRelatoriosMesAtual(12);
    }, []);

    return (
        <div className="flex flex-col min-h-full w-full p-0 pt-4 md:p-4 lg:p-4 space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Total de Relatórios
                            </CardTitleHub>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {totalRelatorios}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total de relatórios no sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Finalizados
                            </CardTitleHub>
                            <FileText className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {relatoriosFinalizados}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Relatórios completos
                            </p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Arquivados
                            </CardTitleHub>
                            <Archive className="h-5 w-5 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {relatoriosArquivados}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Relatórios arquivados
                            </p>
                        </CardContent>
                    </Card>

                    <Card 
                        padding="hub"
                        className="rounded-lg border-0 shadow-none"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitleHub className="text-base">
                                Este Mês
                            </CardTitleHub>
                            <FilePlus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="text-2xl tracking-tight"
                                style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
                            >
                                {relatoriosMesAtual}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Relatórios gerados este mês
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
