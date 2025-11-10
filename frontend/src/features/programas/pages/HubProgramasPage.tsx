import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {areas.map((area, index) => {
                        // Cores diferentes para cada área
                        const iconColors = [
                            'text-indigo-600',
                            'text-blue-600',
                            'text-teal-600',
                            'text-green-600',
                        ];
                        
                        const bgColors = [
                            'bg-[#E0E7FF]',
                            'bg-[#DBEAFE]',
                            'bg-[#CCFBF1]',
                            'bg-[#D1FAE5]',
                        ];

                        const IconComponent = area.icon;

                        return (
                            <Link
                                key={area.id}
                                to={area.path}
                                className="block"
                                aria-label={`${area.title}: Acessar programas e sessões`}
                            >
                                <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-lg bg-[#F1F5F9] h-full">
                                    <CardHeader className="space-y-5 p-2">
                                        {IconComponent && (
                                            <div className={`h-14 w-14 rounded-lg ${bgColors[index]} flex items-center justify-center`}>
                                                <IconComponent className={`h-7 w-7 ${iconColors[index]}`} />
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-medium text-foreground">
                                                {area.title}
                                            </CardTitle>
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
