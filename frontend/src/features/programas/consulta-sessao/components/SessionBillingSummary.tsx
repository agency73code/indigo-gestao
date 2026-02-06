/**
 * ============================================================================
 * COMPONENTE: SessionBillingSummary
 * ============================================================================
 * 
 * Componente para exibir um resumo compacto dos dados de faturamento
 * de uma sessão. Ideal para listas de sessões ou cards de resumo.
 * 
 * INFORMAÇÕES EXIBIDAS:
 * - Tipo de atendimento (Consultório/Homecare) com ícone
 * - Duração da sessão (calculada)
 * - Ajuda de custo (se aplicável para homecare)
 * - Badge indicativo de status
 * 
 * ============================================================================
 */

import { Building2, Home, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { 
    DadosFaturamentoSessao
} from '@/features/programas/core/types/billing';
import { 
    TIPO_ATENDIMENTO, 
    TIPO_ATENDIMENTO_LABELS 
} from '@/features/programas/core/types/billing';

interface SessionBillingSummaryProps {
    /** Dados de faturamento da sessão */
    billing?: DadosFaturamentoSessao | null;
    /** Tamanho do componente */
    size?: 'sm' | 'md' | 'lg';
    /** Orientação do layout */
    orientation?: 'horizontal' | 'vertical';
    /** Classe CSS adicional */
    className?: string;
    /** Se deve mostrar apenas o tipo de atendimento */
    compact?: boolean;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula a duração entre horário de início e fim
 */
function calcularDuracao(horarioInicio: string, horarioFim: string): number | null {
    if (!horarioInicio || !horarioFim) return null;

    try {
        const [inicioH, inicioM] = horarioInicio.split(':').map(Number);
        const [fimH, fimM] = horarioFim.split(':').map(Number);

        const inicioMinutos = inicioH * 60 + inicioM;
        const fimMinutos = fimH * 60 + fimM;

        const duracao = fimMinutos - inicioMinutos;
        return duracao > 0 ? duracao : null;
    } catch {
        return null;
    }
}

/**
 * Formata duração em minutos para string legível
 */
function formatarDuracao(duracaoMinutos: number): string {
    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;

    if (horas > 0 && minutos > 0) {
        return `${horas}h ${minutos}min`;
    } else if (horas > 0) {
        return `${horas}h`;
    } else {
        return `${minutos}min`;
    }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SessionBillingSummary({
    billing,
    size = 'md',
    orientation = 'horizontal',
    className,
    compact = false
}: SessionBillingSummaryProps) {
    // Se não há dados de faturamento, retorna null
    if (!billing) {
        return null;
    }

    const isHomecare = billing.tipoAtendimento === TIPO_ATENDIMENTO.HOMECARE;
    const duracao = calcularDuracao(billing.horarioInicio, billing.horarioFim);
    
    // Classes baseadas no tamanho
    const sizeClasses = {
        sm: {
            container: 'gap-1',
            icon: 'h-3 w-3',
            text: 'text-xs',
            badge: 'text-xs px-1.5 py-0.5'
        },
        md: {
            container: 'gap-2',
            icon: 'h-4 w-4',
            text: 'text-sm',
            badge: 'text-xs px-2 py-1'
        },
        lg: {
            container: 'gap-3',
            icon: 'h-5 w-5',
            text: 'text-sm',
            badge: 'text-sm px-2.5 py-1'
        }
    };

    const classes = sizeClasses[size];

    // Layout compacto - apenas tipo de atendimento
    if (compact) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    "flex items-center gap-1 w-fit",
                    classes.badge,
                    isHomecare 
                        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300",
                    className
                )}
            >
                {isHomecare ? (
                    <Home className={classes.icon} />
                ) : (
                    <Building2 className={classes.icon} />
                )}
                <span>{TIPO_ATENDIMENTO_LABELS[billing.tipoAtendimento]}</span>
            </Badge>
        );
    }

    // Layout completo
    const containerClass = cn(
        "flex items-center",
        classes.container,
        orientation === 'vertical' ? 'flex-col items-start' : 'flex-row',
        className
    );

    return (
        <div className={containerClass}>
            {/* Tipo de Atendimento */}
            <Badge
                variant="outline"
                className={cn(
                    "flex items-center gap-1 w-fit",
                    classes.badge,
                    isHomecare 
                        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300"
                )}
            >
                {isHomecare ? (
                    <Home className={classes.icon} />
                ) : (
                    <Building2 className={classes.icon} />
                )}
                <span>{TIPO_ATENDIMENTO_LABELS[billing.tipoAtendimento]}</span>
            </Badge>

            {/* Duração (se calculável) */}
            {duracao && duracao > 0 && (
                <div className={cn("flex items-center gap-1 text-muted-foreground", classes.text)}>
                    <Clock className={classes.icon} />
                    <span>{formatarDuracao(duracao)}</span>
                </div>
            )}

            {/* Ajuda de Custo (apenas para homecare quando true) */}
            {isHomecare && billing.ajudaCusto === true && (
                <Badge
                    variant="outline"
                    className={cn(
                        "flex items-center gap-1 w-fit",
                        classes.badge,
                        "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                    )}
                >
                    <DollarSign className={classes.icon} />
                    <span>Ajuda de Custo</span>
                </Badge>
            )}
        </div>
    );
}

/**
 * Variação compacta do componente para uso inline
 */
export function SessionBillingSummaryCompact(props: Omit<SessionBillingSummaryProps, 'compact'>) {
    return <SessionBillingSummary {...props} compact />;
}

/**
 * Variação vertical do componente para uso em cards
 */
export function SessionBillingSummaryVertical(props: Omit<SessionBillingSummaryProps, 'orientation'>) {
    return <SessionBillingSummary {...props} orientation="vertical" />;
}