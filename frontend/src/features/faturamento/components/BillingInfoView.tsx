/**
 * ============================================================================
 * COMPONENTE: BillingInfoView
 * ============================================================================
 * 
 * Componente para visualização de informações de faturamento usando
 * o padrão do ReadOnlyField da consulta de terapeutas.
 * 
 * ============================================================================
 */

import { FileText, Download } from 'lucide-react';
import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';
import { TIPO_ATENDIMENTO_LABELS } from '@/features/programas/core/types/billing';
import ReadOnlyField from '@/features/consultas/components/ReadOnlyField';

interface BillingInfoViewProps {
    billing: DadosFaturamentoSessao;
    title?: string;
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

export function BillingInfoView({ billing, title = 'Dados de Faturamento' }: BillingInfoViewProps) {
    const tipoLabel = TIPO_ATENDIMENTO_LABELS[billing.tipoAtendimento];
    const ajudaCustoFormatada = billing.ajudaCusto 
        ? Number(billing.ajudaCusto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : undefined;

    return (
        <div className="space-y-6">
            {/* Título com fonte Sora */}
            <h4 className="text-md font-regular mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                {title}
            </h4>

            {/* Linha 1: Data, Horário Início, Horário Fim */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReadOnlyField
                    label="Data da Sessão *"
                    value={formatarData(billing.dataSessao)}
                />
                <ReadOnlyField
                    label="Horário de Início *"
                    value={billing.horarioInicio}
                />
                <ReadOnlyField
                    label="Horário de Fim *"
                    value={billing.horarioFim}
                />
            </div>

            {/* Linha 2: Tipo de Atendimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField
                    label="Tipo de Atendimento *"
                    value={tipoLabel}
                />
            </div>

            {/* Linha 3: Ajuda de Custo (se houver) */}
            {billing.ajudaCusto && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField
                        label="Ajuda de Custo"
                        value={ajudaCustoFormatada}
                    />
                </div>
            )}

            {/* Observações (se houver) - Padrão ReadOnlyField mas mais alto */}
            {billing.observacaoFaturamento && (
                <div className="space-y-2">
                    <div className="px-4 py-2 border border-input bg-background rounded-lg space-y-1 min-h-[120px]">
                        <label className="text-xs font-medium text-muted-foreground">
                            Observações de Faturamento
                        </label>
                        <div className="text-sm text-foreground whitespace-pre-wrap pt-1">
                            {billing.observacaoFaturamento}
                        </div>
                    </div>
                </div>
            )}

            {/* Arquivos (se houver) - Mesmo padrão ReadOnlyField */}
            {billing.arquivosFaturamento && billing.arquivosFaturamento.length > 0 && (
                <div className="space-y-2">
                    <label className="text-md font-regular" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Comprovantes de Faturamento
                    </label>
                    <div className="space-y-2 mt-3">
                        {billing.arquivosFaturamento.map((arquivo, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 border border-input bg-background rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{arquivo.nome}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {arquivo.tamanho 
                                                ? `${(arquivo.tamanho / 1024).toFixed(1)} KB`
                                                : 'Tamanho desconhecido'
                                            }
                                        </p>
                                    </div>
                                    {arquivo.url && (
                                        <button
                                            onClick={() => window.open(arquivo.url, '_blank')}
                                            className="group h-10 w-10 rounded-full bg-header-bg hover:bg-header-bg/80 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0"
                                            aria-label="Baixar arquivo"
                                            title="Baixar arquivo"
                                        >
                                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BillingInfoView;
