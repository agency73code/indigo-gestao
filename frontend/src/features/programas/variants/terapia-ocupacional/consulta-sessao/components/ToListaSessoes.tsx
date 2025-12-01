import {
    Calendar,
    User,
    Eye,
    CheckCircle,
    MinusCircle,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Sessao } from '@/features/programas/consulta-sessao/types';
import { resumirSessao } from '@/features/programas/consulta-sessao/services';

interface ToListaSessoesProps {
    sessoes: Sessao[];
    onVerDetalhes: (sessaoId: string) => void;
}

type StatusKind = 'verde' | 'laranja' | 'vermelho';

// Mesma lógica de predominância que usamos no ToAttemptsRegister
function calcToStatus(desempenhou: number, ajuda: number, naoDesempenhou: number): StatusKind {
    const max = Math.max(desempenhou, ajuda, naoDesempenhou);
    
    if (desempenhou === max) return 'verde';
    if (ajuda === max) return 'laranja';
    return 'vermelho';
}

function getStatusConfig(kind: StatusKind) {
    const configs = {
        verde: {
            icon: CheckCircle,
            label: 'Desempenhou',
            cls: 'text-green-700 bg-green-100 hover:bg-green-200 border-0',
        },
        laranja: {
            icon: MinusCircle,
            label: 'Desempenhou com Ajuda',
            cls: 'text-amber-700 bg-amber-100 hover:bg-amber-200 border-0',
        },
        vermelho: {
            icon: AlertCircle,
            label: 'Não Desempenhou',
            cls: 'text-red-700 bg-red-100 hover:bg-red-200 border-0',
        },
    };
    return configs[kind];
}

export default function ToListaSessoes({ sessoes, onVerDetalhes }: ToListaSessoesProps) {
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
                    
                    // Calcular contadores TO baseados nos dados da sessão
                    // TODO: Quando tiver os dados reais de TO, adaptar aqui
                    const desempenhou = resumo.tentativas > 0 ? Math.round(resumo.independencia / 100 * resumo.tentativas) : 0;
                    const naoDesempenhou = Math.round((100 - resumo.independencia) / 100 * resumo.tentativas);
                    const ajuda = 0; // TODO: Pegar do backend quando tiver
                    
                    const statusKind = calcToStatus(desempenhou, ajuda, naoDesempenhou);
                    const statusConfig = getStatusConfig(statusKind);
                    const StatusIcon = statusConfig.icon;

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
                                        <CardTitleHub className="text-base">
                                            {formatDate(sessao.data)}
                                        </CardTitleHub>
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
                                    <p className="text-sm font-normal text-foreground line-clamp-1">
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
                                                variant="secondary"
                                                className={`gap-1.5 px-3 py-1 ${statusConfig.cls}`}
                                            >
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium whitespace-nowrap">
                                                    {statusConfig.label}
                                                </span>
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[220px] text-xs">
                                            Status predominante baseado no tipo de desempenho mais frequente nesta sessão.
                                            Verde: desempenhou, Laranja: desempenhou com ajuda, Vermelho: não desempenhou.
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
