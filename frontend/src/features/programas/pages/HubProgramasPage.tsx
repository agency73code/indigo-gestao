import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { useProgramAreas } from '../core/hooks/useProgramConfig';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';

export default function HubProgramasPage() {
    const areas = useProgramAreas();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Programas & Objetivos');
    }, [setPageTitle]);

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            {/* Area Cards */}
            <div className="space-y-5 p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {areas.map((area, index) => {
                        const isImplemented = area.implemented === true;
                        const isInProgress = area.implemented === 'in-progress';
                        const isDisabled = !isImplemented && !isInProgress;
                        
                        // Cores diferentes para cada área
                        const iconColors = [
                            'text-indigo-600',
                            'text-amber-600',
                            'text-blue-600',
                            'text-pink-600',
                            'text-rose-600',
                            'text-purple-600',
                            'text-emerald-600',
                            'text-teal-600',
                            'text-orange-600',
                            'text-cyan-600',
                        ];
                        
                        const bgColors = [
                            'bg-[#E0E7FF]',
                            'bg-[#FEF3C7]',
                            'bg-[#DBEAFE]',
                            'bg-[#FCE7F3]',
                            'bg-[#FFE4E6]',
                            'bg-[#F3E8FF]',
                            'bg-[#D1FAE5]',
                            'bg-[#CCFBF1]',
                            'bg-[#FFEDD5]',
                            'bg-[#CFFAFE]',
                        ];

                        const IconComponent = area.icon;

                        return (
                            <Link
                                key={area.id}
                                to={area.path}
                                className={`block ${isDisabled ? 'pointer-events-none' : ''}`}
                                aria-label={`${area.title}: ${isImplemented ? 'Acessar programas e sessões' : isInProgress ? 'Quase pronto' : 'Em planejamento'}`}
                            >
                                <Card 
                                    padding="hub" 
                                    className={`
                                        rounded-lg h-full border-0 shadow-none transition-all
                                        ${isImplemented 
                                            ? 'cursor-pointer hover:scale-[1.02]' 
                                            : isInProgress
                                            ? 'cursor-pointer hover:scale-[1.02] opacity-80'
                                            : 'opacity-50 cursor-not-allowed'
                                        }
                                    `}
                                    style={{ backgroundColor: 'var(--hub-card-background)' }}
                                >
                                    <CardHeader className="space-y-5">
                                        <div className="flex items-start justify-between">
                                            {IconComponent && (
                                                <div className={`h-14 w-14 rounded-lg ${bgColors[index]} flex items-center justify-center`}>
                                                    <IconComponent className={`h-7 w-7 ${iconColors[index]}`} />
                                                </div>
                                            )}
                                            {isInProgress && (
                                                <span 
                                                    className="text-[14px] font-normal inline-block px-3 py-1" 
                                                    style={{ 
                                                        fontFamily: 'Inter, sans-serif', 
                                                        backgroundColor: '#E3F2FD', 
                                                        color: '#4A6A8F',
                                                        borderRadius: '24px'
                                                    }}
                                                >
                                                    Quase pronto
                                                </span>
                                            )}
                                            {isDisabled && (
                                                <span 
                                                    className="text-[14px] font-normal inline-block px-3 py-1" 
                                                    style={{ 
                                                        fontFamily: 'Inter, sans-serif', 
                                                        backgroundColor: '#FFF3E0', 
                                                        color: '#A57A5A',
                                                        borderRadius: '24px'
                                                    }}
                                                >
                                                    Em breve
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitleHub className="text-lg">
                                                {area.title}
                                            </CardTitleHub>
                                            <p className="text-sm text-muted-foreground">
                                                {area.subtitle || 'Criar, consultar e acompanhar programas'}
                                            </p>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
