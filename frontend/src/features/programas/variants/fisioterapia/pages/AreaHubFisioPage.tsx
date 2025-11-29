import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { FileText, ListChecks, Plus, Search, FileStack } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useArea } from '@/contexts/AreaContext';

/**
 * Hub de Fisioterapia
 * Página inicial com acesso rápido às funcionalidades principais de TO
 */
export default function AreaHubTOPage() {
    const { setPageTitle } = usePageTitle();
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('fisioterapia');
        setPageTitle('Fisioterapia');
    }, [setPageTitle, setCurrentArea]);

    const options = [
        {
            id: 'criar-programa',
            title: 'Criar Programa',
            subtitle: 'Cadastrar novo programa de Fisio',
            path: '/app/programas/fisioterapia/ocp/novo',
            icon: Plus,
            bgColor: 'bg-[#E0E7FF]',
            iconColor: 'text-indigo-600',
            available: true,
        },
        {
            id: 'consultar-programas',
            title: 'Consultar Programas',
            subtitle: 'Ver e gerenciar programas existentes',
            path: '/app/programas/fisioterapia/consultar',
            icon: Search,
            bgColor: 'bg-[#DBEAFE]',
            iconColor: 'text-blue-600',
            available: true,
        },
        {
            id: 'registrar-sessao',
            title: 'Registrar Sessão',
            subtitle: 'Registrar nova sessão de Fisio',
            path: '/app/programas/fisioterapia/sessoes/registrar',
            icon: FileText,
            bgColor: 'bg-[#CCFBF1]',
            iconColor: 'text-teal-600',
            available: true,
        },
        {
            id: 'consultar-sessoes',
            title: 'Consultar Sessões',
            subtitle: 'Ver histórico de sessões de TO',
            path: '/app/programas/fisioterapia/sessoes',
            icon: ListChecks,
            bgColor: 'bg-[#D1FAE5]',
            iconColor: 'text-green-600',
            available: true,
        },
        {
            id: 'outros-registros',
            title: 'Outros Modelos de Registro',
            subtitle: 'Exportar formas específicas de registro.',
            path: '#',
            icon: FileStack,
            bgColor: 'bg-[#FEF3C7]',
            iconColor: 'text-amber-600',
            available: false,
            badge: 'Em breve',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            <div className="space-y-5 p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {options.map((option) => {
                        const IconComponent = option.icon;
                        const isDisabled = !option.available;

                        const cardContent = (
                            <Card
                                padding="hub"
                                className={`${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] transition-all'} rounded-lg h-full border-0 shadow-none`}
                                style={{ backgroundColor: 'var(--hub-card-background)' }}
                            >
                                <CardHeader className="space-y-5">
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`h-14 w-14 rounded-lg ${option.bgColor} flex items-center justify-center`}
                                        >
                                            <IconComponent className={`h-7 w-7 ${option.iconColor}`} />
                                        </div>
                                        {option.badge && (
                                            <Badge 
                                                variant="outline" 
                                                className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                                            >
                                                {option.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitleHub className="text-lg">
                                            {option.title}
                                        </CardTitleHub>
                                        <p className="text-sm text-muted-foreground">
                                            {option.subtitle}
                                        </p>
                                    </div>
                                </CardHeader>
                            </Card>
                        );

                        if (isDisabled) {
                            return (
                                <div key={option.id} aria-label={`${option.title}: ${option.subtitle} (${option.badge})`}>
                                    {cardContent}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={option.id}
                                to={option.path}
                                className="block"
                                aria-label={`${option.title}: ${option.subtitle}`}
                            >
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
