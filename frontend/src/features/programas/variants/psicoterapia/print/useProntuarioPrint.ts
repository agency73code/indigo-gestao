/**
 * Hook para impressão de prontuário psicológico
 */

import { useCallback, useRef } from 'react';

type PrintPhase = 'before' | 'print' | 'content';

type UseProntuarioPrintOptions = {
    content: () => HTMLElement | null;
    documentTitle?: string;
    onBeforeGetContent?: () => void | Promise<void>;
    onAfterPrint?: () => void;
    onPrintError?: (phase: PrintPhase, error: unknown) => void;
};

const teardownMediaListener = (
    mediaQueryList: MediaQueryList | null,
    handler: (event: MediaQueryListEvent) => void,
) => {
    if (!mediaQueryList) return;

    if (typeof mediaQueryList.removeEventListener === 'function') {
        mediaQueryList.removeEventListener('change', handler);
    } else if (typeof mediaQueryList.removeListener === 'function') {
        mediaQueryList.removeListener(handler);
    }
};

export function useProntuarioPrint({
    content,
    documentTitle = 'prontuario-psicologico',
    onBeforeGetContent,
    onAfterPrint,
    onPrintError,
}: UseProntuarioPrintOptions) {
    const isPrintingRef = useRef(false);

    const handlePrint = useCallback(async () => {
        if (isPrintingRef.current) return;
        isPrintingRef.current = true;

        const resolveContent = () => {
            try {
                return content?.() ?? null;
            } catch (error) {
                onPrintError?.('content', error);
                return null;
            }
        };

        const targetNode = resolveContent();

        if (!targetNode) {
            isPrintingRef.current = false;
            onPrintError?.('content', new Error('Elemento de impressão não encontrado.'));
            return;
        }

        let mediaQueryList: MediaQueryList | null = null;

        const originalTitle = document.title;

        const cleanup = () => {
            teardownMediaListener(mediaQueryList, mediaChangeHandler);
            window.removeEventListener('afterprint', afterPrintHandler);
            document.title = originalTitle;
            isPrintingRef.current = false;
            onAfterPrint?.();
        };

        const mediaChangeHandler = (event: MediaQueryListEvent) => {
            if (!event.matches) {
                cleanup();
            }
        };

        const afterPrintHandler = () => {
            cleanup();
        };

        try {
            await onBeforeGetContent?.();
        } catch (error) {
            isPrintingRef.current = false;
            onPrintError?.('before', error);
            return;
        }

        if (documentTitle) {
            document.title = documentTitle;
        }

        // Setup listeners para detectar quando a impressão termina
        window.addEventListener('afterprint', afterPrintHandler);

        try {
            mediaQueryList = window.matchMedia('print');
            if (typeof mediaQueryList.addEventListener === 'function') {
                mediaQueryList.addEventListener('change', mediaChangeHandler);
            } else if (typeof mediaQueryList.addListener === 'function') {
                mediaQueryList.addListener(mediaChangeHandler);
            }
        } catch (error) {
            // Fallback silencioso se mediaQueryList não funcionar
        }

        try {
            window.print();
        } catch (error) {
            cleanup();
            onPrintError?.('print', error);
        }
    }, [content, documentTitle, onBeforeGetContent, onAfterPrint, onPrintError]);

    return { handlePrint };
}
