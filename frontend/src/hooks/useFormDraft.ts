/**
 * Hook para persistir rascunho de formulário em sessionStorage
 * 
 * Usa sessionStorage para não persistir entre sessões do navegador
 * (mais seguro para dados sensíveis como anamnese)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseFormDraftOptions<T> {
    /**
     * Chave única para identificar o rascunho
     */
    key: string;
    
    /**
     * Valor inicial do formulário
     */
    initialValue: T;
    
    /**
     * Delay em ms para debounce do salvamento (default: 1000ms)
     */
    debounceMs?: number;
    
    /**
     * Se true, exibe toast ao restaurar rascunho
     */
    showRestoreToast?: boolean;
}

interface UseFormDraftReturn<T> {
    /**
     * Valor atual do estado
     */
    value: T;
    
    /**
     * Função para atualizar o valor (salva automaticamente)
     */
    setValue: (newValue: T | ((prev: T) => T)) => void;
    
    /**
     * Se existe um rascunho salvo
     */
    hasDraft: boolean;
    
    /**
     * Limpa o rascunho do storage
     */
    clearDraft: () => void;
    
    /**
     * Restaura o rascunho (se existir)
     */
    restoreDraft: () => void;
    
    /**
     * Descarta o rascunho e usa o valor inicial
     */
    discardDraft: () => void;
}

/**
 * Verifica se o valor é "significativo" (não está vazio/default)
 */
function hasSignificantData(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
        return Object.values(value).some(v => hasSignificantData(v));
    }
    return false;
}

export function useFormDraft<T>({
    key,
    initialValue,
    debounceMs = 1000,
    showRestoreToast = true,
}: UseFormDraftOptions<T>): UseFormDraftReturn<T> {
    const storageKey = `draft_${key}`;
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitializedRef = useRef(false);
    
    // Verificar se existe rascunho
    const [hasDraft, setHasDraft] = useState(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            return saved !== null;
        } catch {
            return false;
        }
    });
    
    // Estado principal
    const [value, setValueInternal] = useState<T>(() => {
        // Na inicialização, verificar se há rascunho
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed;
            }
        } catch (error) {
            console.warn('Erro ao carregar rascunho:', error);
        }
        return initialValue;
    });

    // Salvar rascunho no storage (com debounce)
    const saveDraft = useCallback((data: T) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            try {
                // Só salvar se tiver dados significativos
                if (hasSignificantData(data)) {
                    sessionStorage.setItem(storageKey, JSON.stringify(data));
                    setHasDraft(true);
                }
            } catch (error) {
                console.warn('Erro ao salvar rascunho:', error);
            }
        }, debounceMs);
    }, [storageKey, debounceMs]);

    // Função exposta para atualizar valor
    const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
        setValueInternal(prev => {
            const next = typeof newValue === 'function' 
                ? (newValue as (prev: T) => T)(prev) 
                : newValue;
            saveDraft(next);
            return next;
        });
    }, [saveDraft]);

    // Limpar rascunho
    const clearDraft = useCallback(() => {
        try {
            sessionStorage.removeItem(storageKey);
            setHasDraft(false);
        } catch (error) {
            console.warn('Erro ao limpar rascunho:', error);
        }
    }, [storageKey]);

    // Restaurar rascunho
    const restoreDraft = useCallback(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                setValueInternal(parsed);
                if (showRestoreToast) {
                    toast.info('Rascunho restaurado', {
                        description: 'Seu progresso anterior foi recuperado.',
                    });
                }
            }
        } catch (error) {
            console.warn('Erro ao restaurar rascunho:', error);
        }
    }, [storageKey, showRestoreToast]);

    // Descartar rascunho e usar valor inicial
    const discardDraft = useCallback(() => {
        clearDraft();
        setValueInternal(initialValue);
    }, [clearDraft, initialValue]);

    // Mostrar toast de rascunho encontrado na primeira renderização
    useEffect(() => {
        if (!isInitializedRef.current && hasDraft && showRestoreToast) {
            isInitializedRef.current = true;
            toast.info('Rascunho encontrado', {
                description: 'Seu progresso anterior foi restaurado automaticamente.',
                duration: 4000,
            });
        }
    }, [hasDraft, showRestoreToast]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        value,
        setValue,
        hasDraft,
        clearDraft,
        restoreDraft,
        discardDraft,
    };
}

export default useFormDraft;
