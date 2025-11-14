import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { 
    saveReportToBackend, 
    exportPdfDirectly,
    sanitizeForFileName
} from '../services/pdf-export.service';

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
    const [programas, setProgramas] = useState<{ id: string; nome: string }[]>([]);
    const [estimulos, setEstimulos] = useState<{ id: string; nome: string }[]>([]);
    const [terapeutas, setTerapeutas] = useState<{ id: string; nome: string }[]>([]);
    
    // Estados para os nomes dos filtros selecionados
    const [programaNome, setProgramaNome] = useState<string>('');
    const [estimuloNome, setEstimuloNome] = useState<string>('');
    const [terapeutaNome, setTerapeutaNome] = useState<string>('');

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

    // Carregar terapeutas
    useEffect(() => {
        console.log('🔄 Carregando terapeutas...');
        fetch('/api/terapeutas/relatorio')
            .then(res => {
                console.log('📡 Resposta terapeutas:', res.status);
                return res.json();
            })
            .then(response => {
                console.log('📦 Response completo terapeutas:', response);
                const data = response.data || response; // Tentar response.data primeiro
                console.log('📦 Dados terapeutas recebidos:', data);
                if (Array.isArray(data)) {
                    setTerapeutas(data);
                    console.log('✅ Terapeutas salvos:', data.length);
                } else {
                    console.warn('⚠️ Dados terapeutas não é array:', data);
                }
            })
            .catch(err => console.error('❌ Erro ao carregar terapeutas:', err));
    }, []);

    // Carregar programas quando houver paciente
    useEffect(() => {
        if (filters.pacienteId) {
            console.log('🔄 Carregando programas para paciente:', filters.pacienteId);
            fetch(`/api/ocp/reports/filters/programs?clientId=${filters.pacienteId}`)
                .then(res => {
                    console.log('📡 Resposta programas:', res.status);
                    return res.json();
                })
                .then(response => {
                    console.log('📦 Response completo programas:', response);
                    const data = response.data || response; // Tentar response.data primeiro
                    console.log('📦 Dados programas recebidos:', data);
                    if (Array.isArray(data)) {
                        setProgramas(data);
                        console.log('✅ Programas salvos:', data.length);
                    } else {
                        console.warn('⚠️ Dados programas não é array:', data);
                    }
                })
                .catch(err => console.error('❌ Erro ao carregar programas:', err));
        }
    }, [filters.pacienteId]);

    // Carregar estímulos quando houver paciente/programa
    useEffect(() => {
        if (filters.pacienteId) {
            const url = `/api/ocp/reports/filters/stimulus?clientId=${filters.pacienteId}${filters.programaId ? `&programaId=${filters.programaId}` : ''}`;
            console.log('🔄 Carregando estímulos:', url);
            fetch(url)
                .then(res => {
                    console.log('📡 Resposta estímulos:', res.status);
                    return res.json();
                })
                .then(response => {
                    console.log('📦 Response completo estímulos:', response);
                    const data = response.data || response; // Tentar response.data primeiro
                    console.log('📦 Dados estímulos recebidos:', data);
                    if (Array.isArray(data)) {
                        setEstimulos(data);
                        console.log('✅ Estímulos salvos:', data.length);
                    } else {
                        console.warn('⚠️ Dados estímulos não é array:', data);
                    }
                })
                .catch(err => console.error('❌ Erro ao carregar estímulos:', err));
        }
    }, [filters.pacienteId, filters.programaId]);

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

    // Atualizar nomes quando os arrays mudarem
    useEffect(() => {
        if (filters.programaId && programas.length > 0) {
            const programa = programas.find(p => String(p.id) === String(filters.programaId));
            setProgramaNome(programa?.nome || '');
        }
    }, [filters.programaId, programas]);

    useEffect(() => {
        if (filters.estimuloId && estimulos.length > 0) {
            const estimulo = estimulos.find(e => String(e.id) === String(filters.estimuloId));
            setEstimuloNome(estimulo?.nome || '');
        }
    }, [filters.estimuloId, estimulos]);

    useEffect(() => {
        if (filters.terapeutaId && terapeutas.length > 0) {
            const terapeuta = terapeutas.find(t => t.id === filters.terapeutaId);
            setTerapeutaNome(terapeuta?.nome || '');
        }
    }, [filters.terapeutaId, terapeutas]);


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

        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        // Validar se há dados para salvar
        if (!kpis) {
            toast.error('Aguarde o carregamento dos dados do relatório');
            throw new Error('Dados do relatório ainda não foram carregados');
        }

        // Localizar o elemento do relatório
        const reportElement = document.querySelector('[data-report-exporter]') as HTMLElement;
        if (!reportElement) {
            throw new Error('Conteúdo do relatório não encontrado');
        }

        // Calcular start e end baseado no modo do período
        const calculatePeriodDates = () => {
            if (filters.periodo.mode === 'custom') {
                return {
                    start: filters.periodo.start || new Date().toISOString().split('T')[0],
                    end: filters.periodo.end || new Date().toISOString().split('T')[0],
                };
            }

            const days = filters.periodo.mode === '90d' ? 90 : 30;
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            return {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
            };
        };

        const { start, end } = calculatePeriodDates();

        // Preparar dados gerados do relatório
        const generatedData = {
            kpis: {
                acerto: kpis.acerto || 0,
                independencia: kpis.independencia || 0,
                tentativas: kpis.tentativas || 0,
                sessoes: kpis.sessoes || 0,
                assiduidade: kpis.assiduidade,
                gapIndependencia: kpis.gapIndependencia,
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
        };

        // Usar o serviço otimizado para salvar
        try {
            const savedReport = await saveReportToBackend({
                title,
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                therapistId: user.id,
                filters: {
                    pacienteId: selectedPatient.id,
                    periodo: {
                        mode: filters.periodo.mode,
                        start,
                        end,
                    },
                    programaId: filters.programaId,
                    estimuloId: filters.estimuloId,
                    terapeutaId: filters.terapeutaId,
                    comparar: filters.comparar,
                },
                generatedData,
                clinicalObservations: observacaoClinica || '',
                reportElement,
            });

            return savedReport;
        } catch (error) {
            // Erro já tratado pelo serviço
            throw error;
        }
    };

    // Handler para exportar PDF diretamente (sem salvar)
    const handleExportPdf = useCallback(async () => {
        if (!selectedPatient) {
            toast.error('Nenhum paciente selecionado');
            return;
        }

        const reportElement = document.querySelector('[data-report-exporter]') as HTMLElement;
        if (!reportElement) {
            toast.error('Conteúdo do relatório não encontrado');
            return;
        }

        const pdfFileName = `relatorio_${sanitizeForFileName(selectedPatient.name)}_${new Date().toISOString().split('T')[0]}.pdf`;

        try {
            await exportPdfDirectly(reportElement, pdfFileName);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            // Toast já exibido pelo serviço
        }
    }, [selectedPatient]);

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
        return programaNome || `Programa ${filters.programaId}`;
    };

    const getEstimuloLabel = () => {
        if (!filters.estimuloId) return 'Todos os estímulos';
        return estimuloNome || `Estímulo ${filters.estimuloId}`;
    };

    const getTerapeutaLabel = () => {
        if (!filters.terapeutaId) return 'Todos os terapeutas';
        return terapeutaNome || filters.terapeutaId;
    };

    // Configurar título e botões do header
    useEffect(() => {
        setPageTitle('Relatórios de Progresso');
    }, [setPageTitle]);

    useEffect(() => {
        if (selectedPatient) {
            setHeaderActions(
                <div className="flex items-center gap-3 no-print">
                    <Button
                        onClick={() => setSaveDialogOpen(true)}
                        className="h-10 rounded-full gap-2"
                        variant="default"
                    >
                        <Save className="h-4 w-4" />
                        Salvar Relatório
                    </Button>
                    <Button
                        onClick={handleExportPdf}
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
    }, [selectedPatient, setHeaderActions, handleExportPdf]);

    return (
        <div className="flex flex-col w-full">
            {selectedPatient ? (
                <>
                    <ReportExporter 
                        documentTitle={documentTitle}
                        onSave={() => setSaveDialogOpen(true)}
                        hideButton={true}
                    >
                        <div data-print-content className="space-y-4 p-4">
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
                <div className="flex flex-col w-full">
                    
                    <div className="space-y-4 md:space-y-6 px-4 pb-4 pt-4 flex-1">
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
