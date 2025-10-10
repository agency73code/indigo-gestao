import {
    Calendar,
    User,
    Eye,
    CheckCircle,
    MinusCircle,
    AlertTriangle,
    XCircle,
    Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Sessao } from '../types';
import { resumirSessao } from '../services';

interface ListaSessoesProps {
    sessoes: Sessao[];
    onVerDetalhes: (sessaoId: string) => void;
}

type StatusKind = 'insuficiente' | 'positivo' | 'mediano' | 'atencao' | 'critico';

function calcStatus(independencia: number, totalTentativas: number): StatusKind {
    if (totalTentativas < 5) {
        return 'insuficiente';
    }
    if (independencia >= 80) {
        return 'positivo';
    }
    if (independencia >= 60) {
        return 'mediano';
    }
    if (independencia >= 40) {
        return 'atencao';
    }
    return 'critico';
}

function getStatusConfig(kind: StatusKind) {
    const configs = {
        insuficiente: {
            icon: Info,
            label: 'Coleta insuficiente',
            cls: 'border-muted text-muted-foreground bg-muted/40',
        },
        positivo: {
            icon: CheckCircle,
            label: 'Positivo',
            cls: 'border-green-500/40 text-green-700 bg-green-50',
        },
        mediano: {
            icon: MinusCircle,
            label: 'Mediano',
            cls: 'border-amber-500/40 text-amber-700 bg-amber-50',
        },
        atencao: {
            icon: AlertTriangle,
            label: 'Atenção',
            cls: 'border-orange-500/40 text-orange-700 bg-orange-50',
        },
        critico: {
            icon: XCircle,
            label: 'Crítico',
            cls: 'border-red-500/40 text-red-700 bg-red-50',
        },
    };
    return configs[kind];
}

export default function ListaSessoes({ sessoes, onVerDetalhes }: ListaSessoesProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatPercentage = (value?: number | null) => {
        if (value === null || value === undefined) return 'â€”';
        return `${Math.round(value)}%`;
    };

    if (sessoes.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Sessões
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        Nenhuma sessão encontrada.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-6 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Sessões recentes
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <TooltipProvider>
                    <div className="space-y-3">
                        {sessoes.map((sessao) => {
                            const resumo = resumirSessao(sessao);
                            const statusKind = calcStatus(resumo.independencia, resumo.tentativas);
                            const statusConfig = getStatusConfig(statusKind);
                            const StatusIcon = statusConfig.icon;
                            const independenciaFormatada = Math.round(resumo.independencia);

                            return (
                                <div
                                    key={sessao.id}
                                    className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                {formatDate(sessao.data)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatPercentage(resumo.acerto)} acerto
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                Programa:{' '}
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {sessao.programa}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                Objetivo:{' '}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {sessao.objetivo}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <User className="h-3.5 w-3.5" />
                                                <span>{sessao.terapeutaNome}</span>
                                            </div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge
                                                        variant="outline"
                                                        className={`gap-1 px-2 py-1 rounded-[5px] ${statusConfig.cls}`}
                                                    >
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        <span className="text-xs whitespace-nowrap">
                                                            {statusKind === 'insuficiente'
                                                                ? statusConfig.label
                                                                : `${statusConfig.label} - ${independenciaFormatada}%`}
                                                        </span>
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[220px] text-xs">
                                                    Percentual de respostas independentes nesta
                                                    sessão. Cálculo: INDEP / TOTAL.
                                                    {statusKind !== 'insuficiente' &&
                                                        ` (${independenciaFormatada}% de ${resumo.tentativas} tentativas)`}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 ml-3 shrink-0"
                                        onClick={() => onVerDetalhes(sessao.id)}
                                        aria-label="Ver sessão"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
