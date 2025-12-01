import {
    Calendar,
    User,
    Eye,
    CheckCircle,
    MinusCircle,
    AlertCircle,
    Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Sessao } from '../types';
import { resumirSessao } from '../services';

interface ListaSessoesProps {
    sessoes: Sessao[];
    onVerDetalhes: (sessaoId: string) => void;
}

type StatusKind = 'insuficiente' | 'positivo' | 'mediano' | 'atencao';

function calcStatus(independencia: number, totalTentativas: number): StatusKind {
    if (totalTentativas < 5) {
        return 'insuficiente';
    }
    if (independencia > 80) {
        return 'positivo';
    }
    if (independencia > 60) {
        return 'mediano';
    }
    return 'atencao';
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
            icon: AlertCircle,
            label: 'Atenção',
            cls: 'border-orange-500/40 text-orange-700 bg-orange-50',
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
            <Card 
                padding="hub"
                className="rounded-lg border-0 shadow-none"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <CardHeader>
                    <CardTitleHub className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Sessões recentes
                    </CardTitleHub>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        Nenhuma sessão encontrada.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            <TooltipProvider>
                {sessoes.map((sessao) => {
                    const resumo = resumirSessao(sessao);
                    const statusKind = calcStatus(resumo.independencia, resumo.tentativas);
                    const statusConfig = getStatusConfig(statusKind);
                    const StatusIcon = statusConfig.icon;
                    const independenciaFormatada = Math.round(resumo.independencia);

                    return (
                        <Card
                            key={sessao.id}
                            padding="hub"
                            className="cursor-pointer hover:shadow-md transition-shadow rounded-lg border-0 shadow-none"
                            style={{ backgroundColor: 'var(--hub-card-background)' }}
                            onClick={() => onVerDetalhes(sessao.id)}
                            aria-label={`Ver detalhes da sessão de ${formatDate(sessao.data)}`}
                        >
                            <CardHeader className="space-y-3 pb-3">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <CardTitleHub className="text-base mb-1">
                                            {formatDate(sessao.data)}
                                        </CardTitleHub>
                                        <p className="text-sm text-muted-foreground">
                                            {formatPercentage(resumo.acerto)} acerto
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onVerDetalhes(sessao.id);
                                        }}
                                        aria-label="Ver detalhes"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-0">
                                {/* Programa */}
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Programa:
                                    </p>
                                    <p className="text-sm font-regular text-foreground line-clamp-1">
                                        {sessao.programa}
                                    </p>
                                </div>

                                {/* Objetivo */}
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Objetivo:
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {sessao.objetivo}
                                    </p>
                                </div>

                                <Separator className="my-3" />

                                {/* Footer com terapeuta e status */}
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="line-clamp-1">{sessao.terapeutaNome}</span>
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
                            </CardContent>
                        </Card>
                    );
                })}
            </TooltipProvider>
        </div>
    );
}
