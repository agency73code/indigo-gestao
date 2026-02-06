/**
 * HubFaturamentoPage
 * 
 * Página Hub de Faturamento - separação de acesso entre Terapeuta e Gerente.
 */

import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';

export function HubFaturamentoPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Faturamento');
    }, [setPageTitle]);

    const accessOptions = [
        {
            title: 'Minhas Horas',
            description: 'Visualize suas horas de sessões e atas de reunião registradas no sistema.',
            icon: Clock,
            href: '/app/faturamento/minhas-horas',
            iconColor: 'text-indigo-600',
            bgColor: 'bg-[#E0E7FF]',
            role: 'Terapeuta',
        },
        {
            title: 'Gestão de Horas',
            description: 'Visualize os lançamentos de todos os terapeutas, aprove e gere relatórios.',
            icon: Users,
            href: '/app/faturamento/gestao',
            iconColor: 'text-purple-600',
            bgColor: 'bg-[#E9D5FF]',
            role: 'Gerente',
        },
    ];

    return (
        <div className="flex flex-col min-h-full w-full p-4 md:p-6 lg:p-8">
            {/* Título e descrição */}
            <div className="mb-8">
                <h1 
                    className="text-2xl md:text-3xl text-foreground mb-2"
                    style={{ 
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 'var(--hub-section-title-font-weight, 400)'
                    }}
                >
                    Faturamento
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Gerencie os lançamentos de horas e sessões para controle de repasses e faturamento da clínica.
                </p>
            </div>

            {/* Cards de acesso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {accessOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                        <Link
                            key={index}
                            to={option.href}
                            className="block group"
                            aria-label={`${option.title}: ${option.description}`}
                        >
                            <Card 
                                padding="hub" 
                                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border border-border/40 rounded-xl h-full"
                                style={{ backgroundColor: 'var(--hub-card-background)' }}
                            >
                                <CardHeader className="space-y-4 p-6">
                                    <div className="flex items-start justify-between">
                                        <div className={`h-16 w-16 rounded-xl ${option.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            <Icon className={`h-8 w-8 ${option.iconColor}`} />
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                            {option.role}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitleHub className="text-xl group-hover:text-primary transition-colors">
                                            {option.title}
                                        </CardTitleHub>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {option.description}
                                        </p>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default HubFaturamentoPage;
