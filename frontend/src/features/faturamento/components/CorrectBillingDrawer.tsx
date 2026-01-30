/**
 * ============================================================================
 * COMPONENTE: CorrectBillingDrawer
 * ============================================================================
 * 
 * Modal lateral (drawer) para correção e reenvio de lançamentos de faturamento.
 * 
 * FEATURES:
 * - Abre lateralmente à direita
 * - Header com título dinâmico e botão de voltar
 * - Formulário de edição de faturamento com TODOS os tipos de atividade
 * - Validação antes de enviar
 * - Feedback de sucesso/erro
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { X, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { BillingCorrectionForm, type DadosFaturamentoCorrecao } from './BillingCorrectionForm';
import { cn } from '@/lib/utils';
import type { BillingLancamento } from '../types/billingCorrection';
import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';
import { validarDadosFaturamento } from '@/features/programas/core/types/billing';

// ============================================
// TIPOS
// ============================================

export interface CorrectBillingDrawerProps {
    /** Se o drawer está aberto */
    isOpen: boolean;
    
    /** Callback ao fechar */
    onClose: () => void;
    
    /** Lançamento sendo corrigido */
    lancamento: BillingLancamento | null;
    
    /** Dados iniciais de faturamento */
    initialBillingData: DadosFaturamentoSessao | null;
    
    /** Callback ao salvar com sucesso */
    onSave: (lancamentoId: string, dadosCorrigidos: DadosFaturamentoSessao, comentario?: string) => Promise<void>;
    
    /** Se está salvando */
    isSaving?: boolean;
}

// ============================================
// HELPER: Converter para DadosFaturamentoCorrecao
// ============================================

function toBillingCorrecao(data: DadosFaturamentoSessao | null, lancamento: BillingLancamento | null): DadosFaturamentoCorrecao | null {
    if (!data) return null;
    
    // Determinar o tipoAtividade baseado no lancamento ou no tipoAtendimento
    let tipoAtividade = data.tipoAtendimento || 'consultorio';
    
    // Se o lancamento tem tipo, usar ele
    if (lancamento?.tipo) {
        const tipoLower = lancamento.tipo.toLowerCase();
        if (tipoLower === 'homecare') tipoAtividade = 'homecare';
        else if (tipoLower === 'consultorio' || tipoLower === 'consultório') tipoAtividade = 'consultorio';
        else if (tipoLower.includes('reunião') || tipoLower.includes('reuniao') || tipoLower === 'de reuniões') tipoAtividade = 'reuniao';
        else if (tipoLower.includes('supervisão recebida') || tipoLower.includes('supervisao_recebida')) tipoAtividade = 'supervisao_recebida';
        else if (tipoLower.includes('supervisão dada') || tipoLower.includes('supervisao_dada')) tipoAtividade = 'supervisao_dada';
        else if (tipoLower.includes('material') || tipoLower.includes('desenvolvimento')) tipoAtividade = 'desenvolvimento_materiais';
    }
    
    return {
        ...data,
        tipoAtividade: tipoAtividade as any,
    };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function CorrectBillingDrawer({
    isOpen,
    onClose,
    lancamento,
    initialBillingData,
    onSave,
    isSaving = false,
}: CorrectBillingDrawerProps) {
    const [billingData, setBillingData] = useState<DadosFaturamentoCorrecao | null>(
        toBillingCorrecao(initialBillingData, lancamento)
    );
    const [comentario, setComentario] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Atualizar dados quando mudar o lançamento
    useEffect(() => {
        if (initialBillingData) {
            setBillingData(toBillingCorrecao(initialBillingData, lancamento));
            setComentario('');
            setErrors({});
            setShowSuccess(false);
        }
    }, [initialBillingData, lancamento]);

    // Fechar drawer
    const handleClose = () => {
        if (!isSaving) {
            onClose();
        }
    };

    // Validar e salvar
    const handleSave = async () => {
        if (!billingData || !lancamento) return;

        // Validar dados
        const validation = validarDadosFaturamento(billingData);
        
        if (!validation.valido) {
            setErrors(validation.erros);
            return;
        }

        setErrors({});

        try {
            await onSave(lancamento.id, billingData, comentario);
            
            // Mostrar mensagem de sucesso
            setShowSuccess(true);
            
            // Fechar drawer após 2 segundos
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            // Erro será tratado pelo componente pai
            console.error('Erro ao salvar correção:', error);
        }
    };

    // Se não está aberto, não renderizar nada
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed right-0 top-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-background z-50",
                    "shadow-2xl transform transition-transform duration-300 ease-in-out",
                    "flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold">Corrigir Faturamento</h2>
                            {lancamento && (
                                <p className="text-sm text-muted-foreground">
                                    {lancamento.clienteNome} • {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        disabled={isSaving}
                        className="h-8 w-8"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Motivo da Rejeição */}
                    {lancamento?.motivoRejeicao && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Motivo da rejeição:</strong>
                                <p className="mt-1">{lancamento.motivoRejeicao}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Mensagem de Sucesso */}
                    {showSuccess && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Faturamento corrigido e reenviado com sucesso!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Caixa cinza claro com conteúdo */}
                    <div className="bg-muted/30 rounded-lg p-6 space-y-6">
                        {/* Formulário de Faturamento com TODOS os tipos de atividade */}
                        {billingData && (
                            <BillingCorrectionForm
                                value={billingData}
                                onChange={setBillingData}
                                errors={errors}
                                disabled={isSaving || showSuccess}
                                title="Dados de Faturamento"
                                defaultExpanded={true}
                            />
                        )}

                        {/* Comentário sobre a correção (opcional) */}
                        <div className="space-y-2">
                            <label htmlFor="comentario" className="text-sm font-medium">
                                Comentário sobre a correção (opcional)
                            </label>
                            <Textarea
                                id="comentario"
                                placeholder="Descreva as correções realizadas..."
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                disabled={isSaving || showSuccess}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSaving || showSuccess}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || showSuccess || !billingData}
                        className="min-w-[120px]"
                    >
                        {isSaving ? 'Salvando...' : 'Reenviar'}
                    </Button>
                </div>
            </div>
        </>
    );
}

export default CorrectBillingDrawer;
