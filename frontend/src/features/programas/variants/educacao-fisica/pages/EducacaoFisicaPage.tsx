import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { FileText, Eye, Plus, ClipboardEdit, FileStack } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useArea } from '@/contexts/AreaContext';

/**
 * Hub de Educação Física
 * Usa o mesmo modelo de dados que Fisioterapia, mas com área separada
 */
export default function EducacaoFisicaPage() {
    const { setPageTitle } = usePageTitle();
    const { setCurrentArea } = useArea();

    useEffect(() => {
        setCurrentArea('educacao-fisica');
        setPageTitle('Educação Física');
    }, [setPageTitle, setCurrentArea]);

    const mainActions = [
        {
            title: 'Criar Programa',
            description: 'Criar um novo programa de treino personalizado',
            icon: Plus,
            href: '/app/programas/novo-fisio',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
            available: true,
        },
        {
            title: 'Consultar Programas',
            description: 'Visualizar e gerenciar programas existentes',
            icon: FileText,
            href: '/app/programas/lista-fisio',
            iconColor: 'text-blue-600',
            bgColor: 'bg-[#DBEAFE]',
            available: true,
        },
        {
            title: 'Consultar Sessão',
            description: 'Visualizar e acompanhar sessões registradas',
            icon: Eye,
            href: '/app/programas/sessoes-fisio/consultar',
            iconColor: 'text-teal-600',
            bgColor: 'bg-[#CCFBF1]',
            available: true,
        },
        {
            title: 'Registrar Sessão',
            description: 'Registrar uma nova sessão de treino',
            icon: ClipboardEdit,
            href: '/app/programas/sessoes-fisio/registrar',
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
                            >
                                <CardHeader className="space-y-5">
                                    <div className="flex items-start justify-between">
                                        <div className={`h-14 w-14 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                                            <Icon className={`h-7 w-7 ${action.iconColor}`} />
                                        </div>
                                        {action.badge && (
                                            <Badge 
                                                variant="outline" 
                                                className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                                            >
                                                {action.badge}
                                            </Badge>
                                        )}
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
                                aria-label={`${action.title}: ${action.description}`}
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
