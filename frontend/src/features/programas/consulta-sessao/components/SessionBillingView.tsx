/**
 * ============================================================================
 * COMPONENTE: SessionBillingView
 * ============================================================================
 * 
 * Componente para visualização dos dados de faturamento de uma sessão.
 * Exibe as informações de forma clara e organizada para consulta.
 * 
 * DADOS EXIBIDOS:
 * - Data da sessão
 * - Horário de início e fim (com duração calculada)
 * - Tipo de atendimento (Consultório/Homecare)
 * - Ajuda de custo (se aplicável)
 * - Observações de faturamento
 * - Arquivos de comprovantes de faturamento
 * 
 * ============================================================================
 */

import { Building2, Home, Clock, DollarSign, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { 
    DadosFaturamentoSessao, 
    ArquivoFaturamento
} from '@/features/programas/core/types/billing';
import { 
    TIPO_ATENDIMENTO, 
    TIPO_ATENDIMENTO_LABELS 
} from '@/features/programas/core/types/billing';

interface SessionBillingViewProps {
    /** Dados de faturamento da sessão */
    billing?: DadosFaturamentoSessao | null;
    /** Título customizado da seção */
    title?: string;
    /** Classe CSS adicional */
    className?: string;
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

/**
 * Formata data para exibição
 */
function formatarData(dataISO: string): string {
    try {
        const data = new Date(dataISO + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch {
        return dataISO;
    }
}

/**
 * Formata horário para exibição
 */
function formatarHorario(horario: string): string {
    if (!horario) return '--:--';
    return horario;
}

/**
 * Obtém ícone do arquivo baseado no tipo
 */
function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) {
        return <FileText className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
}

/**
 * Formata tamanho do arquivo
 */
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ============================================
// COMPONENTES
// ============================================

interface BillingFileViewProps {
    arquivo: ArquivoFaturamento;
    onDownload?: (arquivo: ArquivoFaturamento) => void;
}

function BillingFileView({ arquivo, onDownload }: BillingFileViewProps) {
    const handleDownload = () => {
        if (onDownload) {
            onDownload(arquivo);
        } else if (arquivo.url) {
            window.open(arquivo.url, '_blank');
        }
    };

    return (
        <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-md">
                    {getFileIcon(arquivo.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{arquivo.nome}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(arquivo.tamanho)}
                    </p>
                </div>
            </div>
            {(arquivo.url || onDownload) && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={handleDownload}
                    aria-label="Baixar arquivo"
                >
                    <Download className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SessionBillingView({
    billing,
    title = 'Dados de Faturamento',
    className
}: SessionBillingViewProps) {
    // Se não há dados de faturamento, não renderiza nada
    if (!billing) {
        return null;
    }

    const duracao = calcularDuracao(billing.horarioInicio, billing.horarioFim);
    const isHomecare = billing.tipoAtendimento === TIPO_ATENDIMENTO.HOMECARE;

    return (
        <Card className={cn("rounded-[5px]", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                        <CardTitle className="text-base font-medium">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {TIPO_ATENDIMENTO_LABELS[billing.tipoAtendimento]}
                            {duracao && duracao > 0 && (
                                <span className="ml-2">• {formatarDuracao(duracao)}</span>
                            )}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
                {/* Data e Horários */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Data da Sessão</p>
                        <p className="text-sm font-medium">{formatarData(billing.dataSessao)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Horário de Início</p>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">{formatarHorario(billing.horarioInicio)}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Horário de Fim</p>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">{formatarHorario(billing.horarioFim)}</p>
                        </div>
                    </div>
                </div>

                {/* Duração calculada */}
                {duracao !== null && duracao > 0 && (
                    <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                        Duração da sessão: <span className="font-medium text-foreground">{formatarDuracao(duracao)}</span>
                    </div>
                )}

                {/* Tipo de Atendimento */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Tipo de Atendimento</p>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "flex items-center gap-2 w-fit",
                            isHomecare 
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300"
                        )}
                    >
                        {isHomecare ? (
                            <Home className="h-4 w-4" />
                        ) : (
                            <Building2 className="h-4 w-4" />
                        )}
                        <span>{TIPO_ATENDIMENTO_LABELS[billing.tipoAtendimento]}</span>
                    </Badge>
                </div>

                {/* Ajuda de Custo (somente para homecare) */}
                {isHomecare && billing.ajudaCusto !== null && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Ajuda de Custo</p>
                        <Badge 
                            variant="outline"
                            className={cn(
                                "w-fit",
                                billing.ajudaCusto 
                                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                                    : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300"
                            )}
                        >
                            {billing.ajudaCusto ? 'Sim' : 'Não'}
                        </Badge>
                    </div>
                )}

                {/* Observações de Faturamento */}
                {billing.observacaoFaturamento && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Observações de Faturamento</p>
                        <div className="p-3 bg-muted/30 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{billing.observacaoFaturamento}</p>
                        </div>
                    </div>
                )}

                {/* Arquivos de Comprovantes */}
                {billing.arquivosFaturamento && billing.arquivosFaturamento.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">
                            Comprovantes de Faturamento ({billing.arquivosFaturamento.length})
                        </p>
                        <div className="space-y-2">
                            {billing.arquivosFaturamento.map((arquivo) => (
                                <BillingFileView
                                    key={arquivo.id}
                                    arquivo={arquivo}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
