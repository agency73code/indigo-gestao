import { useCallback, useRef } from 'react';

type PrintPhase = 'before' | 'print' | 'content';

type UsePrintOptions = {
    content: () => HTMLElement | null;
    documentTitle?: string;
    pageStyle?: string;
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

export function usePrint({
    content,
    documentTitle,
    pageStyle,
    onBeforeGetContent,
    onAfterPrint,
    onPrintError,
}: UsePrintOptions) {
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

        let injectedStyle: HTMLStyleElement | null = null;
        let mediaQueryList: MediaQueryList | null = null;
        let afterPrintTimeout: ReturnType<typeof setTimeout> | null = null;

        const cleanup = () => {
            if (afterPrintTimeout) {
                clearTimeout(afterPrintTimeout);
                afterPrintTimeout = null;
            }

            if (injectedStyle && injectedStyle.parentNode) {
                injectedStyle.parentNode.removeChild(injectedStyle);
            }

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

        const originalTitle = document.title;

        try {
            await onBeforeGetContent?.();
        } catch (error) {
            isPrintingRef.current = false;
            onPrintError?.('before', error);
            return;
        }

        if (pageStyle && pageStyle.trim().length > 0) {
            injectedStyle = document.createElement('style');
            injectedStyle.setAttribute('data-print-style', 'true');
            injectedStyle.setAttribute('media', 'print');
            injectedStyle.appendChild(document.createTextNode(pageStyle));
            document.head.appendChild(injectedStyle);
        }

        if (documentTitle && documentTitle.trim().length > 0) {
            document.title = documentTitle;
        }

        mediaQueryList = typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;

        if (mediaQueryList) {
            if (typeof mediaQueryList.addEventListener === 'function') {
                mediaQueryList.addEventListener('change', mediaChangeHandler);
            } else if (typeof mediaQueryList.addListener === 'function') {
                mediaQueryList.addListener(mediaChangeHandler);
            }
        }

        window.addEventListener('afterprint', afterPrintHandler);

        afterPrintTimeout = setTimeout(() => {
            cleanup();
        }, 3000);

        try {
            window.print();
        } catch (error) {
            onPrintError?.('print', error);
            cleanup();
        }
    }, [content, documentTitle, pageStyle, onBeforeGetContent, onAfterPrint, onPrintError]);

    return handlePrint;
}

