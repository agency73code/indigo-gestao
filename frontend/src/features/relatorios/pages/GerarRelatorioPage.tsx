import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, FileDown, FileText, Sparkles, Loader2 } from 'lucide-react';
import { FiltersBar } from '../gerar-relatorio/components/FiltersBar';
import { KpiCards } from '../gerar-relatorio/components/KpiCards';
import { DualLineProgress } from '../gerar-relatorio/components/DualLineProgress';
import { SessionObservationsCard } from '../gerar-relatorio/components/SessionObservationsCard';
import { PatientSelector, type Patient } from '../../programas/consultar-programas/components';
import { OcpDeadlineCard } from '../gerar-relatorio/components/OcpDeadlineCard';
import { AttentionStimuliCard } from '../../programas/relatorio-geral/components/AttentionStimuliCard';
import { ToKpiCards, ToActivityDurationChart, ToAttentionActivitiesCard, ToAutonomyByCategoryChart } from '../../programas/relatorio-geral/components/to';
import ToPerformanceChart from '../../programas/variants/terapia-ocupacional/components/ToPerformanceChart';
import { FisioKpiCards, FisioActivityDurationChart, FisioAttentionActivitiesCard, FisioAutonomyByCategoryChart } from '../../programas/relatorio-geral/components/fisio';
import FisioPerformanceChart from '../../programas/variants/fisioterapia/components/FisioPerformanceChart';
import { MusiKpiCards, MusiAttentionActivitiesCard, MusiAutonomyByCategoryChart, MusiParticipacaoChart, MusiSuporteChart, MusiParticipacaoSuporteEvolutionChart } from '../../programas/relatorio-geral/components/musi';
import { SaveReportDialog } from '../components';
import { AreaSelectorCard } from '../components/AreaSelectorCard';
import { KpiCardsRenderer } from '../components/KpiCardsRenderer';
import { ChartRenderer } from '../components/ChartRenderer';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '../../../components/ui/rich-text-editor';
import {
    fetchKpis,
    fetchSerieLinha,
    fetchPrazoPrograma,
} from '../gerar-relatorio/services/relatorio.service';
import { fetchOccupationalReports } from '../../programas/relatorio-geral/services/to-report.service';
import { fetchPhysioReports } from '../../programas/relatorio-geral/services/fisio-report.service';
import { fetchMusicReports } from '../../programas/relatorio-geral/services/musi-report.service';
import { listSessionsByPatient } from '../../programas/consulta-sessao/services';
import type { Filters, KpisRelatorio, SerieLinha, PrazoPrograma } from '../gerar-relatorio/types';
import type { SavedReport } from '../types';
import { ReportExporter } from '../gerar-relatorio/print/ReportExporter';
import { useAuth } from '@/features/auth';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useArea } from '@/contexts/AreaContext';
import type { AreaType } from '@/contexts/AreaContext';
import { getAreaConfig } from '../configs';
import { 
    saveReportToBackend, 
    exportPdfDirectly,
    sanitizeForFileName
} from '../services/pdf-export.service';
import { emptyMusiDashboardResult } from '@/features/programas/relatorio-geral';
import { generateClinicalSummaryWithAI } from '../services/ai.service';
import { AIDraftValidationBanner } from '../gerar-relatorio/components/AIDraftValidationBanner';
import { MusiPerformanceChart } from '@/features/programas/variants/musicoterapia/components';

export function GerarRelatorioPage() {
    const { user } = useAuth();
    const { setPageTitle, setHeaderActions, setOnBackClick } = usePageTitle();
    const { setCurrentArea } = useArea();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [observacaoClinica, setObservacaoClinica] = useState<string>('');
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    // Área selecionada (pode ser diferente de currentArea do contexto global)
    const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
    
    // Configuração da área atual
    const areaConfig = useMemo(() => getAreaConfig(selectedArea), [selectedArea]);

    const [kpis, setKpis] = useState<KpisRelatorio | null>(null);
    const [serieLinha, setSerieLinha] = useState<SerieLinha[]>([]);
    const [prazoPrograma, setPrazoPrograma] = useState<PrazoPrograma | null>(null);
    
    // Estado genérico para dados adaptados por área
    const [adaptedData, setAdaptedData] = useState<any>(null);

    const [loadingKpis, setLoadingKpis] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);
    
    // Estado para observações de sessão (modelo Fono)
    const [sessionObservations, setSessionObservations] = useState<Array<{
        id: string;
        data: string;
        programa: string;
        terapeutaNome?: string;
        observacoes: string;
    }>>([]);
    const [loadingObservations, setLoadingObservations] = useState(false);
    
    // Estado para geração de resumo com IA
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiDraftPendingValidation, setAiDraftPendingValidation] = useState(false);

    // Estados para os filtros (programas, estímulos, terapeutas)
    const [programas, setProgramas] = useState<{ id: string; nome: string }[]>([]);
    const [estimulos, setEstimulos] = useState<{ id: string; nome: string }[]>([]);
    const [terapeutas, setTerapeutas] = useState<{ id: string; nome: string }[]>([]);
    
    // Estados para os nomes dos filtros selecionados
    const [programaNome, setProgramaNome] = useState<string>('');
    const [estimuloNome, setEstimuloNome] = useState<string>('');
    const [terapeutaNome, setTerapeutaNome] = useState<string>('');

    // 🔄 Lê filtros da URL (incluindo área)
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

    // Inicializar área selecionada da URL ou contexto
    useEffect(() => {
        const areaFromUrl = searchParams.get('area') as AreaType | null;
        if (areaFromUrl) {
            setSelectedArea(areaFromUrl);
        }
        // Não define área padrão - usuário deve selecionar explicitamente
    }, [searchParams]);  // Só executa uma vez no mount

    // Carregar terapeutas
    useEffect(() => {
        fetch('/api/terapeutas/relatorio')
            .then(res => {
                return res.json();
            })
            .then(response => {
                const data = response.data || response; // Tentar response.data primeiro
                if (Array.isArray(data)) {
                    setTerapeutas(data);
                } else {
                    console.warn('⚠️ Dados terapeutas não é array:', data);
                }
            })
            .catch(err => console.error('❌ Erro ao carregar terapeutas:', err));
    }, []);

    // Carregar programas quando houver paciente
    useEffect(() => {
        if (filters.pacienteId && selectedArea) {
            const areaParam = encodeURIComponent(selectedArea);
            fetch(`/api/ocp/reports/filters/programs?clientId=${filters.pacienteId}&area=${areaParam}`)
                .then(res => {
                    return res.json();
                })
                .then(response => {
                    const data = response.data || response; // Tentar response.data primeiro
                    if (Array.isArray(data)) {
                        setProgramas(data);
                    } else {
                        console.warn('⚠️ Dados programas não é array:', data);
                    }
                })
                .catch(err => console.error('❌ Erro ao carregar programas:', err));
        }
    }, [filters.pacienteId, selectedArea]);

    // Carregar estímulos quando houver paciente/programa
    useEffect(() => {
        if (filters.pacienteId && selectedArea) {
            const url = `/api/ocp/reports/filters/stimulus?clientId=${filters.pacienteId}${filters.programaId ? `&programaId=${filters.programaId}` : ''}&area=${selectedArea}`;
            fetch(url)
                .then(res => {
                    return res.json();
                })
                .then(response => {
                    const data = response.data || response; // Tentar response.data primeiro
                    if (Array.isArray(data)) {
                        setEstimulos(data);
                    } else {
                        console.warn('⚠️ Dados estímulos não é array:', data);
                    }
                })
                .catch(err => console.error('❌ Erro ao carregar estímulos:', err));
        }
    }, [filters.pacienteId, filters.programaId, selectedArea]);

    // 🔄 Sincroniza filtros com URL (incluindo área)
    const syncFiltersToUrl = useCallback((newFilters: Filters, area?: AreaType | null) => {
        const params = new URLSearchParams();
        
        if (newFilters.pacienteId) params.set('pacienteId', newFilters.pacienteId);
        if (newFilters.programaId) params.set('programaId', newFilters.programaId);
        if (newFilters.estimuloId) params.set('estimuloId', newFilters.estimuloId);
        if (newFilters.terapeutaId) params.set('terapeutaId', newFilters.terapeutaId);
        if (newFilters.comparar) params.set('comparar', 'true');

        // Adiciona área à URL
        if (area) params.set('area', area);

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


    const loadData = useCallback(async (currentFilters: Filters, area: AreaType | null) => {
        if (!area) {
            console.warn('Área não selecionada para carregar dados');
            return;
        }

        if (!currentFilters.pacienteId) {
            console.warn('Paciente não selecionado');
            return;
        }

        const config = getAreaConfig(area);
        
        const filtersWithArea = { ...currentFilters, area };
        try {
            setLoadingKpis(true);
            setLoadingCharts(true);

            // 🎯 TRATAMENTO ESPECÍFICO PARA TO
            if (area === 'terapia-ocupacional') {
                try {
                    // Carregar sessões de TO do paciente
                    const sessionsResponse = await listSessionsByPatient(
                        currentFilters.pacienteId,
                        'terapia-ocupacional',
                        {
                            dateRange: currentFilters.periodo.mode,
                            periodStart: currentFilters.periodo.start,
                            periodEnd: currentFilters.periodo.end,
                            programId: currentFilters.programaId,
                            therapistId: currentFilters.terapeutaId,
                            stimulusId: currentFilters.estimuloId,
                            sort: 'date-asc',
                        }
                    );
                    
                    const sessoes = await fetchOccupationalReports(sessionsResponse.items);
                        
                    // Carregar prazo do programa
                    const prazoProgramaData = await fetchPrazoPrograma(filtersWithArea);
                    setPrazoPrograma(prazoProgramaData);
                    
                    // Armazenar dados adaptados
                    setSessionObservations(sessoes.sessionObservations ?? []);
                    setAdaptedData({
                        kpis: sessoes.kpis,
                        performanceLineData: sessoes.performance,
                        activityDuration: sessoes.activityDurationData,
                        attentionActivities: sessoes.attentionActivitiesData,
                        autonomyByCategory: sessoes.autonomyByCategory,
                    });
                } catch (error) {
                    console.error('Erro ao carregar dados de TO:', error);

                    setAdaptedData({
                        emptyMusiDashboardResult
                    });
                }

                setLoadingKpis(false);
                setLoadingCharts(false);
                return;
            }

            // 🎯 TRATAMENTO ESPECÍFICO PARA MUSICOTERAPIA (usa mesmo layout de TO)
            if (area === 'musicoterapia') {
                try {
                    // Carregar sessões de Musicoterapia do paciente
                    const sessionsResponse = await listSessionsByPatient(
                        currentFilters.pacienteId,
                        'musicoterapia',
                        {
                            dateRange: currentFilters.periodo.mode,
                            periodStart: currentFilters.periodo.start,
                            periodEnd: currentFilters.periodo.end,
                            programId: currentFilters.programaId,
                            therapistId: currentFilters.terapeutaId,
                            stimulusId: currentFilters.estimuloId,
                            sort: 'date-asc',
                        }
                    );
                    const sessoes = await fetchMusicReports(sessionsResponse.items);

                    setSessionObservations(sessoes.sessionObservations ?? []);

                    // Carregar prazo do programa
                    const prazoProgramaData = await fetchPrazoPrograma(filtersWithArea);
                    setPrazoPrograma(prazoProgramaData);

                    // Armazenar dados adaptados
                    setAdaptedData({
                        kpis: sessoes.kpis,
                        performanceLineData: sessoes.performance,
                        attentionActivities: sessoes.prepareMusiAttentionActivities,
                        autonomyByCategory: sessoes.prepareMusiAutonomyByCategory,
                        participacao: sessoes.calculateAverageAndTrend.participation,
                        suporte: sessoes.calculateAverageAndTrend.support,
                        evolution: sessoes.prepareMusiEvolutionData,
                    });
                } catch (error) {
                    console.error('Erro ao carregar dados de Musicoterapia:', error);

                    setAdaptedData({
                        emptyMusiDashboardResult
                    });
                }

                setLoadingKpis(false);
                setLoadingCharts(false);
                return;
            }

            // 🎯 TRATAMENTO PARA MODELO FONO (Fonoaudiologia, Psicopedagogia, Terapia ABA)
            const fonoModelAreas = ['fonoaudiologia', 'psicopedagogia', 'terapia-aba'];
            
            // 🎯 TRATAMENTO PARA MODELO FISIO (Fisioterapia, Psicomotricidade, Educação Física)
            const fisioModelAreas = ['fisioterapia', 'psicomotricidade', 'educacao-fisica'];
            if (fisioModelAreas.includes(area)) {
                try {
                    // Carregar sessões do paciente filtradas pela área específica
                    const sessionsResponse = await listSessionsByPatient(
                        currentFilters.pacienteId,
                        area, // Usa a área real para filtrar os dados corretos
                        {
                            dateRange: currentFilters.periodo.mode,
                            periodStart: currentFilters.periodo.start,
                            periodEnd: currentFilters.periodo.end,
                            programId: currentFilters.programaId,
                            therapistId: currentFilters.terapeutaId,
                            stimulusId: currentFilters.estimuloId,
                            sort: 'date-asc',
                        }
                    );

                    const sessoes = sessionsResponse.items || [];

                    // Novo formato com solicitação unica para o backend
                    const report = await fetchPhysioReports(sessoes);

                    setSessionObservations(report.sessionObservations ?? []);

                    // Carregar prazo do programa
                    const prazoProgramaData = await fetchPrazoPrograma(filtersWithArea); // tenho que analisar esse 
                    setPrazoPrograma(prazoProgramaData);

                    setAdaptedData({
                        kpis: report.kpis,
                        performance: report.performance,
                        activityDuration: report.activityDuration,
                        attentionActivities: report.attentionActivities,
                        autonomyByCategory: report.autonomyByCategory,
                    });
                } catch (error) {
                    console.error('Erro ao carregar dados de Fisio:', error);
                    setSessionObservations([]);

                    setAdaptedData({
                        kpis: [],
                        performance: [],
                        activityDuration: [],
                        attentionActivities: [],
                        autonomyByCategory: [],
                    });
                }

                setLoadingKpis(false);
                setLoadingCharts(false);
                return;
            }

            // Para áreas com config customizada (exceto TO, Fisio e Musi), usar endpoint específico
            if (config.apiEndpoint !== '/api/ocp/reports') {
                // TODO: Implementar fetch para outros endpoints quando backend estiver pronto
                // Por enquanto, mantém dados vazios
                setKpis(null);
                setSerieLinha([]);
                setPrazoPrograma(null);
                setAdaptedData(null);
                setLoadingKpis(false);
                setLoadingCharts(false);
                return;
            }

            // Modelo Fono (Fonoaudiologia, Psicopedagogia, Terapia ABA) usa endpoint atual
            if (!fonoModelAreas.includes(area)) {
                // Área não reconhecida - mantém dados vazios
                setKpis(null);
                setSerieLinha([]);
                setPrazoPrograma(null);
                setAdaptedData(null);
                setLoadingKpis(false);
                setLoadingCharts(false);
                return;
            }

            const kpisData = await fetchKpis(filtersWithArea);
            setKpis(kpisData);
            setLoadingKpis(false);
            
            // TODO: Arrumar isso aqui que ta sinistro

            // Carregar sessões para extrair observações (modelo Fono)
            setLoadingObservations(true);
            try {
                const sessionsResponse = await listSessionsByPatient(
                    currentFilters.pacienteId,
                    area,
                    {
                        dateRange: currentFilters.periodo.mode,
                        periodStart: currentFilters.periodo.start,
                        periodEnd: currentFilters.periodo.end,
                        programId: currentFilters.programaId,
                        therapistId: currentFilters.terapeutaId,
                        stimulusId: currentFilters.estimuloId,
                        sort: 'date-desc',
                    }
                );
                
                const sessoes = sessionsResponse.items || [];
                
                // Extrair observações das sessões
                const observations = sessoes
                    .filter((s: any) => s.observacoes && s.observacoes.trim() !== '')
                    .map((s: any) => ({
                        id: s.id,
                        data: s.data,
                        programa: s.programa || '',
                        terapeutaNome: s.terapeutaNome,
                        observacoes: s.observacoes,
                    }));
                
                setSessionObservations(observations ?? []);
            } catch (error) {
                console.error('Erro ao carregar observações de sessão:', error);
                setSessionObservations([]);
            } finally {
                setLoadingObservations(false);
            }

            const [serieLinhaData, prazoProgramaData] = await Promise.all([
                fetchSerieLinha(filtersWithArea),
                fetchPrazoPrograma(filtersWithArea),
            ]);

            setSerieLinha(Array.isArray(serieLinhaData) ? serieLinhaData : []);
            setPrazoPrograma(prazoProgramaData);
            
            // Aplicar adapter se disponível
            if (config.dataAdapter) {
                const rawData = {
                    kpis: kpisData,
                    graphic: serieLinhaData,
                    programDeadline: prazoProgramaData,
                };
                const adapted = config.dataAdapter(rawData);
                setAdaptedData(adapted);
            }
            
            setLoadingCharts(false);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
            setSerieLinha([]);
            setLoadingKpis(false);
            setLoadingCharts(false);
        }
    }, []);

    useEffect(() => {
        if (selectedPatient && selectedArea) {
            loadData(filters, selectedArea);
        }
    }, [filters, selectedPatient, selectedArea, loadData]);

    useEffect(() => {
        const isHighLevel = user?.perfil_acesso === 'gerente' || user?.perfil_acesso === 'coordenador executivo';

        setFilters(prev => {
            // caso gerente/coordenador -> limpa terapeutaId
            if (isHighLevel && prev.terapeutaId) {
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
        syncFiltersToUrl(newFilters, selectedArea);
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
        const newFilters = {
            ...filters,
            pacienteId: undefined,
        };
        setFilters(newFilters);
        syncFiltersToUrl(newFilters, selectedArea);
    };

    const handleFiltersChange = (newFilters: Filters) => {
        const filtersWithArea = { ...newFilters, area: selectedArea ?? newFilters.area };
        setFilters(filtersWithArea);
        syncFiltersToUrl(filtersWithArea, selectedArea);
    };

    const handleAreaChange = (area: AreaType | null) => {
        setSelectedArea(area);
        const nextFilters = { ...filters, area };
        setFilters(nextFilters);

        if (area) {
            setCurrentArea(area); // Atualiza contexto global também
        }
        syncFiltersToUrl(nextFilters, area);
        
        // Recarregar dados com nova área
        if (selectedPatient && area) {
            loadData(nextFilters, area);
        }
    };
    
    // Handler para gerar rascunho com IA
    const handleGenerateWithAI = async () => {
        if (sessionObservations.length === 0) {
            toast.error('Não há observações de sessão para analisar. Selecione um período com sessões registradas.');
            return;
        }

        if (!selectedPatient) {
            toast.error('Selecione um paciente primeiro.');
            return;
        }

        setGeneratingAI(true);

        try {
            const periodLabel = filters.periodo.mode === '30d' 
                ? 'Últimos 30 dias' 
                : filters.periodo.mode === '90d'
                    ? 'Últimos 90 dias'
                    : `${filters.periodo.start || ''} a ${filters.periodo.end || ''}`;

            const result = await generateClinicalSummaryWithAI({
                observations: sessionObservations,
                patientName: selectedPatient.name,
                area: areaConfig.label,
                periodLabel,
            });

            // Inserir no editor (sem disclaimer inline - usamos banner separado)
            const formattedContent = `<p>${result.summary.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;
            setObservacaoClinica(formattedContent);
            
            // Ativar estado de validação pendente
            setAiDraftPendingValidation(true);
            
            toast.info(`Rascunho gerado com base em ${result.observationsUsed} observações. Valide o conteúdo antes de salvar.`);
        } catch (error) {
            console.error('Erro ao gerar resumo com IA:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao gerar rascunho com IA');
        } finally {
            setGeneratingAI(false);
        }
    };

    // Handler para validar rascunho gerado por IA
    const handleValidateAIDraft = () => {
        setAiDraftPendingValidation(false);
        toast.success('Rascunho validado! Você pode agora salvar o relatório.');
    };
    
    // Handler para salvar o relatório (COM GERAÇÃO DE PDF)
    const handleSaveReport = async (title: string): Promise<SavedReport> => {
        if (!selectedPatient) {
            throw new Error('Nenhum paciente selecionado');
        }

        // 🆕 Validar área selecionada
        if (!selectedArea) {
            toast.error('Selecione uma área terapêutica para salvar o relatório');
            throw new Error('Nenhuma área terapêutica selecionada');
        }

        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        // Validar se há dados para salvar 
        const reportKpis = kpis || adaptedData?.kpis;
        if (!reportKpis) {
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
        const generatedData: any = {
            kpis: {
                acerto: reportKpis.acerto || 0,
                independencia: reportKpis.independencia || 0,
                tentativas: reportKpis.tentativas || 0,
                sessoes: reportKpis.sessoes || 0,
                assiduidade: reportKpis.assiduidade,
                gapIndependencia: reportKpis.gapIndependencia,
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

        // Adicionar dados específicos de cada área
        if (selectedArea === 'terapia-ocupacional' && adaptedData) {
            generatedData.activityDuration = adaptedData.activityDuration || [];
            generatedData.autonomyByCategory = adaptedData.autonomyByCategory || [];
            generatedData.attentionActivities = adaptedData.attentionActivities || [];
            generatedData.performanceLineData = adaptedData.performanceLineData || [];
            // Sobrescrever kpis com dados específicos de TO
            if (adaptedData.kpis) {
                generatedData.kpis = adaptedData.kpis;
            }
        } else if (['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && adaptedData) {
            // Modelo Fisio (compartilhado entre Fisioterapia, Psicomotricidade e Educação Física)
            generatedData.activityDuration = adaptedData.activityDuration || [];
            generatedData.autonomyByCategory = adaptedData.autonomyByCategory || [];
            generatedData.attentionActivities = adaptedData.attentionActivities || [];
            generatedData.performance = adaptedData.performance || [];
            if (adaptedData.kpis) {
                generatedData.kpis = adaptedData.kpis;
            }
        } else if (selectedArea === 'musicoterapia' && adaptedData) {
            generatedData.autonomyByCategory = adaptedData.autonomyByCategory || [];
            generatedData.attentionActivities = adaptedData.attentionActivities || [];
            generatedData.participacao = adaptedData.participacao || [];
            generatedData.suporte = adaptedData.suporte || [];
            generatedData.evolutionData = adaptedData.evolutionData || [];
            if (adaptedData.kpis) {
                generatedData.kpis = adaptedData.kpis;
            }
        }
        
        // Adicionar observações de sessão para todas as áreas principais
        if (['fonoaudiologia', 'psicopedagogia', 'terapia-aba', 'terapia-ocupacional', 'fisioterapia', 'psicomotricidade', 'educacao-fisica', 'musicoterapia'].includes(selectedArea)) {
            generatedData.sessionObservations = sessionObservations;
        }

        // Usar o serviço otimizado para salvar
        const savedReport = await saveReportToBackend({
            title,
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            therapistId: user.id,
            area: selectedArea,
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

    // Configurar botão de voltar para ir direto à lista de relatórios
    useEffect(() => {
        setOnBackClick(() => () => {
            navigate('/app/relatorios/lista');
        });

        return () => {
            setOnBackClick(undefined);
        };
    }, [setOnBackClick, navigate]);

    useEffect(() => {
        if (selectedPatient && selectedArea) {
            setHeaderActions(
                <div className="flex items-center gap-3 no-print">
                    <Button
                        onClick={() => {
                            if (aiDraftPendingValidation) {
                                toast.warning('Valide o rascunho gerado por IA antes de salvar o relatório.');
                                return;
                            }
                            setSaveDialogOpen(true);
                        }}
                        className="h-10 rounded-full gap-2"
                        variant="default"
                        disabled={aiDraftPendingValidation}
                        title={aiDraftPendingValidation ? 'Valide o rascunho de IA antes de salvar' : undefined}
                    >
                        <Save className="h-4 w-4" />
                        Salvar Relatório
                    </Button>
                    <Button
                        onClick={handleExportPdf}
                        className="h-10 rounded-full gap-2"
                        variant="outline"
                        disabled={aiDraftPendingValidation}
                        title={aiDraftPendingValidation ? 'Valide o rascunho de IA antes de exportar' : undefined}
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
    }, [selectedPatient, selectedArea, setHeaderActions, handleExportPdf, aiDraftPendingValidation]);

    return (
        <div className="flex flex-col w-full">
            {selectedPatient && selectedArea ? (
                <>
                    <ReportExporter 
                        documentTitle={documentTitle}
                        reportTitle={`Relatório de Evolução Terapêutica — ${areaConfig?.label || selectedArea}`}
                        onSave={() => setSaveDialogOpen(true)}
                        hideButton={true}
                        clientInfo={{
                            nome: selectedPatient.name,
                            idade: selectedPatient.age,
                        }}
                        therapistInfo={user ? {
                            nome: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        } : undefined}
                    >
                        <div data-print-content className="space-y-4 p-4">
                        {/* Bloco de Cliente e Área - aparece em tela e PDF */}
                        <div data-print-program-header className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PatientSelector
                                selected={selectedPatient}
                                onSelect={handlePatientSelect}
                                onClear={handlePatientClear}
                            />
                            
                            {/* Seletor de Área - só aparece na tela */}
                            <div className="no-print">
                                <AreaSelectorCard
                                    value={selectedArea}
                                    onChange={handleAreaChange}
                                    disabled={false}
                                />
                            </div>
                        </div>

                        {/* Observação Clínica - aparece em tela e PDF */}
                        <div data-print-block className="bg-muted/30 border border-border rounded-[5px] p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="w-4 h-4" />
                                    Observação Clínica (Relatório)
                                </Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateWithAI}
                                    disabled={generatingAI || sessionObservations.length === 0}
                                    className="gap-2 no-print"
                                >
                                    {generatingAI ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4" />
                                    )}
                                    {generatingAI ? 'Gerando...' : 'Gerar rascunho com IA'}
                                </Button>
                            </div>
                            
                            {/* Banner de validação obrigatória para rascunhos de IA */}
                            {aiDraftPendingValidation && (
                                <AIDraftValidationBanner onValidate={handleValidateAIDraft} />
                            )}
                            
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
                                area={selectedArea}
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
                                        <strong>Área:</strong> {areaConfig.label}
                                    </span>
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

                        {/* KPIs - Modelo Fono (Fonoaudiologia, Psicopedagogia, Terapia ABA) */}
                        {['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && kpis && (
                            <section data-print-block>
                                <KpiCards data={kpis} loading={loadingKpis} />
                            </section>
                        )}
                        
                        {/* KPIs - Terapia Ocupacional */}
                        {selectedArea === 'terapia-ocupacional' && adaptedData?.kpis && (
                            <section data-print-block>
                                <ToKpiCards data={adaptedData.kpis} loading={loadingKpis} />
                            </section>
                        )}
                        
                        {/* KPIs - Modelo Fisio (Fisioterapia, Psicomotricidade, Educação Física) */}
                        {['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && adaptedData?.kpis && (
                            <section data-print-block>
                                <FisioKpiCards data={adaptedData.kpis} loading={loadingKpis} />
                            </section>
                        )}
                        
                        {/* KPIs - Musicoterapia */}
                        {selectedArea === 'musicoterapia' && adaptedData?.kpis && (
                            <section data-print-block>
                                <MusiKpiCards data={adaptedData.kpis} loading={loadingKpis} />
                            </section>
                        )}
                        
                        {/* KPIs - Outras Áreas (genérico) */}
                        {!['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && selectedArea !== 'terapia-ocupacional' && !['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && selectedArea !== 'musicoterapia' && adaptedData?.kpis && (
                            <section data-print-block>
                                <KpiCardsRenderer 
                                    configs={areaConfig.kpis}
                                    data={adaptedData.kpis}
                                    loading={loadingKpis}
                                />
                            </section>
                        )}

                        {/* Gráficos - Modelo Fono (Fonoaudiologia, Psicopedagogia, Terapia ABA) */}
                        {['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && (
                            <section data-print-block data-print-wide>
                                <div data-print-chart>
                                    <DualLineProgress data={serieLinha} loading={loadingCharts} />
                                </div>
                            </section>
                        )}
                        
                        {/* Gráficos - Terapia Ocupacional */}
                        {selectedArea === 'terapia-ocupacional' && adaptedData && (
                            <>
                                {adaptedData.performanceLineData && (
                                    <section data-print-block data-print-wide>
                                        <ToPerformanceChart 
                                            data={adaptedData.performanceLineData} 
                                            loading={loadingCharts}
                                            title="Evolução do Desempenho"
                                            description="Acompanhamento do desempenho nas atividades de vida diária"
                                            metaLabel="Meta: Convergência"
                                        />
                                    </section>
                                )}
                                
                                {/* Gráficos lado a lado: Tempo por Atividade + Autonomia por Categoria */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {adaptedData.activityDuration && (
                                        <section data-print-block>
                                            <div data-print-chart>
                                                <ToActivityDurationChart 
                                                    data={adaptedData.activityDuration} 
                                                    loading={loadingCharts} 
                                                />
                                            </div>
                                        </section>
                                    )}

                                    {/* Autonomia por Categoria - Terapia Ocupacional */}
                                    {adaptedData.autonomyByCategory && (
                                        <section data-print-block>
                                            <div data-print-chart>
                                                <ToAutonomyByCategoryChart 
                                                    data={adaptedData.autonomyByCategory} 
                                                    loading={loadingCharts} 
                                                />
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Atividades com Atenção - Terapia Ocupacional */}
                                {adaptedData.attentionActivities && (
                                    <section data-print-block className="col-span-6">
                                        <ToAttentionActivitiesCard 
                                            data={adaptedData.attentionActivities}
                                            loading={loadingCharts}
                                        />
                                    </section>
                                )}
                            </>
                        )}
                        
                        {/* Gráficos - Modelo Fisio (Fisioterapia, Psicomotricidade, Educação Física) */}
                        {['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && (
                            <>
                                {/* Performance - Modelo Fisio */}
                                {adaptedData?.performance && (
                                    <section data-print-block className="col-span-6">
                                        <div data-print-chart>
                                            <FisioPerformanceChart 
                                                data={adaptedData.performance} 
                                                loading={loadingCharts} 
                                            />
                                        </div>
                                    </section>
                                )}

                                <div className="grid grid-cols-2 gap-6 col-span-6">
                                    {/* Duração de Atividade - Modelo Fisio */}
                                    {adaptedData?.activityDuration && (
                                        <section data-print-block>
                                            <div data-print-chart>
                                                <FisioActivityDurationChart 
                                                    data={adaptedData.activityDuration} 
                                                    loading={loadingCharts} 
                                                />
                                            </div>
                                        </section>
                                    )}

                                    {/* Autonomia por Categoria - Modelo Fisio */}
                                    {adaptedData?.autonomyByCategory && (
                                        <section data-print-block>
                                            <div data-print-chart>
                                                <FisioAutonomyByCategoryChart 
                                                    data={adaptedData.autonomyByCategory} 
                                                    loading={loadingCharts} 
                                                />
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Atividades com Atenção - Modelo Fisio */}
                                {adaptedData?.attentionActivities && (
                                    <section data-print-block className="col-span-6">
                                        <FisioAttentionActivitiesCard 
                                            data={adaptedData.attentionActivities}
                                            loading={loadingCharts}
                                        />
                                    </section>
                                )}
                            </>
                        )}
                        
                        {/* Gráficos - Musicoterapia (usa mesmos componentes de TO) */}
                        {selectedArea === 'musicoterapia' && adaptedData && (
                            <>
                                {adaptedData.performanceLineData && (
                                    <section data-print-block data-print-wide>
                                        <MusiPerformanceChart 
                                            data={adaptedData.performanceLineData} 
                                            loading={loadingCharts}
                                            title="Evolução do Desempenho"
                                            description="Acompanhamento do desempenho nas atividades musicoterapêuticas"
                                            metaLabel="Meta: Convergência"
                                        />
                                    </section>
                                )}
                                
                                {/* Gráficos Radiais: Participação + Suporte (específicos de Musicoterapia) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <section data-print-block>
                                        <div data-print-chart>
                                            <MusiParticipacaoChart 
                                                data={adaptedData.participacao} 
                                                loading={loadingCharts} 
                                            />
                                        </div>
                                    </section>

                                    <section data-print-block>
                                        <div data-print-chart>
                                            <MusiSuporteChart 
                                                data={adaptedData.suporte} 
                                                loading={loadingCharts} 
                                            />
                                        </div>
                                    </section>
                                </div>
                                
                                {/* Gráficos lado a lado: Evolução Participação/Suporte + Autonomia por Categoria */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {adaptedData.evolution && (
                                        <section data-print-block>
                                            <div data-print-chart>
                                                <MusiParticipacaoSuporteEvolutionChart 
                                                    data={adaptedData.evolution} 
                                                    loading={loadingCharts} 
                                                />
                                            </div>
                                        </section>
                                    )}

                                    {/* Autonomia por Categoria - Musicoterapia */}
                                    {adaptedData.autonomyByCategory && (
                                        <section data-print-block>
                                            <div data-print-chart>
                                                <MusiAutonomyByCategoryChart 
                                                    data={adaptedData.autonomyByCategory} 
                                                    loading={loadingCharts} 
                                                />
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Atividades com Atenção - Musicoterapia */}
                                {adaptedData.attentionActivities && (
                                    <section data-print-block className="col-span-6">
                                        <MusiAttentionActivitiesCard 
                                            data={adaptedData.attentionActivities}
                                            loading={loadingCharts}
                                        />
                                    </section>
                                )}
                            </>
                        )}
                        
                        {/* Gráficos - Outras Áreas (genérico) */}
                        {!['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && selectedArea !== 'terapia-ocupacional' && !['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && selectedArea !== 'musicoterapia' && areaConfig.charts.map((chartConfig) => (
                            <section key={chartConfig.type} data-print-block data-print-wide>
                                <div data-print-chart>
                                    <ChartRenderer
                                        config={chartConfig}
                                        data={adaptedData?.[chartConfig.dataKey]}
                                        loading={loadingCharts}
                                    />
                                </div>
                            </section>
                        ))}

                        {/* Estímulos com Atenção - Modelo Fono */}
                        {areaConfig.attentionComponent && ['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && (
                            <section data-print-block data-print-wide>
                                <AttentionStimuliCard
                                    pacienteId={selectedPatient?.id || ''}
                                    programaId={filters.programaId}
                                    terapeutaId={filters.terapeutaId}
                                    periodo={filters.periodo}
                                    area={selectedArea}
                                />
                            </section>
                        )}

                        {/* Prazo do Programa - Modelo Fono */}
                        {areaConfig.deadlineComponent && ['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && (
                            <section data-print-block data-print-wide>
                                <OcpDeadlineCard
                                    inicio={prazoPrograma?.inicio}
                                    fim={prazoPrograma?.fim}
                                    percent={prazoPrograma?.percent}
                                    label={prazoPrograma?.label}
                                    loading={loadingCharts}
                                />
                            </section>
                        )}
                        
                        {/* Observações das Sessões - Modelo Fono */}
                        {['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && (
                            <section data-print-block data-print-wide>
                                <SessionObservationsCard
                                    observations={sessionObservations}
                                    loading={loadingObservations}
                                    maxItems={30}
                                    title="Observações das Sessões"
                                />
                            </section>
                        )}
                        
                        {/* Prazo do Programa - Terapia Ocupacional */}
                        {selectedArea === 'terapia-ocupacional' && prazoPrograma && (
                            <section data-print-block data-print-wide>
                                <OcpDeadlineCard
                                    inicio={prazoPrograma.inicio}
                                    fim={prazoPrograma.fim}
                                    percent={prazoPrograma.percent}
                                    label={prazoPrograma.label}
                                    loading={loadingCharts}
                                />
                            </section>
                        )}
                        
                        {/* Observações das Sessões - Terapia Ocupacional */}
                        {selectedArea === 'terapia-ocupacional' && (
                            <section data-print-block data-print-wide>
                                <SessionObservationsCard
                                    observations={sessionObservations}
                                    loading={loadingObservations}
                                    maxItems={30}
                                    title="Observações das Sessões"
                                />
                            </section>
                        )}
                        
                        {/* Prazo do Programa - Modelo Fisio (Fisioterapia, Psicomotricidade, Educação Física) */}
                        {['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && prazoPrograma && (
                            <section data-print-block data-print-wide>
                                <OcpDeadlineCard
                                    inicio={prazoPrograma.inicio}
                                    fim={prazoPrograma.fim}
                                    percent={prazoPrograma.percent}
                                    label={prazoPrograma.label}
                                    loading={loadingCharts}
                                />
                            </section>
                        )}
                        
                        {/* Observações das Sessões - Modelo Fisio (Fisioterapia, Psicomotricidade, Educação Física) */}
                        {['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(selectedArea) && (
                            <section data-print-block data-print-wide>
                                <SessionObservationsCard
                                    observations={sessionObservations}
                                    loading={loadingObservations}
                                    maxItems={30}
                                    title="Observações das Sessões"
                                />
                            </section>
                        )}
                        
                        {/* Prazo do Programa - Musicoterapia */}
                        {selectedArea === 'musicoterapia' && prazoPrograma && (
                            <section data-print-block data-print-wide>
                                <OcpDeadlineCard
                                    inicio={prazoPrograma.inicio}
                                    fim={prazoPrograma.fim}
                                    percent={prazoPrograma.percent}
                                    label={prazoPrograma.label}
                                    loading={loadingCharts}
                                />
                            </section>
                        )}
                        
                        {/* Observações das Sessões - Musicoterapia */}
                        {selectedArea === 'musicoterapia' && (
                            <section data-print-block data-print-wide>
                                <SessionObservationsCard
                                    observations={sessionObservations}
                                    loading={loadingObservations}
                                    maxItems={30}
                                    title="Observações das Sessões"
                                />
                            </section>
                        )}
                        
                        {/* Mensagem para áreas sem dados ainda */}
                        {selectedArea && !['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(selectedArea) && !adaptedData && !loadingKpis && (
                            <section data-print-block>
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">
                                        Relatórios para {areaConfig.label} em desenvolvimento.
                                        <br />
                                        Em breve você poderá visualizar métricas específicas desta área.
                                    </p>
                                </div>
                            </section>
                        )}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PatientSelector
                                selected={selectedPatient}
                                onSelect={handlePatientSelect}
                                onClear={handlePatientClear}
                            />
                            
                            <AreaSelectorCard
                                value={selectedArea}
                                onChange={handleAreaChange}
                                disabled={false}
                            />
                        </div>

                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                                {!selectedPatient && !selectedArea && 'Selecione um cliente e uma área terapêutica para gerar o relatório'}
                                {selectedPatient && !selectedArea && 'Selecione uma área terapêutica para continuar'}
                                {!selectedPatient && selectedArea && 'Selecione um cliente para continuar'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
