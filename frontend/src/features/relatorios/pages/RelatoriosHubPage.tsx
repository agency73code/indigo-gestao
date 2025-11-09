import { Link } from 'react-router-dom';
import { FileText, FilePlus, Search, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export function RelatoriosHubPage() {
    const [totalRelatorios, setTotalRelatorios] = useState(0);
    const [relatoriosFinalizados, setRelatoriosFinalizados] = useState(0);
    const [relatoriosArquivados, setRelatoriosArquivados] = useState(0);
    const [relatoriosMesAtual, setRelatoriosMesAtual] = useState(0);

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
            {/* Header Section */}
            <div className="space-y-0 p">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-medium text-primary"
                >
                    Relatórios
                </h1>
            </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Relatórios
                            </CardTitle>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRelatorios}</div>
                            <p className="text-xs text-muted-foreground">
                                Total de relatórios no sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Finalizados
                            </CardTitle>
                            <FileText className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{relatoriosFinalizados}</div>
                            <p className="text-xs text-muted-foreground">
                                Relatórios completos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Arquivados
                            </CardTitle>
                            <Archive className="h-5 w-5 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{relatoriosArquivados}</div>
                            <p className="text-xs text-muted-foreground">
                                Relatórios arquivados
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[5px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Este Mês
                            </CardTitle>
                            <FilePlus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{relatoriosMesAtual}</div>
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
