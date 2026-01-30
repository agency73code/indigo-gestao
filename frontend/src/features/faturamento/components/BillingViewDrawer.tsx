/**
 * BillingViewDrawer
 * 
 * Drawer para visualizar detalhes de um lançamento de faturamento.
 * Usado tanto pelo terapeuta quanto pelo gerente.
 * 
 * Features:
 * - Exibe dados completos do faturamento
 * - Mostra motivo de rejeição (se houver)
 * - Permite corrigir (apenas terapeuta, se rejeitado)
 * - Download de comprovantes
 */

import {
    AlertCircle,
    Download,
    Edit,
    ExternalLink,
    FileText,
    Wallet,
    Image as ImageIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet';
import { CloseButton } from '@/components/layout/CloseButton';
import { cn } from '@/lib/utils';

import type { ItemFaturamento } from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    STATUS_FATURAMENTO_LABELS,
    STATUS_FATURAMENTO_COLORS,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_COLORS,
} from '../types/faturamento.types';

// ============================================
// TIPOS
// ============================================

export interface BillingViewDrawerProps {
    /** Se o drawer está aberto */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
    /** Item de faturamento a ser exibido */
    item: ItemFaturamento | null;
    /** Modo de visualização */
    mode?: 'terapeuta' | 'gerente';
    /** Callback para corrigir (apenas terapeuta, se rejeitado) */
    onCorrect?: (item: ItemFaturamento) => void;
}

// ============================================
// HELPERS
// ============================================

function formatarData(dataStr: string): string {
    const [year, month, day] = dataStr.split('-');
    return `${day}/${month}/${year}`;
}

function formatarDuracao(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================
// COMPONENTES INTERNOS
// ============================================

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

function DetailRow({ label, value, className }: DetailRowProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
            </span>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function BillingViewDrawer({
    open,
    onClose,
    item,
    mode = 'terapeuta',
    onCorrect,
}: BillingViewDrawerProps) {
    if (!item) return null;

    const isRejeitado = item.status === STATUS_FATURAMENTO.REJEITADO;
    const canCorrect = mode === 'terapeuta' && isRejeitado && onCorrect;
    const temAjudaCusto = item.temAjudaCusto;
    const temComprovantes = item.comprovantesAjudaCusto && item.comprovantesAjudaCusto.length > 0;
    const faturamento = item.faturamento;

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="right" className="w-[50vw] max-w-[600px] p-0 flex flex-col gap-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 bg-background shrink-0">
                    <div className="flex items-center gap-4">
                        <CloseButton onClick={onClose} />
                        <div>
                            <SheetTitle 
                                className="text-lg font-medium"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                Dados de Faturamento
                            </SheetTitle>
                            <p className="text-sm text-muted-foreground">
                                {item.clienteNome || 'Sem cliente'} • {formatarData(item.data)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Botão Corrigir (apenas terapeuta + rejeitado) */}
                    {canCorrect && (
                        <Button
                            onClick={() => onCorrect(item)}
                            size="sm"
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Corrigir
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 min-h-0 p-2 gap-2 bg-background">
                    <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                            
                            {/* Motivo da Rejeição */}
                            {isRejeitado && item.motivoRejeicao && (
                                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                                                Motivo da rejeição:
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-300">
                                                {item.motivoRejeicao}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dados de Faturamento */}
                            <div>
                                <h3 className="text-sm font-medium mb-4">Dados de Faturamento</h3>
                                
                                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border bg-card">
                                    <DetailRow 
                                        label="Data da Sessão"
                                        value={formatarData(faturamento?.dataSessao || item.data)}
                                    />
                                    <DetailRow 
                                        label="Horário de Início"
                                        value={faturamento?.horarioInicio || item.horarioInicio}
                                    />
                                    <DetailRow 
                                        label="Horário de Fim"
                                        value={faturamento?.horarioFim || item.horarioFim}
                                    />
                                </div>

                                <div className="mt-4 p-4 rounded-lg border bg-card">
                                    <DetailRow 
                                        label="Tipo de Atendimento"
                                        value={
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs",
                                                    TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.bg,
                                                    TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.text,
                                                    TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.border
                                                )}
                                            >
                                                {TIPO_ATIVIDADE_FATURAMENTO_LABELS[item.tipoAtividade] || 
                                                    (faturamento?.tipoAtendimento === 'homecare' ? 'Homecare' : 'Consultório')}
                                            </Badge>
                                        }
                                    />
                                </div>
                            </div>

                            {/* Observações de Faturamento */}
                            {(faturamento?.observacaoFaturamento || item.finalidade) && (
                                <div>
                                    <h3 className="text-sm font-medium mb-3">Observações de Faturamento</h3>
                                    <div className="p-4 rounded-lg border bg-card">
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {faturamento?.observacaoFaturamento || item.finalidade}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Comprovantes de Faturamento */}
                            {(faturamento?.arquivosFaturamento && faturamento.arquivosFaturamento.length > 0) && (
                                <div>
                                    <h3 className="text-sm font-medium mb-3">Comprovantes de Faturamento</h3>
                                    <div className="space-y-2">
                                        {faturamento.arquivosFaturamento.map((arquivo, index) => {
                                            const isImage = arquivo.tipo?.startsWith('image/');
                                            return (
                                                <a
                                                    key={arquivo.id || index}
                                                    href={arquivo.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center h-10 w-10 rounded-lg",
                                                        isImage ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20"
                                                    )}>
                                                        {isImage ? (
                                                            <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        ) : (
                                                            <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{arquivo.nome}</p>
                                                        {arquivo.tamanho && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {(arquivo.tamanho / 1024).toFixed(1)} KB
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Seção Ajuda de Custo */}
                            {temAjudaCusto && (
                                <div>
                                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Wallet className="h-4 w-4" />
                                        Ajuda de Custo
                                    </h3>
                                    <div className="rounded-lg border bg-card p-4 space-y-4">
                                        {item.motivoAjudaCusto && (
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    Descrição dos gastos
                                                </span>
                                                <p className="text-sm mt-1">{item.motivoAjudaCusto}</p>
                                            </div>
                                        )}

                                        {item.valorAjudaCusto && (
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    Valor aprovado
                                                </span>
                                                <p className="text-sm font-medium text-primary mt-1">
                                                    {formatarValor(item.valorAjudaCusto)}
                                                </p>
                                            </div>
                                        )}

                                        {temComprovantes && (
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    Comprovantes
                                                </span>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {item.comprovantesAjudaCusto!.map((arquivo) => {
                                                        const isImage = arquivo.tipo.startsWith('image/');
                                                        return (
                                                            <a
                                                                key={arquivo.id}
                                                                href={arquivo.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/50 transition-colors text-sm group"
                                                            >
                                                                <div className={cn(
                                                                    "flex items-center justify-center h-6 w-6 rounded",
                                                                    isImage ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20"
                                                                )}>
                                                                    {isImage ? (
                                                                        <ImageIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                                    ) : (
                                                                        <FileText className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                                                    )}
                                                                </div>
                                                                <span className="truncate max-w-[120px]">{arquivo.nome}</span>
                                                                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Valores */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Valores</h3>
                                <div className="rounded-lg border bg-card p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Duração</span>
                                        <span className="text-sm font-medium">{formatarDuracao(item.duracaoMinutos)}</span>
                                    </div>
                                    {item.valorHora && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Valor/hora</span>
                                            <span className="text-sm font-medium">{formatarValor(item.valorHora)}</span>
                                        </div>
                                    )}
                                    {item.valorAjudaCusto && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Ajuda de custo</span>
                                            <span className="text-sm font-medium">{formatarValor(item.valorAjudaCusto)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total</span>
                                        <span className="text-lg font-semibold text-primary">
                                            {formatarValor((item.valorTotal || 0) + (item.valorAjudaCusto || 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge
                                    className={cn(
                                        "text-xs",
                                        STATUS_FATURAMENTO_COLORS[item.status].bg,
                                        STATUS_FATURAMENTO_COLORS[item.status].text
                                    )}
                                >
                                    {STATUS_FATURAMENTO_LABELS[item.status]}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default BillingViewDrawer;
