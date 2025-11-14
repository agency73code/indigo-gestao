import { useCallback, useMemo, useRef, useEffect } from 'react';
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
    hideButton?: boolean;
    onPrintReady?: (printFn: () => void) => void;
};

type CanvasSnapshot = {
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;
    previousDisplay: string;
};

const DEFAULT_REPORT_TITLE = 'Relatório Geral — Programas & Objetivos';
const DEFAULT_DOCUMENT_TITLE = 'relatorio_geral_programas_objetivos';

const PRINT_PAGE_STYLE = `
  @page { 
    size: A4; 
    margin: 8mm 6mm 12mm 6mm;
    
    @bottom-right {
      content: "Página " counter(page) " de " counter(pages);
      font-size: 11px;
      color: hsl(var(--primary));
      font-family: 'Sora', sans-serif;
      font-weight: 500;
    }
    
    @bottom-left {
      content: "";
    }
    
    @bottom-center {
      content: "";
    }
  }
  
  @media print {
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: visible !important;
      font-size: 22px; /* aumentado 38% para melhor legibilidade */
    }

    /* força largura de "desktop" dentro do A4 - mais largo para aproveitar o espaço */
    [data-print-root] { 
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto; 
      padding: 0 !important;
      padding-top: 1rem !important;
    }

    /* Cabeçalho do PDF com padding superior */
    [data-print-meta-header] {
      padding-top: 0.5rem !important;
      margin-bottom: 1rem !important;
    }

    /* mostrar/ocultar elementos específicos */
    [data-print-only] { 
      display: block !important; 
    }
    
    /* Ocultar elementos que não devem aparecer na impressão */
    .no-print, 
    [data-screen-only], 
    nav, 
    header[role="banner"], 
    [data-role="toolbar"],
    /* Remover toasts e notificações */
    [data-sonner-toaster],
    [data-toast],
    [class*="toast"],
    [class*="Toaster"],
    /* Remover header principal da aplicação */
    header,
    [data-header],
    /* Remover barra de ferramentas do editor de texto */
    .tiptap-toolbar,
    .editor-toolbar,
    [data-toolbar],
    .ProseMirror-menubar,
    .ql-toolbar,
    /* Remover controles de edição do Rich Text */
    [class*="toolbar"],
    [class*="RichText"] button,
    [class*="editor"] [role="toolbar"],
    .rdw-editor-toolbar {
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

    /* Adicionar cor de fundo nos cards de KPI */
    [data-print-kpi-grid] > * {
      background-color: hsl(var(--muted)) !important;
      border: 1px solid hsl(var(--border)) !important;
      border-radius: 8px !important;
      padding: 1rem !important;
    }

    /* Garantir que ícones nos cards não sejam cortados */
    [data-print-kpi-grid] svg,
    [data-print-kpi-grid] [class*="icon"],
    [data-print-kpi-grid] .lucide {
      overflow: visible !important;
      flex-shrink: 0 !important;
      min-width: 16px !important;
      min-height: 16px !important;
    }

    /* Ajustar espaçamento interno dos cards KPI */
    [data-print-kpi-grid] [class*="CardHeader"],
    [data-print-kpi-grid] [class*="card-header"] {
      padding-bottom: 8px !important;
    }

    [data-print-kpi-grid] [class*="CardContent"],
    [data-print-kpi-grid] [class*="card-content"] {
      padding-top: 0 !important;
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
      background-color: hsl(var(--muted) / 0.3) !important;
      border: 1px solid hsl(var(--border)) !important;
      border-radius: 8px !important;
      padding: 1rem !important;
    }
    
    [data-print-filters-summary] > *,
    [data-print-filters-summary] .space-y-2 {
      padding: 0 !important;
      margin: 0 !important;
    }
    
    [data-print-filters-summary] h3 {
      margin-bottom: 2mm !important;
      font-weight: 600 !important;
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
      background-color: white !important;
    }
    
    [data-print-hide-in-filters] { 
      display: none !important; 
    }

    /* Rich Text Editor - manter apenas o conteúdo */
    .ProseMirror {
      border: none !important;
      padding: 0.5rem !important;
      min-height: auto !important;
    }

    /* Observação Clínica - estilização para impressão */
    [data-print-block]:has(.ProseMirror) {
      background-color: hsl(var(--muted) / 0.3) !important;
      border: 1px solid hsl(var(--border)) !important;
      border-radius: 8px !important;
      padding: 1rem !important;
    }

    /* PatientSelector e blocos de cliente - manter estilo */
    [data-print-program-header] {
      margin-bottom: 1rem !important;
    }

    /* Garantir que botões de ação não apareçam */
    [data-print-program-header] button:not([data-print-keep]),
    [data-print-block] button:not([data-print-keep]) {
      display: none !important;
    }

    /* Manter informações do paciente visíveis */
    [data-print-program-header] [class*="patient"],
    [data-print-program-header] [class*="Patient"] {
      display: block !important;
    }
  }
`;

export function ReportExporter({
    header,
    children,
    documentTitle,
    reportTitle = DEFAULT_REPORT_TITLE,
    pageTitle = 'xx',
    pageSubtitle = 'Análise completa do desempenho e evolução do cliente',
    hideButton = false,
    onPrintReady,
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
    }, [onPrintReady, handlePrint]);

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
                    <Button
                        type="button"
                        onClick={handlePrint}
                        className="h-12 gap-2 rounded-[5px]"
                    >
                        <FileDown className="h-4 w-4" aria-hidden />
                        Exportar Relatório (PDF)
                    </Button>
                </div>
            )}

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
