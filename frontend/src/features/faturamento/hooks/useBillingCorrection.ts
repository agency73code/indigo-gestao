/**
 * ============================================================================
 * HOOK: useBillingCorrection
 * ============================================================================
 * 
 * Hook para gerenciar o estado e lógica de correção de faturamento.
 * 
 * FEATURES:
 * - Gerencia abertura/fechamento do drawer
 * - Busca dados do lançamento
 * - Envia correção para API
 * - Gerencia estado de loading e erro
 * 
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { BillingLancamento, BillingCorrectionState } from '../types/billingCorrection';
import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';
import * as BillingCorrectionService from '../services/billingCorrectionService';

/**
 * Hook para gerenciar correção de faturamento
 */
export function useBillingCorrection() {
    
    const [state, setState] = useState<BillingCorrectionState>({
        isOpen: false,
        lancamento: null,
        isSaving: false,
        error: null,
    });

    /**
     * Abre o drawer para corrigir um lançamento
     */
    const openCorrection = useCallback(async (lancamento: BillingLancamento) => {
        setState({
            isOpen: true,
            lancamento,
            isSaving: false,
            error: null,
        });
    }, []);

    /**
     * Fecha o drawer
     */
    const closeCorrection = useCallback(() => {
        setState({
            isOpen: false,
            lancamento: null,
            isSaving: false,
            error: null,
        });
    }, []);

    /**
     * Salva a correção
     */
    const saveCorrection = useCallback(async (
        lancamentoId: string,
        dadosCorrigidos: DadosFaturamentoSessao,
        comentario?: string
    ) => {
        setState((prev) => ({ ...prev, isSaving: true, error: null }));

        try {
            const response = await BillingCorrectionService.correctBillingLancamento({
                lancamentoId,
                faturamento: dadosCorrigidos,
                comentario,
            });

            if (response.success) {
                toast.success('Faturamento corrigido', {
                    description: response.message || 'Lançamento reenviado para aprovação com sucesso.',
                });

                // Fechar drawer após sucesso
                setTimeout(() => {
                    closeCorrection();
                }, 1500);

                return response;
            } else {
                throw new Error(response.message || 'Erro ao corrigir faturamento');
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Erro ao corrigir faturamento';

            setState((prev) => ({ 
                ...prev, 
                isSaving: false, 
                error: errorMessage 
            }));

            toast.error('Erro ao corrigir faturamento', {
                description: errorMessage,
            });

            throw error;
        }
    }, [closeCorrection]);

    /**
     * Obtém dados de faturamento do lançamento
     */
    const getBillingData = useCallback((lancamento: BillingLancamento): DadosFaturamentoSessao | null => {
        if (!lancamento) return null;
        return BillingCorrectionService.lancamentoToBillingData(lancamento);
    }, []);

    return {
        // Estado
        isOpen: state.isOpen,
        lancamento: state.lancamento,
        isSaving: state.isSaving,
        error: state.error,

        // Ações
        openCorrection,
        closeCorrection,
        saveCorrection,
        getBillingData,
    };
}

export default useBillingCorrection;
