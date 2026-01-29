/**
 * ============================================================================
 * COMPONENTE: BillingDrawer
 * ============================================================================
 * 
 * Drawer unificado para visualização e edição de faturamento.
 * 
 * MODOS:
 * - 'view': Visualização dos dados (read-only)
 * - 'edit': Edição dos dados (formulário)
 * 
 * FLUXO:
 * 1. Abre em modo 'view'
 * 2. Se rejeitado, mostra botão "Corrigir"
 * 3. Ao clicar "Corrigir", muda para modo 'edit'
 * 4. No modo 'edit', tem botão "Reenviar"
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { BackButton } from '@/components/layout/BackButton';
import { BillingInfoView } from './BillingInfoView';
import { SessionBillingData } from '@/features/programas/nova-sessao/components/SessionBillingData';
import { cn } from '@/lib/utils';
import type { BillingLancamento } from '../types/billingCorrection';
import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';
import { validarDadosFaturamento } from '@/features/programas/core/types/billing';

// ============================================
// TIPOS
// ============================================

type DrawerMode = 'view' | 'edit';

export interface BillingDrawerProps {
    /** Se o drawer está aberto */
    isOpen: boolean;
    
    /** Callback ao fechar */
    onClose: () => void;
    
    /** Lançamento sendo visualizado/editado */
    lancamento: BillingLancamento | null;
    
    /** Dados iniciais de faturamento */
    initialBillingData: DadosFaturamentoSessao | null;
    
    /** Callback ao salvar com sucesso */
    onSave: (lancamentoId: string, dadosCorrigidos: DadosFaturamentoSessao, comentario?: string) => Promise<void>;
    
    /** Se está salvando */
    isSaving?: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function BillingDrawer({
    isOpen,
    onClose,
    lancamento,
    initialBillingData,
    onSave,
    isSaving = false,
}: BillingDrawerProps) {
    const [mode, setMode] = useState<DrawerMode>('view');
    const [billingData, setBillingData] = useState<DadosFaturamentoSessao | null>(initialBillingData);
    const [comentario, setComentario] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Resetar ao abrir/mudar lançamento
    useEffect(() => {
        if (isOpen && initialBillingData) {
            setMode('view');
            setBillingData(initialBillingData);
            setComentario('');
            setErrors({});
            setShowSuccess(false);
        }
    }, [isOpen, initialBillingData, lancamento]);

    // Fechar drawer
    const handleClose = () => {
        if (!isSaving) {
            setMode('view');
            onClose();
        }
    };

    // Mudar para modo de edição
    const handleEdit = () => {
        setMode('edit');
        setErrors({});
    };

    // Cancelar edição e voltar para visualização
    const handleCancelEdit = () => {
        setMode('view');
        setBillingData(initialBillingData);
        setComentario('');
        setErrors({});
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
            console.error('Erro ao salvar correção:', error);
        }
    };

    // Se não está aberto, não renderizar nada
    if (!isOpen) return null;

    const isRejeitado = lancamento?.status === 'rejeitado';

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
                    "flex flex-col rounded-l-2xl",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4">
                    <BackButton onClick={handleClose} />
                    
                    <div className="flex-1">
                        <h2 
                            className="font-semibold text-foreground" 
                            style={{
                                fontSize: 'var(--page-title-font-size)',
                                fontWeight: 'var(--page-title-font-weight)',
                                fontFamily: 'var(--page-title-font-family)'
                            }}
                        >
                            {mode === 'view' ? 'Dados de Faturamento' : 'Corrigir Faturamento'}
                        </h2>
                        {lancamento && (
                            <p className="text-sm text-muted-foreground">
                                {lancamento.clienteNome} • {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </div>

                    {/* Botões no Header */}
                    {mode === 'view' ? (
                        /* Modo Visualização: Botão Corrigir (se rejeitado) */
                        isRejeitado && (
                            <Button
                                onClick={handleEdit}
                                className="min-w-[120px]"
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Corrigir
                            </Button>
                        )
                    ) : (
                        /* Modo Edição: Botões Cancelar e Reenviar */
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancelEdit}
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
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm m-2 mt-0">
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="space-y-8 pb-16 p-4">
                            {/* Motivo da Rejeição */}
                            {isRejeitado && lancamento?.motivoRejeicao && (
                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                                    <h4 
                                        className="text-red-800 dark:text-red-300 mb-2" 
                                        style={{ 
                                            fontFamily: 'Sora, sans-serif',
                                            fontSize: '0.9375rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        Motivo da rejeição:
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                                        {lancamento.motivoRejeicao}
                                    </p>
                                </div>
                            )}

                            {/* Mensagem de Sucesso */}
                            {showSuccess && (
                                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        Faturamento corrigido e reenviado com sucesso!
                                    </AlertDescription>
                                </Alert>
                            )}

                            {mode === 'view' ? (
                                /* ========================================
                                   MODO VISUALIZAÇÃO
                                   ======================================== */
                                billingData && (
                                    <BillingInfoView
                                        billing={billingData}
                                        title="Dados de Faturamento"
                                    />
                                )
                            ) : (
                                /* ========================================
                                   MODO EDIÇÃO
                                   ======================================== */
                                billingData && (
                                    <>
                                        <h4 
                                            className="text-md font-regular mb-4" 
                                            style={{ fontFamily: 'Sora, sans-serif' }}
                                        >
                                            Dados de Faturamento
                                        </h4>
                                        <SessionBillingData
                                            value={billingData}
                                            onChange={setBillingData}
                                            errors={errors}
                                            disabled={isSaving || showSuccess}
                                            title=""
                                            defaultExpanded={true}
                                        />
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BillingDrawer;
