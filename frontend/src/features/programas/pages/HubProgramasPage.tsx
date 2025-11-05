import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useProgramAreas } from '../core/hooks/useProgramConfig';

export default function HubProgramasPage() {
    const areas = useProgramAreas();

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            {/* Header Section */}
            <div className="space-y-2">
                <h1
                    style={{ fontFamily: 'Sora, sans-serif' }}
                    className="text-2xl sm:text-2xl font-medium text-primary"
                >
                    Programas / Objetivos (OCP/OLP)
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Escolha a área para criar, consultar e acompanhar programas e sessões.
                </p>
            </div>

            {/* Area Cards */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {areas.map((area, index) => {
                        // Cores diferentes para cada área
                        const colors = [
                            'bg-[var(--card-primary)] text-white',
                            'bg-blue-500 text-white',
                            'bg-teal-500 text-white',
                            'bg-green-500 text-white',
                        ];

                        return (
                            <Card
                                key={area.id}
                                className={`overflow-hidden hover:shadow-md p-1 md:p-4 lg:p-8 transition-shadow rounded-[5px] ${colors[index]}`}
                            >
                                <Link
                                    to={area.path}
                                    className="block h-full"
                                    aria-label={`${area.title}: Acessar programas e sessões`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-medium text-base sm:text-lg">
                                                    {area.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm opacity-90">
                                                    {area.subtitle || 'Criar, consultar e acompanhar programas'}
                                                </p>
                                            </div>
                                            <div className="bg-white/20 rounded-full p-3 ml-3">
                                                <Activity className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
