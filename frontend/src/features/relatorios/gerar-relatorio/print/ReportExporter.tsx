import { useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FileDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import indigoLogo from '@/assets/logos/indigo.svg';
import { usePrint } from './usePrint';
import './print-styles.css';

type ReportExporterProps = {
    header?: ReactNode;
    children: ReactNode;
    documentTitle?: string;
    reportTitle?: string;
    pageTitle?: string;
    pageSubtitle?: string;
    hideButton?: boolean;
    onPrintReady?: (printFn: () => void) => void;
    onSave?: () => void;
};

type CanvasSnapshot = {
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;
    previousDisplay: string;
};

const DEFAULT_REPORT_TITLE = 'Relatório Geral — Programas & Objetivos';
const DEFAULT_DOCUMENT_TITLE = 'relatorio_geral_programas_objetivos';

// CSS inline removido - agora está em print-styles.css
const PRINT_PAGE_STYLE = '';

export function ReportExporter({
    header,
    children,
    documentTitle,
    reportTitle = DEFAULT_REPORT_TITLE,
    pageTitle = 'Painel de Progresso - Programas & Objetivos',
    pageSubtitle = 'Análise completa do desempenho e evolução do cliente',
    hideButton = false,
    onPrintReady,
    onSave,
}: ReportExporterProps) {
    const printAreaRef = useRef<HTMLDivElement>(null);
    const canvasSnapshotsRef = useRef<CanvasSnapshot[]>([]);

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }, []);

    const effectiveDocumentTitle = useMemo(() => {
        const baseTitle = documentTitle?.trim();
        return baseTitle && baseTitle.length > 0 ? baseTitle : DEFAULT_DOCUMENT_TITLE;
    }, [documentTitle]);

    const takeCanvasSnapshots = useCallback(() => {
        const root = printAreaRef.current;
        if (!root) return;

        // Força libs de gráficos a recalcularem largura para o print (layout desktop)
        window.dispatchEvent(new Event('resize'));

        const canvases = Array.from(root.querySelectorAll('canvas'));
        const snapshots: CanvasSnapshot[] = [];

        canvases.forEach((canvas) => {
            try {
                const dataUrl = canvas.toDataURL('image/png');
                const image = document.createElement('img');
                image.src = dataUrl;
                image.alt = canvas.getAttribute('aria-label') ?? 'Gráfico';
                const rect = canvas.getBoundingClientRect();
                if (rect.width && rect.height) {
                    image.style.width = `${rect.width}px`;
                    image.style.height = `${rect.height}px`;
                }
                image.dataset.printCanvasSnapshot = 'true';

                const previousDisplay = canvas.style.display;
                canvas.style.display = 'none';
                canvas.after(image);

                snapshots.push({ canvas, image, previousDisplay });
            } catch (error) {
                console.warn('Falha ao gerar snapshot do canvas para impressão.', error);
            }
        });

        canvasSnapshotsRef.current = snapshots;
    }, []);

    const restoreCanvasSnapshots = useCallback(() => {
        canvasSnapshotsRef.current.forEach(({ canvas, image, previousDisplay }) => {
            image.remove();
            canvas.style.display = previousDisplay;
        });
        canvasSnapshotsRef.current = [];
    }, []);

    const handlePrint = usePrint({
        content: () => printAreaRef.current,
        documentTitle: effectiveDocumentTitle,
        pageStyle: PRINT_PAGE_STYLE,
        onBeforeGetContent: () => {
            takeCanvasSnapshots();
        },
        onAfterPrint: () => {
            restoreCanvasSnapshots();
        },
        onPrintError: (_, error) => {
            restoreCanvasSnapshots();
            if (error) {
                console.error('Falha ao tentar imprimir o relatório.', error);
            }
        },
    });

    // Expõe a função de print via callback quando disponível
    useEffect(() => {
        if (onPrintReady && handlePrint) {
            onPrintReady(handlePrint);
        }
        // Removido handlePrint das dependências para evitar loop infinito
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPrintReady]);

    return (
        <div className="flex flex-col gap-4">
            {!hideButton && (
                <div className="flex items-center justify-between px-6 pt-6 pb-0 no-print">
                    <div className="flex-1">
                        <h1
                            className="text-2xl font-semibold text-primary"
                            style={{ fontFamily: 'Sora, sans-serif' }}
                        >
                            {pageTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        {onSave && (
                            <Button
                                type="button"
                                onClick={onSave}
                                className="h-12 gap-2 rounded-[5px]"
                                variant="default"
                            >
                                <Save className="h-4 w-4" aria-hidden />
                                Salvar Relatório
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handlePrint}
                            className="h-12 gap-2 rounded-[5px]"
                            variant="outline"
                        >
                            <FileDown className="h-4 w-4" aria-hidden />
                            Exportar PDF
                        </Button>
                    </div>
                </div>
            )}

            <div ref={printAreaRef} data-print-root data-report-exporter className="flex flex-col">
                <div data-print-meta-header data-print-only className="hidden">
                    <div
                        data-print-block
                        className="flex items-center justify-between border-b pb-4 mb-4"
                    >
                        <div className="flex items-center gap-3">
                            <img src={indigoLogo} alt="Logo Índigo" className="h-10 w-auto" />
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold">{reportTitle}</span>
                                <span className="text-sm text-muted-foreground">
                                    Gerado em {formattedDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {header && (
                    <div data-print-program-header data-print-block>
                        {header}
                    </div>
                )}

                <div data-print-content className="flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
}
