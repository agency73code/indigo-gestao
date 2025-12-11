import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Activity,
    AlertTriangle,
    CircleHelp,
    TrendingUp
} from 'lucide-react';
import type { FisioStatus } from '../helpers';

export interface FisioSessionSummaryProps {
    status: FisioStatus;
    activitiesWorked: number;
    activitiesPlanned: number;
    compensationCount: number;
    discomfortCount: number;
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

function KpiCard({ title, value, hint, icon: Icon, bgColor, iconColor, textColor, tooltip, highlighted }: KpiCardProps) {
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

function getStatusConfig(status: FisioStatus) {
    switch (status) {
        case 'desempenhou':
            return {
                label: 'Desempenhou',
                bgColor: 'bg-[#D1FAE5]',
                iconColor: 'text-emerald-600',
                textColor: 'text-emerald-700 dark:text-emerald-400',
                icon: CheckCircle,
            };
        case 'desempenhou-com-ajuda':
            return {
                label: 'Com Ajuda',
                bgColor: 'bg-[#FEF3C7]',
                iconColor: 'text-amber-600',
                textColor: 'text-amber-700 dark:text-amber-400',
                icon: HandHelping,
            };
        case 'nao-desempenhou':
            return {
                label: 'Não Desempenhou',
                bgColor: 'bg-[#FEE2E2]',
                iconColor: 'text-rose-600',
                textColor: 'text-rose-700 dark:text-rose-400',
                icon: XCircle,
            };
        default:
            return {
                label: 'Sem dados',
                bgColor: 'bg-muted',
                iconColor: 'text-muted-foreground',
                textColor: 'text-muted-foreground',
                icon: CheckCircle,
            };
    }
}

export default function FisioSessionSummary({
    activitiesWorked,
    activitiesPlanned,
    discomfortCount,
    compensationCount,
    status,
}: FisioSessionSummaryProps) {
    const statusConfig = getStatusConfig(status);
    const hasCompensation = compensationCount > 0;
    const hasDiscomfort = discomfortCount > 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status Geral - Card destacado */}
            <KpiCard
                title="Status Geral"
                value={statusConfig.label}
                hint={`Maioria: ${status === 'desempenhou' ? 'independente' : status === 'desempenhou-com-ajuda' ? 'com ajuda' : 'sem desempenho'}`}
                icon={statusConfig.icon}
                bgColor={statusConfig.bgColor}
                iconColor={statusConfig.iconColor}
                textColor={statusConfig.textColor}
                tooltip="Status predominante da sessão, baseado no resultado com maior frequência"
                highlighted
            />

            {/* Atividades */}
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

            {/* Compensação */}
            <KpiCard
                title="Compensação"
                value={hasCompensation ? compensationCount : '—'}
                hint={hasCompensation ? 'Atividades com comp.' : 'Sem compensação'}
                icon={Activity}
                bgColor={hasCompensation ? "bg-[#DBEAFE]" : "bg-muted/30"}
                iconColor={hasCompensation ? "text-blue-600" : "text-muted-foreground"}
                textColor={hasCompensation ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground"}
                tooltip="Número de atividades onde o paciente apresentou compensação motora"
            />

            {/* Desconforto */}
            <KpiCard
                title="Desconforto"
                value={hasDiscomfort ? discomfortCount : '—'}
                hint={hasDiscomfort ? 'Atividades com dor' : 'Sem desconforto'}
                icon={AlertTriangle}
                bgColor={hasDiscomfort ? "bg-[#FEF3C7]" : "bg-muted/30"}
                iconColor={hasDiscomfort ? "text-amber-600" : "text-muted-foreground"}
                textColor={hasDiscomfort ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}
                tooltip="Número de atividades onde o paciente relatou desconforto ou dor"
            />
        </div>
    );
}
