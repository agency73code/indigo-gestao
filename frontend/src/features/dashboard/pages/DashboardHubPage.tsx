import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Stethoscope, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

interface DashboardOption {
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    color: string;
}

const dashboardOptions: DashboardOption[] = [
    {
        title: 'Dashboard Terapeuta',
        description: 'Visualize seus pacientes, sessões realizadas e performance individual.',
        icon: <Stethoscope className="h-8 w-8" />,
        path: '/app/dashboard/terapeuta',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    {
        title: 'Dashboard Gerente',
        description: 'Visão geral da clínica, métricas de equipe e indicadores de gestão.',
        icon: <Users className="h-8 w-8" />,
        path: '/app/dashboard/gerente',
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
];

export default function DashboardHubPage() {
    const { setPageTitle } = usePageTitle();
    const navigate = useNavigate();

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center p-6">
            <div className="max-w-3xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold mb-2">Selecione o Dashboard</h1>
                    <p className="text-muted-foreground">
                        Escolha a visualização de acordo com seu perfil de acesso.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        (Tela temporária - será automatizada via login)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardOptions.map((option) => (
                        <Card
                            key={option.path}
                            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                            onClick={() => navigate(option.path)}
                        >
                            <CardHeader className="pb-3">
                                <div
                                    className={`w-14 h-14 rounded-lg flex items-center justify-center mb-3 border ${option.color}`}
                                >
                                    {option.icon}
                                </div>
                                <CardTitle className="text-lg">{option.title}</CardTitle>
                                <CardDescription>{option.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between group-hover:bg-primary/5"
                                >
                                    Acessar
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
