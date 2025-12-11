import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Users,
    HeartHandshake,
    CircleHelp,
    TrendingUp
} from 'lucide-react';

type StatusKind = 'verde' | 'laranja' | 'vermelho';

export interface MusiSessionSummaryProps {
    counts: {
        erro: number;
        ajuda: number;
        indep: number;
    };
    plannedActivities: number;
    workedActivities: number;
    avgParticipacao: number | null;
    avgSuporte: number | null;
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

function formatParticipacao(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Percebe, mas não participa',
        2: 'Tenta, não consegue',
        3: 'Não como esperado',
        4: 'Conforme esperado',
        5: 'Supera expectativas',
    };
    
    const rounded = Math.round(value);
    return labels[rounded] || value.toFixed(1);
}

function formatSuporte(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Visual',
        4: 'Parcial físico',
        5: 'Total físico',
    };
    
    const rounded = Math.round(value);
    return labels[rounded] || value.toFixed(1);
}

export default function MusiSessionSummary({
    plannedActivities,
    workedActivities,
    avgParticipacao,
    avgSuporte,
    status,
}: MusiSessionSummaryProps) {
    const statusConfig = getStatusConfig(status);

    const participacaoHint = avgParticipacao !== null 
        ? `Média: ${avgParticipacao.toFixed(1)}/5` 
        : 'Não registrado';
    
    const suporteHint = avgSuporte !== null 
        ? `Média: ${avgSuporte.toFixed(1)}/5` 
        : 'Não registrado';

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

            {/* Atividades */}
            <KpiCard
                title="Atividades"
                value={`${workedActivities}/${plannedActivities}`}
                hint="Trabalhadas"
                icon={TrendingUp}
                bgColor="bg-[#E0F2FE]"
                iconColor="text-sky-600"
                textColor="text-sky-700 dark:text-sky-400"
                tooltip="Atividades trabalhadas em relação ao total planejado para o programa"
            />

            {/* Participação */}
            <KpiCard
                title="Participação"
                value={formatParticipacao(avgParticipacao)}
                hint={participacaoHint}
                icon={Users}
                bgColor="bg-[#EDE9FE]"
                iconColor="text-violet-600"
                textColor="text-violet-700 dark:text-violet-400"
                tooltip="Nível médio de participação do cliente na sessão. 0 = Não participa, 5 = Supera expectativas"
            />

            {/* Suporte Necessário */}
            <KpiCard
                title="Suporte Necessário"
                value={formatSuporte(avgSuporte)}
                hint={suporteHint}
                icon={HeartHandshake}
                bgColor="bg-[#FCE7F3]"
                iconColor="text-pink-600"
                textColor="text-pink-700 dark:text-pink-400"
                tooltip="Nível médio de suporte necessário. 1 = Sem suporte, 5 = Máximo físico"
            />
        </div>
    );
}
