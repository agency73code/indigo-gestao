import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { FileText, ListChecks, Plus, Search, FileStack } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useArea } from '@/contexts/AreaContext';

/**
 * Hub de Musicoterapia
 * Página inicial com acesso rápido às funcionalidades principais de Musicoterapia
 */
export default function AreaHubMusiPage() {
    const { setPageTitle } = usePageTitle();
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('musicoterapia');
        setPageTitle('Musicoterapia');
    }, [setPageTitle, setCurrentArea]);

    const options = [
        {
            id: 'criar-programa',
            title: 'Criar Programa',
            subtitle: 'Cadastrar novo programa de Musicoterapia',
            path: '/app/programas/musicoterapia/ocp/novo',
            icon: Plus,
            bgColor: 'bg-[#E0E7FF]',
            iconColor: 'text-indigo-600',
            available: true,
        },
        {
            id: 'consultar-programas',
            title: 'Consultar Programas',
            subtitle: 'Ver e gerenciar programas existentes',
            path: '/app/programas/musicoterapia/consultar',
            icon: Search,
            bgColor: 'bg-[#DBEAFE]',
            iconColor: 'text-blue-600',
            available: true,
        },
        {
            id: 'registrar-sessao',
            title: 'Registrar Sessão',
            subtitle: 'Registrar nova sessão de Musicoterapia',
            path: '/app/programas/musicoterapia/sessoes/registrar',
            icon: FileText,
            bgColor: 'bg-[#CCFBF1]',
            iconColor: 'text-teal-600',
            available: true,
        },
        {
            id: 'consultar-sessoes',
            title: 'Consultar Sessões',
            subtitle: 'Ver histórico de sessões de Musicoterapia',
            path: '/app/programas/musicoterapia/sessoes',
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
        <div className="flex flex-col min-h-full w-full p-2 md:p-4 lg:p-4 space-y-4">
            <div className="space-y-5 p-1">
                {/* Mobile: 2 colunas, Desktop: 4 colunas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {options.map((option) => {
                        const IconComponent = option.icon;
                        const isDisabled = !option.available;

                        const cardContent = (
                            <Card
                                padding="hub"
                                className={`${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] transition-all'} rounded-lg h-full border-0 shadow-none`}
                                style={{ backgroundColor: 'var(--hub-card-background)' }}
                            >
                                {/* Mobile: padding e espaçamento menores */}
                                <CardHeader className="space-y-2 md:space-y-5 p-0">
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`h-10 w-10 md:h-14 md:w-14 rounded-lg ${option.bgColor} flex items-center justify-center`}
                                        >
                                            <IconComponent className={`h-5 w-5 md:h-7 md:w-7 ${option.iconColor}`} />
                                        </div>
                                        {option.badge && (
                                            <Badge 
                                                variant="outline" 
                                                className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] md:text-xs px-1.5 md:px-2"
                                            >
                                                {option.badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 md:space-y-1">
                                        <CardTitleHub className="text-sm md:text-lg leading-tight">
                                            {option.title}
                                        </CardTitleHub>
                                        {/* Descrição só aparece no desktop */}
                                        <p className="hidden md:block text-sm text-muted-foreground">
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

