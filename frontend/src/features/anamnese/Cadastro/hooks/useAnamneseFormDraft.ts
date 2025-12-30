/**
 * Hook para gerenciar estado do formulário de anamnese com persistência de rascunho
 */

import { useCallback, useMemo } from 'react';
import { useFormDraft } from '@/hooks/useFormDraft';
import type {
    AnamnseeCabecalho,
    AnamneseQueixaDiagnostico,
    AnamneseContextoFamiliarRotina,
    AnamneseDesenvolvimentoInicial,
    AnamneseAtividadesVidaDiaria,
    AnamneseSocialAcademico,
    AnamneseComportamento,
    AnamneseFinalizacao,
} from '../../types';

export interface AnamneseFormState {
    currentStep: number;
    cabecalho: AnamnseeCabecalho;
    queixaDiagnostico: Partial<AnamneseQueixaDiagnostico>;
    contextoFamiliarRotina: Partial<AnamneseContextoFamiliarRotina>;
    desenvolvimentoInicial: Partial<AnamneseDesenvolvimentoInicial>;
    atividadesVidaDiaria: Partial<AnamneseAtividadesVidaDiaria>;
    socialAcademico: Partial<AnamneseSocialAcademico>;
    comportamento: Partial<AnamneseComportamento>;
    finalizacao: Partial<AnamneseFinalizacao>;
}

interface UseAnamneseFormDraftOptions {
    initialState: AnamneseFormState;
}

export function useAnamneseFormDraft({ initialState }: UseAnamneseFormDraftOptions) {
    const { value, setValue, hasDraft, clearDraft, discardDraft } = useFormDraft<AnamneseFormState>({
        key: 'anamnese_form',
        initialValue: initialState,
        debounceMs: 1500, // Salvar a cada 1.5s de inatividade
        showRestoreToast: true,
    });

    // Getters individuais
    const currentStep = value.currentStep;
    const cabecalho = value.cabecalho;
    const queixaDiagnostico = value.queixaDiagnostico;
    const contextoFamiliarRotina = value.contextoFamiliarRotina;
    const desenvolvimentoInicial = value.desenvolvimentoInicial;
    const atividadesVidaDiaria = value.atividadesVidaDiaria;
    const socialAcademico = value.socialAcademico;
    const comportamento = value.comportamento;
    const finalizacao = value.finalizacao;

    // Setters individuais
    const setCurrentStep = useCallback((step: number) => {
        setValue(prev => ({ ...prev, currentStep: step }));
    }, [setValue]);

    const setCabecalho = useCallback((data: AnamnseeCabecalho) => {
        setValue(prev => ({ ...prev, cabecalho: data }));
    }, [setValue]);

    const setQueixaDiagnostico = useCallback((data: Partial<AnamneseQueixaDiagnostico>) => {
        setValue(prev => ({ ...prev, queixaDiagnostico: data }));
    }, [setValue]);

    const setContextoFamiliarRotina = useCallback((data: Partial<AnamneseContextoFamiliarRotina>) => {
        setValue(prev => ({ ...prev, contextoFamiliarRotina: data }));
    }, [setValue]);

    const setDesenvolvimentoInicial = useCallback((data: Partial<AnamneseDesenvolvimentoInicial>) => {
        setValue(prev => ({ ...prev, desenvolvimentoInicial: data }));
    }, [setValue]);

    const setAtividadesVidaDiaria = useCallback((data: Partial<AnamneseAtividadesVidaDiaria>) => {
        setValue(prev => ({ ...prev, atividadesVidaDiaria: data }));
    }, [setValue]);

    const setSocialAcademico = useCallback((data: Partial<AnamneseSocialAcademico>) => {
        setValue(prev => ({ ...prev, socialAcademico: data }));
    }, [setValue]);

    const setComportamento = useCallback((data: Partial<AnamneseComportamento>) => {
        setValue(prev => ({ ...prev, comportamento: data }));
    }, [setValue]);

    const setFinalizacao = useCallback((data: Partial<AnamneseFinalizacao>) => {
        setValue(prev => ({ ...prev, finalizacao: data }));
    }, [setValue]);

    // Detectar se tem dados preenchidos
    const isDirty = useMemo(() => {
        return !!cabecalho.clienteId || !!queixaDiagnostico.queixaPrincipal;
    }, [cabecalho.clienteId, queixaDiagnostico.queixaPrincipal]);

    return {
        // Estado
        currentStep,
        cabecalho,
        queixaDiagnostico,
        contextoFamiliarRotina,
        desenvolvimentoInicial,
        atividadesVidaDiaria,
        socialAcademico,
        comportamento,
        finalizacao,
        
        // Setters
        setCurrentStep,
        setCabecalho,
        setQueixaDiagnostico,
        setContextoFamiliarRotina,
        setDesenvolvimentoInicial,
        setAtividadesVidaDiaria,
        setSocialAcademico,
        setComportamento,
        setFinalizacao,
        
        // Draft utils
        hasDraft,
        clearDraft,
        discardDraft,
        isDirty,
    };
}

export default useAnamneseFormDraft;
