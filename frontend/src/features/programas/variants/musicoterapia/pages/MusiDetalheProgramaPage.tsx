import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import {
    HeaderProgram,
    ErrorBanner,
} from '../../../detalhe-ocp/index';
import { fetchProgramById, fetchRecentSessions, fetchProgramChart } from '../../../detalhe-ocp/services';
import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { SerieLinha } from '../../../relatorio-geral/types';
import { usePrint } from '../../../relatorio-geral/print/usePrint';
import indigoLogo from '@/assets/logos/indigo.svg';
import MusiGoalSection from '../components/MusiGoalSection';
import MusiCurrentPerformanceSection from '../components/MusiCurrentPerformanceSection';
import MusiStimuliSection from '../components/MusiStimuliSection';
import MusiNotesSection from '../components/MusiNotesSection';
import MusiProgramActionBar from '../components/MusiProgramActionBar';
import MusiSummaryCard from '../components/MusiSummaryCard';
import MusiLastSessionPreview from '../components/MusiLastSessionPreview';
import MusiSessionsList from '../components/MusiSessionsList';
import type { MusiActivitySummary } from '../types';

// Tipo específico para Musicoterapia com campos adicionais
type MusiProgramDetail = {
    id: string;
    name?: string | null;
    patientId: string;
    patientName: string;
    patientGuardian?: string | null;
    patientAge?: number | null;
    patientPhotoUrl?: string | null;
    prazoInicio?: string;
    prazoFim?: string;
    therapistId: string;
    therapistName: string;
    therapistPhotoUrl?: string | null;
    createdAt: string;
    goalTitle: string;
    goalDescription?: string | null;
    longTermGoalDescription?: string | null;
    shortTermGoalDescription?: string | null;
    currentPerformanceLevel?: string | null;
    stimuliApplicationDescription?: string | null;
    stimuli: {
        id: string;
        order: number;
        label: string;
        description?: string | null;
        active: boolean;
    }[];
    criteria?: string | null;
    notes?: string | null;
    status: 'active' | 'archived';
};

const PRINT_PAGE_STYLE = `
  @page { 
    size: A4; 
    margin: 8mm 6mm 12mm 6mm;
    
    @bottom-right {
      content: "Página " counter(page) " de " counter(pages);
      font-size: 12px;
      color: hsl(var(--primary));
      font-family: 'Sora', system-ui, -apple-system, sans-serif;
      font-weight: 500;
    }
  }
  
  @media print {
    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: visible !important;
      font-size: 18px;
    }

    [data-print-root] { 
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important; 
      padding: 1rem !important;
      padding-top: 1rem !important;
    }

    [data-print-meta-header] {
      padding-top: 0.5rem !important;
      margin-bottom: 0rem !important;
    }

    [data-print-root] > * {
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    [data-print-content],
    [data-print-content] > *,
    [data-print-content] .min-h-screen {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    .max-w-lg,
    .max-w-xl,
    .max-w-2xl,
    .max-w-3xl,
    .max-w-4xl,
    .max-w-5xl,
    .max-w-6xl,
    .max-w-7xl,
    .max-w-screen-sm,
    .max-w-screen-md,
    .max-w-screen-lg,
    .max-w-screen-xl {
      max-width: 100% !important;
      width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    [data-print-block] {
      page-break-inside: avoid;
      break-inside: avoid;
      width: 100% !important;
      max-width: 100% !important;
    }

    [data-print-only] { 
      display: block !important; 
    }
    
    .no-print, 
    [data-screen-only] {
      display: none !important;
    }

    [data-print-chart] canvas,
    [data-print-chart] svg {
      width: 100% !important;
      max-width: 100% !important;
    }

    [data-print-kpi-grid] {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 1rem !important;
    }

    * {
      overflow: visible !important;
      scrollbar-width: none !important;
    }
    *::-webkit-scrollbar {
      display: none !important;
    }

    [data-print-block] {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
  }
`;

export default function MusiDetalheProgramaPage() {
    const { programaId } = useParams<{ programaId: string }>();
    const { setPageTitle, setHeaderActions } = usePageTitle();

    const [program, setProgram] = useState<MusiProgramDetail | null>(null);
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [chartData, setChartData] = useState<SerieLinha[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(Date.now());

    const printAreaRef = useRef<HTMLDivElement>(null);

    const takeCanvasSnapshots = useCallback(() => {
        const root = printAreaRef.current;
        if (!root) return [];

        window.dispatchEvent(new Event('resize'));
        const canvases = Array.from(root.querySelectorAll('canvas'));
        const snapshots: Array<{
            canvas: HTMLCanvasElement;
            image: HTMLImageElement;
            previousDisplay: string;
        }> = [];

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

        return snapshots;
    }, []);

    const restoreCanvasSnapshots = useCallback(
        (
            snapshots: Array<{
                canvas: HTMLCanvasElement;
                image: HTMLImageElement;
                previousDisplay: string;
            }>,
        ) => {
            snapshots.forEach(({ canvas, image, previousDisplay }) => {
                image.remove();
                canvas.style.display = previousDisplay;
            });
        },
        [],
    );

    const handlePrint = usePrint({
        content: () => printAreaRef.current,
        documentTitle: `programa_musicoterapia_${program?.name || program?.id || 'detalhado'}`,
        pageStyle: PRINT_PAGE_STYLE,
        onBeforeGetContent: () => {
            const snapshots = takeCanvasSnapshots();
            (window as any).__printSnapshots = snapshots;
        },
        onAfterPrint: () => {
            const snapshots = (window as any).__printSnapshots || [];
            restoreCanvasSnapshots(snapshots);
            delete (window as any).__printSnapshots;
        },
        onPrintError: (_, error) => {
            const snapshots = (window as any).__printSnapshots || [];
            restoreCanvasSnapshots(snapshots);
            delete (window as any).__printSnapshots;
            if (error) {
                console.error('Falha ao tentar imprimir o relatório.', error);
            }
        },
    });

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }, []);

    const loadData = useCallback(async () => {
        if (!programaId) {
            setError('ID do programa não encontrado.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [programData, sessionsData] = await Promise.all([
                fetchProgramById(programaId),
                fetchRecentSessions(programaId, 5),
            ]);

            setProgram(programData as MusiProgramDetail);
            setSessions(sessionsData);
            setRefreshKey(Date.now());

            setChartLoading(true);
            fetchProgramChart(programaId)
                .then((data) => {
                    setChartData(data);
                    setChartLoading(false);
                })
                .catch((err) => {
                    console.error('Erro ao carregar gráfico:', err);
                    setChartLoading(false);
                });
        } catch (err) {
            console.error('Erro ao carregar dados do programa de Musicoterapia:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, [programaId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (program?.name) {
            setPageTitle(program.name);
        }
    }, [program?.name, setPageTitle]);

    useEffect(() => {
        const button = program ? (
            <Button type="button" onClick={handlePrint} className="gap-2 rounded-full h-10">
                <FileDown className="h-4 w-4" />
                Extrair Relatório (PDF)
            </Button>
        ) : null;
        
        setHeaderActions(button);
        
        return () => {
            setHeaderActions(null);
        };
    }, [program?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-28">
                <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 p-4 space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-56 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 p-4 pt-8">
                    <ErrorBanner message={error || 'Programa não encontrado.'} onRetry={loadData} />
                </div>
            </div>
        );
    }

    const lastSession = sessions.length > 0 ? sessions[0] : null;

    return (
        <div className="flex flex-col gap-0">
            <div ref={printAreaRef} data-print-root className="flex flex-col">
                {/* Header para PDF */}
                <div data-print-meta-header data-print-only className="hidden">
                    <div
                        data-print-block
                        className="flex items-center justify-between border-b pb-2 mb-0"
                    >
                        <div className="flex items-center gap-3">
                            <img src={indigoLogo} alt="Indigo" className="h-12" />
                            <div>
                                <h1 
                                    className="text-xl font-bold text-primary"
                                    style={{ fontFamily: 'Sora, sans-serif' }}
                                >
                                    {program.name || 'Programa sem nome'}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {program.patientName} • {program.goalTitle}
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <p>Data: {formattedDate}</p>
                            <p className="font-medium">Programa de Musicoterapia</p>
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div data-print-content className="flex flex-col">
                    <div className="min-h-screen mt-4 pb-28 sm:p-0 rounded-lg">
                        <div className="md:max-w-none mx-auto md:mx-0 lg:mx-4 space-y-4">
                            {/* Header com informações do paciente e programa */}
                            <HeaderProgram key={refreshKey} program={program} />

                            {/* Objetivo Geral */}
                            <MusiGoalSection program={program} />

                            {/* Nível Atual de Desempenho */}
                            <MusiCurrentPerformanceSection currentPerformanceLevel={program.currentPerformanceLevel} />

                            {/* Objetivo Específico (Atividades) */}
                            <MusiStimuliSection program={program} />

                            {/* Observações do Terapeuta */}
                            <MusiNotesSection notes={program.notes || ''} readOnly={true} />

                            {/* Lista de sessões recentes */}
                            {sessions.length > 0 && (
                                <MusiSessionsList sessions={sessions} program={program} />
                            )}

                            {/* Preview da última sessão (se disponível) */}
                            {lastSession && (lastSession as any).activitiesSummary && (
                                <MusiLastSessionPreview
                                    sessionDate={lastSession.date}
                                    activitiesSummary={(lastSession as any).activitiesSummary as MusiActivitySummary[]}
                                />
                            )}

                            {/* Resumo com métricas gerais */}
                            {sessions.length > 0 && (
                                <div className="">
                                    <MusiSummaryCard
                                        sessions={sessions}
                                        chartData={chartData}
                                        chartLoading={chartLoading}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Barra de ações fixa no rodapé */}
                        <div className="mt-4">
                            <MusiProgramActionBar program={program} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
