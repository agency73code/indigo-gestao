import { useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FileDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import indigoLogo from '@/assets/logos/indigo.svg';
import { usePrint } from './usePrint';
import './print-styles.css';

// Informações do profissional para cabeçalho do relatório
export interface ReportProfessionalInfo {
    nome: string;
    areaAtuacao?: string;
    numeroConselho?: string;
}

// Informações do cliente para cabeçalho do relatório
export interface ReportClientInfo {
    nome: string;
    idade?: number;
}

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
    // Novas props para cabeçalho do PDF
    clientInfo?: ReportClientInfo;
    therapistInfo?: ReportProfessionalInfo;
    supervisorInfo?: ReportProfessionalInfo;
    coordinatorInfo?: ReportProfessionalInfo; // Para ATs
};

type CanvasSnapshot = {
    canvas: HTMLCanvasElement;
    image: HTMLImageElement;
    previousDisplay: string;
};

const DEFAULT_REPORT_TITLE = 'Relatório de Evolução Terapêutica';
const DEFAULT_DOCUMENT_TITLE = 'relatorio_evolucao_terapeutica';

// Dados da clínica para o rodapé
const CLINIC_INFO = {
    name: 'Clínica Instituto Índigo',
    address: 'Av Vital Brasil, 305, Butantã, CJ 905-909',
    cep: 'CEP 05503-001',
    phone: '+55 11 96973-2227',
    email: 'clinica.indigo@gmail.com',
    instagram: '@inst.indigo',
};

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
    clientInfo,
    therapistInfo,
    supervisorInfo,
    coordinatorInfo,
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
                {/* Cabeçalho do PDF - só aparece na impressão */}
                <div data-print-meta-header data-print-only className="hidden">
                    <div
                        data-print-block
                        className="border-b pb-4 mb-4"
                    >
                        {/* Linha 1: Logo + Título + Data */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img src={indigoLogo} alt="Logo Índigo" className="h-12 w-auto" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-semibold text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>
                                        {reportTitle}
                                    </span>
                                    {clientInfo && (
                                        <span className="text-sm text-muted-foreground">
                                            Cliente: <strong>{clientInfo.nome}</strong>
                                            {clientInfo.idade && ` • ${clientInfo.idade} anos`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <span>Gerado em {formattedDate}</span>
                            </div>
                        </div>

                        {/* Linha 2: Profissionais responsáveis */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                            {/* Terapeuta responsável */}
                            {therapistInfo && (
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                        Terapeuta Responsável
                                    </span>
                                    <span className="font-medium text-sm">{therapistInfo.nome}</span>
                                    {therapistInfo.areaAtuacao && (
                                        <span className="text-xs text-muted-foreground">{therapistInfo.areaAtuacao}</span>
                                    )}
                                    {therapistInfo.numeroConselho && (
                                        <span className="text-xs text-muted-foreground">{therapistInfo.numeroConselho}</span>
                                    )}
                                </div>
                            )}

                            {/* Supervisor */}
                            {supervisorInfo && (
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                        Supervisor(a)
                                    </span>
                                    <span className="font-medium text-sm">{supervisorInfo.nome}</span>
                                    {supervisorInfo.areaAtuacao && (
                                        <span className="text-xs text-muted-foreground">{supervisorInfo.areaAtuacao}</span>
                                    )}
                                    {supervisorInfo.numeroConselho && (
                                        <span className="text-xs text-muted-foreground">{supervisorInfo.numeroConselho}</span>
                                    )}
                                </div>
                            )}

                            {/* Coordenador (para ATs) */}
                            {coordinatorInfo && !supervisorInfo && (
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                        Coordenador(a)
                                    </span>
                                    <span className="font-medium text-sm">{coordinatorInfo.nome}</span>
                                    {coordinatorInfo.areaAtuacao && (
                                        <span className="text-xs text-muted-foreground">{coordinatorInfo.areaAtuacao}</span>
                                    )}
                                    {coordinatorInfo.numeroConselho && (
                                        <span className="text-xs text-muted-foreground">{coordinatorInfo.numeroConselho}</span>
                                    )}
                                </div>
                            )}
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

                {/* Rodapé do PDF - só aparece na impressão */}
                <div data-print-footer data-print-only className="hidden">
                    <div className="border-t pt-4 mt-8 text-center text-xs text-muted-foreground">
                        <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                            {CLINIC_INFO.name}
                        </p>
                        <p>{CLINIC_INFO.address} • {CLINIC_INFO.cep}</p>
                        <p>
                            Contato: {CLINIC_INFO.phone} • {CLINIC_INFO.email}
                        </p>
                        <p>Instagram: {CLINIC_INFO.instagram}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
