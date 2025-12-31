/**
 * Hook para detectar mudanças não salvas e alertar o usuário
 * antes de sair da página
 */

import { useEffect, useCallback, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesOptions {
    /**
     * Se true, o formulário tem alterações não salvas
     */
    isDirty: boolean;
    
    /**
     * Mensagem exibida ao tentar sair (para beforeunload)
     */
    message?: string;
    
    /**
     * Se true, bloqueia a navegação do react-router
     */
    blockNavigation?: boolean;
}

/**
 * Hook que:
 * 1. Intercepta o fechamento/refresh da aba com beforeunload
 * 2. Bloqueia a navegação do react-router quando há mudanças não salvas
 * 
 * @returns {boolean} - Se está bloqueando navegação
 */
export function useUnsavedChanges({
    isDirty,
    message = 'Você tem alterações não salvas. Deseja realmente sair?',
    blockNavigation = true,
}: UseUnsavedChangesOptions) {
    const isDirtyRef = useRef(isDirty);
    
    // Manter ref atualizado
    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty]);

    // Interceptar refresh/fechamento de aba
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirtyRef.current) return;
            
            e.preventDefault();
            // Browsers modernos ignoram a mensagem customizada
            // mas ainda mostram o dialog padrão
            e.returnValue = message;
            return message;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [message]);

    // Bloquear navegação do react-router
    const blocker = useBlocker(
        useCallback(() => {
            return blockNavigation && isDirtyRef.current;
        }, [blockNavigation])
    );

    return {
        blocker,
        isBlocked: blocker.state === 'blocked',
        proceed: blocker.proceed,
        reset: blocker.reset,
    };
}

export default useUnsavedChanges;
