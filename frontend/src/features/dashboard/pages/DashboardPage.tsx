import { ChartAreaInteractive } from '@/components/Dashboard/chart-area-interactive';
import { DataTable } from '@/components/Dashboard/data-table';
import { SectionCards } from '@/components/Dashboard/section-cards';

// Dados de exemplo para a tabela
const mockData = [
    {
        id: 1,
        header: 'Consulta - João Silva',
        type: 'Consulta Individual',
        status: 'Agendado',
        target: 'Terapeuta: Maria Santos',
        limit: '2025-01-15',
        reviewer: 'Dr. Carlos',
    },
    {
        id: 2,
        header: 'Terapia - Ana Costa',
        type: 'Terapia em Grupo',
        status: 'Em Andamento',
        target: 'Terapeuta: João Oliveira',
        limit: '2025-01-20',
        reviewer: 'Dr. Carlos',
    },
    {
        id: 3,
        header: 'Avaliação - Pedro Lima',
        type: 'Avaliação Inicial',
        status: 'Concluído',
        target: 'Terapeuta: Maria Santos',
        limit: '2025-01-10',
        reviewer: 'Dr. Ana',
    },
    {
        id: 4,
        header: 'Sessão - Carla Mendes',
        type: 'Sessão Individual',
        status: 'Agendado',
        target: 'Terapeuta: Ana Silva',
        limit: '2025-01-18',
        reviewer: 'Dr. Pedro',
    },
    {
        id: 5,
        header: 'Consulta - Roberto Santos',
        type: 'Consulta Familiar',
        status: 'Pendente',
        target: 'Terapeuta: João Oliveira',
        limit: '2025-01-22',
        reviewer: 'Dr. Carlos',
    },
];

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col min-h-screen p-1 md:p-4 lg:p-8 space-y-6">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4">
                    {/* <div className='px-4 lg:px-6'>
                        <h1
                            className="text-2xl font-bold text-primary mb-2 "
                            style={{ fontFamily: 'Sora, sans-serif' }}
                        >
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Visão geral das atividades e estatísticas do Instituto Índigo
                        </p>
                    </div> */}
                    <SectionCards />
                    <div className="">
                        <ChartAreaInteractive />
                    </div>
                    <div className="">
                        <DataTable data={mockData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
