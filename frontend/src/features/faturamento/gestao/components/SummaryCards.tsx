import { Card } from '@/components/ui/card';
import { Clock, Calendar, Users, DollarSign } from 'lucide-react';

type SummaryCardsProps = {
    totalSessions: number;
    totalDays: number;
    totalHoursPayable: number;
    totalAmount: number;
};

export function SummaryCards({
    totalSessions,
    totalDays,
    totalHoursPayable,
    totalAmount,
}: SummaryCardsProps) {
    const cards = [
        {
            title: 'Total de Sessões',
            value: totalSessions,
            icon: Users,
            color: 'text-blue-600',
        },
        {
            title: 'Total de Dias',
            value: totalDays,
            icon: Calendar,
            color: 'text-green-600',
        },
        {
            title: 'Horas Pagáveis',
            value: `${totalHoursPayable}h`,
            icon: Clock,
            color: 'text-purple-600',
        },
        {
            title: 'Valor Total',
            value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(totalAmount),
            icon: DollarSign,
            color: 'text-orange-600',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{card.value}</div>
                </Card>
            ))}
        </div>
    );
}
