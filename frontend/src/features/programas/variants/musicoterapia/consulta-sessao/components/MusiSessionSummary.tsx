import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    CheckCircle, 
    HandHelping, 
    XCircle, 
    Clock,
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
    totalDurationMinutes?: number;
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

function getStatusConfig(status: StatusKind) {
    switch (status) {
        case 'verde':
            return {
                label: 'Desempenhou',
                bgColor: 'bg-[#D1FAE5]',
                iconColor: 'text-green-600',
                textColor: 'text-green-700 dark:text-green-400',
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
                iconColor: 'text-red-600',
                textColor: 'text-red-700 dark:text-red-400',
                icon: XCircle,
            };
    }
}

function formatParticipacao(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        0: 'Não participa',
        1: 'Mínima',
        2: 'Parcial',
        3: 'Ativa',
        4: 'Muito ativa',
        5: 'Supera expect.',
    };
    
    const rounded = Math.round(value);
    return labels[rounded] || `${value.toFixed(1)}`;
}

function formatSuporte(value: number | null): string {
    if (value === null) return '—';
    
    const labels: Record<number, string> = {
        1: 'Sem suporte',
        2: 'Verbal',
        3: 'Gestual',
        4: 'Físico leve',
        5: 'Físico máximo',
    };
    
    const rounded = Math.round(value);
    return labels[rounded] || `${value.toFixed(1)}`;
}

function formatDuration(minutes?: number): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
}

export default function MusiSessionSummary({
    counts,
    plannedActivities,
    workedActivities,
    avgParticipacao,
    avgSuporte,
    status,
    totalDurationMinutes,
}: MusiSessionSummaryProps) {
    const statusConfig = getStatusConfig(status);
    const totalAttempts = counts.erro + counts.ajuda + counts.indep;

    return (
        <div className="space-y-4">
            {/* Grid principal de KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

                {/* Desempenhou */}
                <KpiCard
                    title="Desempenhou"
                    value={counts.indep}
                    hint="Realizou sozinho"
                    icon={CheckCircle}
                    bgColor="bg-[#D1FAE5]"
                    iconColor="text-green-600"
                    textColor="text-green-700 dark:text-green-400"
                    tooltip="Total de tentativas onde o cliente realizou a atividade de forma independente"
                />

                {/* Com Ajuda */}
                <KpiCard
                    title="Com Ajuda"
                    value={counts.ajuda}
                    hint="Precisou de suporte"
                    icon={HandHelping}
                    bgColor="bg-[#FEF3C7]"
                    iconColor="text-amber-600"
                    textColor="text-amber-700 dark:text-amber-400"
                    tooltip="Total de tentativas onde o cliente precisou de assistência para realizar"
                />

                {/* Não Desempenhou */}
                <KpiCard
                    title="Não Desempenhou"
                    value={counts.erro}
                    hint="Não conseguiu"
                    icon={XCircle}
                    bgColor="bg-[#FEE2E2]"
                    iconColor="text-red-600"
                    textColor="text-red-700 dark:text-red-400"
                    tooltip="Total de tentativas onde o cliente não conseguiu realizar a atividade"
                />

                {/* Tempo Total */}
                <KpiCard
                    title="Tempo"
                    value={formatDuration(totalDurationMinutes)}
                    hint="Duração total"
                    icon={Clock}
                    bgColor="bg-[#F3E8FF]"
                    iconColor="text-purple-600"
                    textColor="text-purple-700 dark:text-purple-400"
                    tooltip="Tempo total de duração da sessão"
                />
            </div>

            {/* Cards de Escalas - Participação e Suporte */}
            <div className="grid grid-cols-2 gap-4">
                <KpiCard
                    title="Participação"
                    value={formatParticipacao(avgParticipacao)}
                    hint={avgParticipacao !== null ? `Média: ${avgParticipacao.toFixed(1)}/5` : 'Não registrado'}
                    icon={Users}
                    bgColor="bg-[#EDE9FE]"
                    iconColor="text-violet-600"
                    textColor="text-violet-700 dark:text-violet-400"
                    tooltip="Nível médio de participação do cliente na sessão. 0 = Não participa, 5 = Supera expectativas"
                />

                <KpiCard
                    title="Suporte Necessário"
                    value={formatSuporte(avgSuporte)}
                    hint={avgSuporte !== null ? `Média: ${avgSuporte.toFixed(1)}/5` : 'Não registrado'}
                    icon={HeartHandshake}
                    bgColor="bg-[#FCE7F3]"
                    iconColor="text-pink-600"
                    textColor="text-pink-700 dark:text-pink-400"
                    tooltip="Nível médio de suporte necessário. 1 = Sem suporte, 5 = Máximo físico"
                />
            </div>

            {/* Resumo textual discreto */}
            <div className="text-center text-sm text-muted-foreground">
                Total de tentativas: <span className="font-medium">{totalAttempts}</span>
            </div>
        </div>
    );
}
