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
            bgColor: 'bg-[var(--card-primary)]',
            textColor: 'text-white',
        },
        {
            title: 'Relatórios Salvos',
            description: 'Consulte todos os relatórios salvos organizados por cliente',
            icon: Search,
            href: '/app/relatorios/lista',
            bgColor: 'bg-blue-500',
            textColor: 'text-white',
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
