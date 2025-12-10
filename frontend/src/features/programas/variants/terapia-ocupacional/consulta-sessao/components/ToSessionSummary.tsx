import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    CircleHelp,
    TrendingUp,
    Clock,
    ListChecks
} from 'lucide-react';
import type { ToStatus } from '../helpers';

export interface ToSessionSummaryProps {
    status: ToStatus;
    totalTentativas: number;
    activitiesWorked: number;
    activitiesPlanned: number;
    totalDurationMinutes: number | null;
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
    highlighted?: boolean;
}

function KpiCard({ 
    title, 
    value, 
    hint, 
    icon: Icon, 
    bgColor, 
    iconColor, 
    textColor, 
    tooltip,
    highlighted 
}: KpiCardProps) {
    return (
        <Card 
            padding="hub" 
            className={`border-0 shadow-none h-full ${highlighted ? 'ring-2 ring-primary/20' : ''}`}
            style={{ backgroundColor: 'var(--hub-card-background)' }}
        >
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className={`h-11 w-11 rounded-lg ${bgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
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
                <div className="space-y-1">
                    <CardTitleHub className="text-sm leading-tight">
                        {title}
                    </CardTitleHub>
                    <div className={`text-2xl font-normal ${textColor}`} style={{ fontFamily: 'Sora, sans-serif' }}>
                        {value}
                    </div>
                    {hint && <p className="text-sm text-muted-foreground leading-tight">{hint}</p>}
                </div>
            </CardHeader>
        </Card>
    );
}

function getStatusConfig(status: ToStatus) {
    switch (status) {
        case 'desempenhou':
            return {
                label: 'Desempenhou',
                bgColor: 'bg-[#D1FAE5]',
                iconColor: 'text-emerald-600',
                textColor: 'text-emerald-700 dark:text-emerald-400',
                icon: CheckCircle,
                hint: 'Maioria: independente',
            };
        case 'desempenhou-com-ajuda':
            return {
                label: 'Com Ajuda',
                bgColor: 'bg-[#FEF3C7]',
                iconColor: 'text-amber-600',
                textColor: 'text-amber-700 dark:text-amber-400',
                icon: HandHelping,
                hint: 'Maioria: com ajuda',
            };
        case 'nao-desempenhou':
            return {
                label: 'Não Desempenhou',
                bgColor: 'bg-[#FEE2E2]',
                iconColor: 'text-rose-600',
                textColor: 'text-rose-700 dark:text-rose-400',
                icon: XCircle,
                hint: 'Maioria: sem desempenho',
            };
        default:
            return {
                label: 'Sem dados',
                bgColor: 'bg-muted',
                iconColor: 'text-muted-foreground',
                textColor: 'text-muted-foreground',
                icon: CheckCircle,
                hint: 'Sem registros',
            };
    }
}

function formatDuration(minutes: number | null): string {
    if (minutes === null || minutes === 0) return '—';
    
    if (minutes < 60) {
        return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
}

export default function ToSessionSummary({
    status,
    totalTentativas,
    activitiesWorked,
    activitiesPlanned,
    totalDurationMinutes,
}: ToSessionSummaryProps) {
    const statusConfig = getStatusConfig(status);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status Geral - Card destacado */}
            <KpiCard
                title="Status Geral"
                value={statusConfig.label}
                hint={statusConfig.hint}
                icon={statusConfig.icon}
                bgColor={statusConfig.bgColor}
                iconColor={statusConfig.iconColor}
                textColor={statusConfig.textColor}
                tooltip="Status predominante da sessão, baseado no resultado com maior frequência"
                highlighted
            />

            {/* Tentativas */}
            <KpiCard
                title="Tentativas"
                value={totalTentativas}
                hint="Total registradas"
                icon={ListChecks}
                bgColor="bg-[#E0E7FF]"
                iconColor="text-indigo-600"
                textColor="text-indigo-700 dark:text-indigo-400"
                tooltip="Total de tentativas registradas na sessão"
            />

            {/* Estímulos Trabalhados */}
            <KpiCard
                title="Atividades"
                value={`${activitiesWorked}/${activitiesPlanned}`}
                hint="Trabalhadas"
                icon={TrendingUp}
                bgColor="bg-[#E0F2FE]"
                iconColor="text-sky-600"
                textColor="text-sky-700 dark:text-sky-400"
                tooltip="Atividades trabalhadas em relação ao total planejado para o programa"
            />

            {/* Tempo Total */}
            <KpiCard
                title="Tempo Total"
                value={formatDuration(totalDurationMinutes)}
                hint={totalDurationMinutes ? `${totalDurationMinutes} minutos` : 'Não registrado'}
                icon={Clock}
                bgColor="bg-[#EDE9FE]"
                iconColor="text-violet-600"
                textColor="text-violet-700 dark:text-violet-400"
                tooltip="Tempo total de atividades na sessão (soma dos tempos por estímulo)"
            />
        </div>
    );
}
