import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, FileDown, FileText } from 'lucide-react';
import { FiltersBar } from '../gerar-relatorio/components/FiltersBar';
import { KpiCards } from '../gerar-relatorio/components/KpiCards';
import { DualLineProgress } from '../gerar-relatorio/components/DualLineProgress';
import { PatientSelector, type Patient } from '../../programas/consultar-programas/components';
import { OcpDeadlineCard } from '../gerar-relatorio/components/OcpDeadlineCard';
import { AttentionStimuliCard } from '../../programas/relatorio-geral/components/AttentionStimuliCard';
import { SaveReportDialog } from '../components';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '../../../components/ui/rich-text-editor';
import {
    fetchKpis,
    fetchSerieLinha,
    fetchPrazoPrograma,
} from '../gerar-relatorio/services/relatorio.service';
import type { Filters, KpisRelatorio, SerieLinha, PrazoPrograma } from '../gerar-relatorio/types';
import type { SavedReport } from '../types';
import { ReportExporter } from '../gerar-relatorio/print/ReportExporter';
import { useAuth } from '@/features/auth';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

export function GerarRelatorioPage() {
    const { user } = useAuth();
    const { setPageTitle, setHeaderActions } = usePageTitle();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [observacaoClinica, setObservacaoClinica] = useState<string>('');
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    const [kpis, setKpis] = useState<KpisRelatorio | null>(null);
    const [serieLinha, setSerieLinha] = useState<SerieLinha[]>([]);
    const [prazoPrograma, setPrazoPrograma] = useState<PrazoPrograma | null>(null);

    const [loadingKpis, setLoadingKpis] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);

    // Estados para os filtros (programas, estímulos, terapeutas)
    const [programas, _setProgramas] = useState<{ id: string; nome: string }[]>([]);
    const [estimulos, _setEstimulos] = useState<{ id: string; nome: string }[]>([]);
    const [terapeutas, _setTerapeutas] = useState<{ id: string; nome: string }[]>([]);

    // 🔄 Lê filtros da URL
    const [filters, setFilters] = useState<Filters>(() => {
        const periodo = searchParams.get('periodo') || '30d';
        const periodoStart = searchParams.get('periodoStart');
        const periodoEnd = searchParams.get('periodoEnd');
        
        return {
            pacienteId: searchParams.get('pacienteId') || undefined,
            periodo: periodo === 'custom' && periodoStart && periodoEnd
                ? { mode: 'custom', start: periodoStart, end: periodoEnd }
                : { mode: periodo as '30d' | '90d' },
            programaId: searchParams.get('programaId') || undefined,
            estimuloId: searchParams.get('estimuloId') || undefined,
            terapeutaId: searchParams.get('terapeutaId') || undefined,
            comparar: searchParams.get('comparar') === 'true',
        };
    });

    // 🔄 Sincroniza filtros com URL
    const syncFiltersToUrl = useCallback((newFilters: Filters) => {
        const params = new URLSearchParams();
        
        if (newFilters.pacienteId) params.set('pacienteId', newFilters.pacienteId);
        if (newFilters.programaId) params.set('programaId', newFilters.programaId);
        if (newFilters.estimuloId) params.set('estimuloId', newFilters.estimuloId);
        if (newFilters.terapeutaId) params.set('terapeutaId', newFilters.terapeutaId);
        if (newFilters.comparar) params.set('comparar', 'true');
        
        // Período
        if (newFilters.periodo.mode === 'custom') {
            params.set('periodo', 'custom');
            if (newFilters.periodo.start) params.set('periodoStart', newFilters.periodo.start);
            if (newFilters.periodo.end) params.set('periodoEnd', newFilters.periodo.end);
        } else {
            params.set('periodo', newFilters.periodo.mode);
        }
        
        setSearchParams(params);
    }, [setSearchParams]);

    // 🔄 Atualiza filtros quando URL mudar (botão voltar, por exemplo)
    useEffect(() => {
        const periodo = searchParams.get('periodo') || '30d';
        const periodoStart = searchParams.get('periodoStart');
        const periodoEnd = searchParams.get('periodoEnd');
        
        setFilters(prev => ({
            ...prev,
            pacienteId: searchParams.get('pacienteId') || undefined,
            periodo: periodo === 'custom' && periodoStart && periodoEnd
                ? { mode: 'custom', start: periodoStart, end: periodoEnd }
                : { mode: periodo as '30d' | '90d' },
            programaId: searchParams.get('programaId') || undefined,
            estimuloId: searchParams.get('estimuloId') || undefined,
            terapeutaId: searchParams.get('terapeutaId') || undefined,
            comparar: searchParams.get('comparar') === 'true',
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const loadData = useCallback(async (currentFilters: Filters) => {
        try {
            setLoadingKpis(true);
            const kpisData = await fetchKpis(currentFilters);
            setKpis(kpisData);
            setLoadingKpis(false);

            setLoadingCharts(true);
            const [serieLinhaData, prazoProgramaData] = await Promise.all([
                fetchSerieLinha(currentFilters),
                fetchPrazoPrograma(currentFilters),
            ]);

            setSerieLinha(Array.isArray(serieLinhaData) ? serieLinhaData : []);
            setPrazoPrograma(prazoProgramaData);
            setLoadingCharts(false);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
            // Garantir que os estados sejam definidos mesmo em caso de erro
            setSerieLinha([]);
            setLoadingKpis(false);
            setLoadingCharts(false);
        }
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            loadData(filters);
        }
    }, [filters, selectedPatient, loadData]);

    useEffect(() => {
        const isHighLevel = user?.perfil_acesso === 'gerente' || user?.perfil_acesso === 'coordenador executivo';

        setFilters(prev => {
            // caso gerente/coordenador -> limpa terapeutaId
            if (isHighLevel && prev.terapeutaId) {
            console.log('Removendo terapeutaId por perfil de alto nível');
            return { ...prev, terapeutaId: undefined };
            }

            if (user?.id && !isHighLevel && !prev.terapeutaId) {
                return { ...prev, terapeutaId: user.id };
            }
            return prev;
        });
    }, [user])

    const sanitizeForFileName = (value: string) =>
        value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase();

    const documentTitle = useMemo(() => {
        if (!selectedPatient) {
            return undefined;
        }

        const patientSlug = sanitizeForFileName(selectedPatient.name || 'cliente');
        return `relatorio_${patientSlug}`;
    }, [selectedPatient]);

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        const newFilters = {
            ...filters,
            pacienteId: patient.id,
        };
        setFilters(newFilters);
        syncFiltersToUrl(newFilters);
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
        const newFilters = {
            ...filters,
            pacienteId: undefined,
        };
        setFilters(newFilters);
        syncFiltersToUrl(newFilters);
    };

    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
        syncFiltersToUrl(newFilters);
    };

    // Handler para salvar o relatório (COM GERAÇÃO DE PDF)
    const handleSaveReport = async (title: string): Promise<SavedReport> => {
        if (!selectedPatient) {
            throw new Error('Nenhum paciente selecionado');
        }

        // PASSO 1: Gerar PDF da tela atual
        toast.info('Gerando PDF do relatório...', { duration: 2000 });
        
        const reportElement = document.querySelector('[data-report-exporter]') as HTMLElement;
        if (!reportElement) {
            throw new Error('Conteúdo do relatório não encontrado');
        }

        // Configurações do PDF
        const pdfFileName = `relatorio_${sanitizeForFileName(selectedPatient.name)}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        const opt = {
            margin: 10,
            filename: pdfFileName,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' as const
            }
        };

        let pdfBlob: Blob;
        try {
            pdfBlob = await html2pdf()
                .set(opt)
                .from(reportElement)
                .output('blob');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw new Error('Erro ao gerar PDF do relatório');
        }

        // PASSO 2: Determinar o período com base nos filtros
        let periodStart: string;
        let periodEnd: string = new Date().toISOString().split('T')[0]; // ISO Date (YYYY-MM-DD)

        if (filters.periodo.mode === 'custom' && filters.periodo.start && filters.periodo.end) {
            periodStart = filters.periodo.start;
            periodEnd = filters.periodo.end;
        } else if (filters.periodo.mode === '90d') {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 90);
            periodStart = startDate.toISOString().split('T')[0];
        } else {
            // Default: 30 dias
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            periodStart = startDate.toISOString().split('T')[0];
        }

        // PASSO 3: Construir FormData com PDF + dados do relatório
        toast.info('Salvando relatório...', { duration: 2000 });

        const formData = new FormData();
        formData.append('pdf', pdfBlob, pdfFileName);
        formData.append('title', title);
        formData.append('type', 'mensal');
        formData.append('patientId', selectedPatient.id);
        formData.append('therapistId', ''); // TODO: pegar do contexto de autenticação
        formData.append('periodStart', periodStart);
        formData.append('periodEnd', periodEnd);
        formData.append('clinicalObservations', observacaoClinica);
        formData.append('status', 'final');

        // Adicionar dados estruturados (filtros e dados gerados)
        const periodo: import('../types').ReportPeriod = {
            mode: filters.periodo.mode,
            start: periodStart,
            end: periodEnd,
        };

        const structuredData = {
            filters: {
                pacienteId: selectedPatient.id,
                periodo,
                programaId: filters.programaId,
                estimuloId: filters.estimuloId,
                terapeutaId: filters.terapeutaId,
                comparar: filters.comparar,
            },
            generatedData: {
                kpis: kpis ? {
                    acerto: kpis.acerto || 0,
                    independencia: kpis.independencia || 0,
                    tentativas: kpis.tentativas || 0,
                    sessoes: kpis.sessoes || 0,
                    assiduidade: kpis.assiduidade,
                    gapIndependencia: kpis.gapIndependencia,
                } : {
                    acerto: 0,
                    independencia: 0,
                    tentativas: 0,
                    sessoes: 0,
                },
                graphic: serieLinha.map(item => ({
                    x: item.x || '',
                    acerto: item.acerto || 0,
                    independencia: item.independencia || 0,
                })),
                programDeadline: prazoPrograma ? {
                    percent: prazoPrograma.percent || 0,
                    label: prazoPrograma.label || '',
                    inicio: prazoPrograma.inicio,
                    fim: prazoPrograma.fim,
                } : undefined,
            },
        };

        formData.append('data', JSON.stringify(structuredData));

        // PASSO 4: Enviar para o backend
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/relatorios`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao salvar relatório');
            }

            const savedReport: SavedReport = await response.json();
            
            toast.success('Relatório salvo com sucesso!');
            
            return savedReport;
        } catch (error) {
            console.error('Erro ao salvar relatório:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar relatório');
            throw error;
        }
    };

    // Labels para o resumo de filtros no PDF
    const getPeriodoLabel = () => {
        if (filters.periodo.mode === '30d') return 'Últimos 30 dias';
        if (filters.periodo.mode === '90d') return 'Últimos 90 dias';
        if (filters.periodo.mode === 'custom' && filters.periodo.start && filters.periodo.end) {
            const start = new Date(filters.periodo.start).toLocaleDateString('pt-BR');
            const end = new Date(filters.periodo.end).toLocaleDateString('pt-BR');
            return `${start} até ${end}`;
        }
        return 'Período não especificado';
    };

    const getProgramaLabel = () => {
        if (!filters.programaId) return 'Todos os programas';
        if (!Array.isArray(programas)) return 'Todos os programas';
        const programa = programas.find((p) => p.id === filters.programaId);
        return programa?.nome || filters.programaId;
    };

    const getEstimuloLabel = () => {
        if (!filters.estimuloId) return 'Todos os estímulos';
        if (!Array.isArray(estimulos)) return 'Todos os estímulos';
        const estimulo = estimulos.find((e) => e.id === filters.estimuloId);
        return estimulo?.nome || filters.estimuloId;
    };

    const getTerapeutaLabel = () => {
        if (!filters.terapeutaId) return 'Todos os terapeutas';
        if (!Array.isArray(terapeutas)) {
            console.warn('Terapeutas não é um array:', terapeutas);
            return 'Todos os terapeutas';
        }
        console.log('Buscando terapeuta com ID:', filters.terapeutaId);
        console.log('Lista de terapeutas disponível:', terapeutas);
        const terapeuta = terapeutas.find((t) => t.id === filters.terapeutaId);
        console.log('Terapeuta encontrado:', terapeuta);
        return terapeuta?.nome || filters.terapeutaId;
    };

    // Configurar título e botões do header
    useEffect(() => {
        setPageTitle('Painel de Progresso - Programas & Objetivos');
    }, [setPageTitle]);

    useEffect(() => {
        if (selectedPatient) {
            setHeaderActions(
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setSaveDialogOpen(true)}
                        className="h-10 rounded-full gap-2"
                        variant="default"
                    >
                        <Save className="h-4 w-4" />
                        Salvar Relatório
                    </Button>
                    <Button
                        onClick={() => {
                            toast.info('Funcionalidade em desenvolvimento');
                        }}
                        className="h-10 rounded-full gap-2"
                        variant="outline"
                    >
                        <FileDown className="h-4 w-4" />
                        Exportar PDF
                    </Button>
                </div>
            );
        } else {
            setHeaderActions(null);
        }

        return () => setHeaderActions(null);
    }, [selectedPatient, setHeaderActions]);

    return (
        <div className="flex flex-col w-full h-full">
            {selectedPatient ? (
                <>
                    <ReportExporter 
                        documentTitle={documentTitle}
                        onSave={() => setSaveDialogOpen(true)}
                        hideButton={true}
                    >
                        <div className="space-y-4 p-4">
                        {/* Bloco de Cliente - aparece em tela e PDF */}
                        <div data-print-program-header>
                            <PatientSelector
                                selected={selectedPatient}
                                onSelect={handlePatientSelect}
                                onClear={handlePatientClear}
                            />
                        </div>

                        {/* Observação Clínica - aparece em tela e PDF */}
                        <div data-print-block className="bg-muted/30 border border-border rounded-[5px] p-4 space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-semibold">
                                <FileText className="w-4 h-4" />
                                Observação Clínica (Relatório)
                            </Label>
                            <RichTextEditor
                                placeholder="Adicione observações relevantes sobre o progresso do cliente, comportamentos observados durante as sessões, ou informações importantes para o relatório..."
                                value={observacaoClinica}
                                onChange={(html) => setObservacaoClinica(html)}
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1 no-print">
                                💡 Esta observação será incluída automaticamente no relatório PDF
                            </p>
                        </div>

                        {/* Filtros interativos - só aparece na tela */}
                        <div className="no-print">
                            <FiltersBar 
                                value={filters} 
                                onChange={handleFiltersChange} 
                            />
                        </div>

                        {/* Resumo de filtros - só aparece no PDF */}
                        <div
                            data-print-only
                            data-print-filters-summary
                            data-print-block
                            className="hidden"
                        >
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-primary mb-2">
                                    Filtros Aplicados
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="chip">
                                        <strong>Período:</strong> {getPeriodoLabel()}
                                    </span>
                                    <span className="chip">
                                        <strong>Programa:</strong> {getProgramaLabel()}
                                    </span>
                                    <span className="chip">
                                        <strong>Estímulo:</strong> {getEstimuloLabel()}
                                    </span>
                                    <span className="chip">
                                        <strong>Terapeuta:</strong> {getTerapeutaLabel()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* KPIs */}
                        {kpis && (
                            <section data-print-block>
                                <KpiCards data={kpis} loading={loadingKpis} />
                            </section>
                        )}

                        {/* Gráfico de Evolução */}
                        <section data-print-block data-print-wide>
                            <div data-print-chart>
                                <DualLineProgress data={serieLinha} loading={loadingCharts} />
                            </div>
                        </section>

                        {/* Estímulos que precisam de atenção */}
                        <section data-print-block data-print-wide>
                            <AttentionStimuliCard
                                pacienteId={selectedPatient?.id || ''}
                                programaId={filters.programaId}
                                terapeutaId={filters.terapeutaId}
                                periodo={filters.periodo}
                            />
                        </section>

                        {/* Prazo do Programa */}
                        <section data-print-block data-print-wide>
                            <OcpDeadlineCard
                                inicio={prazoPrograma?.inicio}
                                fim={prazoPrograma?.fim}
                                percent={prazoPrograma?.percent}
                                label={prazoPrograma?.label}
                                loading={loadingCharts}
                            />
                        </section>
                    </div>
                </ReportExporter>

                {/* Dialog de Salvamento */}
                <SaveReportDialog
                    open={saveDialogOpen}
                    onOpenChange={setSaveDialogOpen}
                    onSave={handleSaveReport}
                    defaultTitle={`Relatório ${selectedPatient.name} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
                />
                </>
            ) : (
                <div className="flex flex-col w-full h-full">
                    <div className="px-6 pt-6 pb-2">
                        <h1
                            className="text-2xl font-medium text-primary"
                            style={{ fontFamily: 'Sora, sans-serif' }}
                        >
                            Painel de Progresso - Programas & Objetivos
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Análise completa do desempenho e evolução do cliente
                        </p>
                    </div>
                    <div className="space-y-4 md:space-y-6 px-6 pb-6">
                        <PatientSelector
                            selected={selectedPatient}
                            onSelect={handlePatientSelect}
                            onClear={handlePatientClear}
                        />

                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                                Selecione um cliente para visualizar o relatório
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
