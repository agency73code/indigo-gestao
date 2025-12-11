import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    CircleHelp,
    TrendingUp,
    Target,
    BarChart3
} from 'lucide-react';

type StatusKind = 'verde' | 'laranja' | 'vermelho';

export interface FonoSessionSummaryProps {
    counts: {
        erro: number;
        ajuda: number;
        indep: number;
    };
    plannedStimuli: number;
    workedStimuli: number;
    status: StatusKind;
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

function getStatusConfig(status: StatusKind) {
    switch (status) {
        case 'verde':
            return {
                label: 'Desempenhou',
                bgColor: 'bg-[#D1FAE5]',
                iconColor: 'text-emerald-600',
                textColor: 'text-emerald-700 dark:text-emerald-400',
                icon: CheckCircle,
            };
        case 'laranja':
            return {
                label: 'Com Ajuda',
                bgColor: 'bg-[#FEF3C7]',
                iconColor: 'text-amber-600',
                textColor: 'text-amber-700 dark:text-amber-400',
                icon: HandHelping,
            };
        case 'vermelho':
            return {
                label: 'Não Desempenhou',
                bgColor: 'bg-[#FEE2E2]',
                iconColor: 'text-rose-600',
                textColor: 'text-rose-700 dark:text-rose-400',
                icon: XCircle,
            };
    }
}

export default function FonoSessionSummary({
    counts,
    plannedStimuli,
    workedStimuli,
    status,
}: FonoSessionSummaryProps) {
    const statusConfig = getStatusConfig(status);
    const totalTentativas = counts.erro + counts.ajuda + counts.indep;
    
    // Calcular percentuais
    const pctIndep = totalTentativas > 0 ? Math.round((counts.indep / totalTentativas) * 100) : 0;
    const pctAjuda = totalTentativas > 0 ? Math.round((counts.ajuda / totalTentativas) * 100) : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status Geral - Card destacado */}
            <KpiCard
                title="Status Geral"
                value={statusConfig.label}
                hint={`Maioria: ${status === 'verde' ? 'independente' : status === 'laranja' ? 'com ajuda' : 'sem desempenho'}`}
                icon={statusConfig.icon}
                bgColor={statusConfig.bgColor}
                iconColor={statusConfig.iconColor}
                textColor={statusConfig.textColor}
                tooltip="Status predominante da sessão, baseado no resultado com maior frequência"
                highlighted
            />

            {/* Estímulos */}
            <KpiCard
                title="Estímulos"
                value={`${workedStimuli}/${plannedStimuli}`}
                hint="Trabalhados"
                icon={TrendingUp}
                bgColor="bg-[#E0F2FE]"
                iconColor="text-sky-600"
                textColor="text-sky-700 dark:text-sky-400"
                tooltip="Estímulos trabalhados em relação ao total planejado para o programa"
            />

            {/* Total de Tentativas */}
            <KpiCard
                title="Tentativas"
                value={totalTentativas}
                hint={`${counts.indep} indep • ${counts.ajuda} ajuda • ${counts.erro} erro`}
                icon={BarChart3}
                bgColor="bg-[#EDE9FE]"
                iconColor="text-violet-600"
                textColor="text-violet-700 dark:text-violet-400"
                tooltip="Total de tentativas registradas na sessão e distribuição por resultado"
            />

            {/* Taxa de Sucesso */}
            <KpiCard
                title="Taxa de Sucesso"
                value={`${pctIndep}%`}
                hint={`${pctAjuda}% com ajuda`}
                icon={Target}
                bgColor="bg-[#FCE7F3]"
                iconColor="text-pink-600"
                textColor="text-pink-700 dark:text-pink-400"
                tooltip="Percentual de tentativas com resposta independente"
            />
        </div>
    );
}
