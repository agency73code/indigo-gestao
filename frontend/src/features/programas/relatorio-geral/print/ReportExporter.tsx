import { useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import indigoLogo from '@/assets/logos/indigo.svg';
import { usePrint } from './usePrint';

type ReportExporterProps = {
    header?: ReactNode;
    children: ReactNode;
    documentTitle?: string;
    reportTitle?: string;
    pageTitle?: string;
    pageSubtitle?: string;
};

type CanvasSnapshot = {
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;
    previousDisplay: string;
};

const DEFAULT_REPORT_TITLE = 'Relatório Geral — Programas & Objetivos';
const DEFAULT_DOCUMENT_TITLE = 'relatorio_geral_programas_objetivos';

const PRINT_PAGE_STYLE = `
  @page { size: A4; margin: 8mm 6mm; }
  @media print {
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: visible !important;
      font-size: 13px; /* ligeiro aumento pra ocupar melhor a página */
    }

    /* força largura de "desktop" dentro do A4 - mais largo para aproveitar o espaço */
    [data-print-root] { 
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto; 
      padding: 0 !important;
    }

    /* mostrar/ocultar elementos específicos */
    [data-print-only] { 
      display: block !important; 
    }
    
    .no-print, 
    [data-screen-only], 
    nav, 
    header[role="banner"], 
    [data-role="toolbar"] {
      display: none !important;
    }

    /* evitar primeira página vazia */
    [data-print-meta-header],
    [data-print-program-header] {
      page-break-after: avoid !important;
      break-after: avoid-page !important;
    }

    /* O PRIMEIRO bloco pode quebrar se faltar espaço (pra não empurrar tudo p/ pág. 2) */
    [data-print-content] > *:first-child {
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    /* NÃO quebrar cartões/gráficos e remover scrolls */
    [data-print-block],
    [data-print-content] > *,
    section, 
    article {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
      max-height: none !important;
      height: auto !important;
    }
    
    canvas, svg, img { 
      break-inside: avoid; 
      page-break-inside: avoid; 
    }

    /* some com QUALQUER scrollbar */
    *[style*="overflow"],
    .overflow-auto, 
    .overflow-y-auto, 
    .overflow-x-auto, 
    .overflow-scroll,
    .scroll-auto, 
    .scrollbar, 
    .scrollable {
      overflow: visible !important;
      max-height: none !important;
      height: auto !important;
    }
    
    * { 
      -ms-overflow-style: none !important; 
      scrollbar-width: none !important; 
    }
    
    *::-webkit-scrollbar { 
      width: 0 !important; 
      height: 0 !important; 
      background: transparent !important; 
    }

    /* ==== FORÇAR LAYOUT DE DESKTOP NAS ÁREAS-CHAVE ==== */

    /* 4 KPIs numa única linha (forçar grid 4 colunas) */
    [data-print-kpi-grid] {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 6mm !important;
      align-items: stretch;
    }

    /* largura "desktop" pro gráfico e cards */
    [data-print-chart],
    [data-print-wide] {
      width: 100% !important;
      max-width: 100% !important;
    }

    /* MANTER padding do card do gráfico (não remover) */
    [data-print-chart] > * {
      width: 100% !important;
      max-width: 100% !important;
      /* NÃO sobrescrever padding - deixar o padrão do card */
    }

    /* Forçar apenas canvas/svg a ocuparem 100% da área disponível DENTRO do card */
    [data-print-chart] canvas,
    [data-print-chart] svg {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
    }

    /* Recharts: ajustar wrapper mas manter padding do card */
    [data-print-chart] .recharts-wrapper {
      width: 100% !important;
      max-width: 100% !important;
    }
    
    [data-print-chart] .recharts-surface {
      width: 100% !important;
      max-width: 100% !important;
    }

    /* filtros: mostra resumo compacto e esconde controles */
    [data-print-filters-summary] { 
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 0 6mm 0 !important; /* Adiciona espaçamento inferior */
    }
    
    [data-print-filters-summary] > *,
    [data-print-filters-summary] .space-y-2 {
      padding: 0 !important;
      margin: 0 !important;
    }
    
    [data-print-filters-summary] h3 {
      margin-bottom: 2mm !important;
    }
    
    /* Grid de chips - distribuir uniformemente em 4 colunas como os KPIs */
    [data-print-filters-summary] .flex {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 6mm !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }
    
    [data-print-filters-summary] .chip {
      display: block !important;
      width: 100% !important;
      padding: 2mm 3mm; 
      border-radius: 6px;
      border: 1px solid rgba(0,0,0,.12);
      margin: 0 !important;
      font-size: 12px;
      text-align: left;
      box-sizing: border-box;
    }
    
    [data-print-hide-in-filters] { 
      display: none !important; 
    }
  }
`;

export function ReportExporter({
    header,
    children,
    documentTitle,
    reportTitle = DEFAULT_REPORT_TITLE,
    pageTitle = 'Painel de Progresso - Programas & Objetivos',
    pageSubtitle = 'Análise completa do desempenho e evolução do cliente',
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 no-print">
                <div className="flex-1">
                    <h1
                        className="text-2xl font-semibold text-primary"
                        style={{ fontFamily: 'Sora, sans-serif' }}
                    >
                        {pageTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
                </div>
                <Button type="button" onClick={handlePrint} className="h-12 gap-2 rounded-[5px]">
                    <FileDown className="h-4 w-4" aria-hidden />
                    Exportar Relatório (PDF)
                </Button>
            </div>

            <div ref={printAreaRef} data-print-root className="flex flex-col">
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
