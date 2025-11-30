import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Activity,
    AlertTriangle,
    CircleHelp
} from 'lucide-react';
import type { Counts } from '@/features/programas/consulta-sessao/pages/helpers';

interface FisioSessionSummaryProps {
    counts: Counts;
    activitiesWorked: number;
    activitiesPlanned: number;
    // Metadados de fisioterapia
    hasDiscomfort: boolean;
    discomfortCount: number;
    hasCompensation: boolean;
    compensationCount: number;
}

interface KpiCardProps {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ElementType;
    bgColor: string;
    iconColor: string;
    textColor: string;
    tooltip?: string;
}

function KpiCard({ title, value, hint, icon: Icon, bgColor, iconColor, textColor, tooltip }: KpiCardProps) {
    return (
        <Card 
            padding="hub" 
            className="border-0 shadow-none h-full"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className={`h-9 w-9 rounded-lg ${bgColor} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    {tooltip && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px]">
                                    <p className="text-xs">{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="space-y-0.5">
                    <CardTitleHub className="text-xs leading-tight">
                        {title}
                    </CardTitleHub>
                    <div className={`text-xl font-medium ${textColor}`} style={{ fontFamily: 'Sora, sans-serif' }}>
                        {value}
                    </div>
                    {hint && <p className="text-xs text-muted-foreground leading-tight">{hint}</p>}
                </div>
            </CardHeader>
        </Card>
    );
}

export default function FisioSessionSummary({
    counts,
    activitiesWorked,
    activitiesPlanned,
    hasDiscomfort,
    discomfortCount,
    hasCompensation,
    compensationCount,
}: FisioSessionSummaryProps) {
    return (
        <div>
            {/* Todos os KPIs em uma única linha */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard
                    title="Atividades"
                    value={`${activitiesWorked}/${activitiesPlanned}`}
                    hint="Trabalhadas"
                    icon={Activity}
                    bgColor="bg-[#E0F2FE]"
                    iconColor="text-sky-600"
                    textColor="text-sky-700 dark:text-sky-400"
                    tooltip="Atividades trabalhadas em relação ao total planejado para o programa"
                />

                <KpiCard
                    title="Desempenhou"
                    value={counts.indep}
                    hint="Realizou sozinho"
                    icon={CheckCircle}
                    bgColor="bg-[#D1FAE5]"
                    iconColor="text-green-600"
                    textColor="text-green-700 dark:text-green-400"
                    tooltip="Total de tentativas onde o paciente realizou a atividade de forma independente"
                />

                <KpiCard
                    title="Com Ajuda"
                    value={counts.ajuda}
                    hint="Precisou de suporte"
                    icon={HandHelping}
                    bgColor="bg-[#FEF3C7]"
                    iconColor="text-yellow-600"
                    textColor="text-yellow-700 dark:text-yellow-400"
                    tooltip="Total de tentativas onde o paciente precisou de assistência para realizar"
                />

                <KpiCard
                    title="Não Desempenhou"
                    value={counts.erro}
                    hint="Não conseguiu"
                    icon={XCircle}
                    bgColor="bg-[#FEE2E2]"
                    iconColor="text-red-600"
                    textColor="text-red-700 dark:text-red-400"
                    tooltip="Total de tentativas onde o paciente não conseguiu realizar a atividade"
                />

                <KpiCard
                    title="Compensação"
                    value={hasCompensation ? compensationCount : '—'}
                    hint={hasCompensation ? 'Atividades com comp.' : 'Sem compensação'}
                    icon={AlertTriangle}
                    bgColor={hasCompensation ? "bg-[#FFEDD5]" : "bg-gray-100 dark:bg-gray-800"}
                    iconColor={hasCompensation ? "text-orange-600" : "text-gray-400"}
                    textColor={hasCompensation ? "text-orange-700 dark:text-orange-400" : "text-gray-500"}
                    tooltip="Número de atividades onde o paciente apresentou compensação motora"
                />

                <KpiCard
                    title="Desconforto"
                    value={hasDiscomfort ? discomfortCount : '—'}
                    hint={hasDiscomfort ? 'Atividades com dor' : 'Sem desconforto'}
                    icon={AlertTriangle}
                    bgColor={hasDiscomfort ? "bg-[#FEE2E2]" : "bg-gray-100 dark:bg-gray-800"}
                    iconColor={hasDiscomfort ? "text-red-600" : "text-gray-400"}
                    textColor={hasDiscomfort ? "text-red-700 dark:text-red-400" : "text-gray-500"}
                    tooltip="Número de atividades onde o paciente relatou desconforto ou dor"
                />
            </div>
        </div>
    );
}
