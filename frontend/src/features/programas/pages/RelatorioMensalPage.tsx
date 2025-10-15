import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiltersBar } from '../relatorio-geral/components/FiltersBar';
import { KpiCards } from '../relatorio-geral/components/KpiCards';
import { DualLineProgress } from '../relatorio-geral/components/DualLineProgress';
import { PatientSelector, type Patient } from '../consultar-programas/components';
import { OcpDeadlineCard } from '../relatorio-geral/components/OcpDeadlineCard';
import { AttentionStimuliBlock } from '../relatorio-geral/components/AttentionStimuliBlock';
import {
    fetchKpis,
    fetchSerieLinha,
    fetchPrazoPrograma,
} from '../relatorio-geral/services/relatorio.service';
import { listSessionsByPatient } from '../consulta-sessao/services';
import type { Sessao as SessionDetail } from '../consulta-sessao/types';
import type { Filters, KpisRelatorio, SerieLinha, PrazoPrograma } from '../relatorio-geral/types';
import { ReportExporter } from '../relatorio-geral/print/ReportExporter';

export default function RelatorioMensalPage() {
    const [searchParams] = useSearchParams();

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const [kpis, setKpis] = useState<KpisRelatorio | null>(null);
    const [serieLinha, setSerieLinha] = useState<SerieLinha[]>([]);
    const [prazoPrograma, setPrazoPrograma] = useState<PrazoPrograma | null>(null);
    const [sessions, setSessions] = useState<SessionDetail[]>([]);

    const [loadingKpis, setLoadingKpis] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [sessionsError, setSessionsError] = useState<string | null>(null);

    // Estados para os filtros (programas, estímulos, terapeutas)
    const [programas, setProgramas] = useState<{ id: string; nome: string }[]>([]);
    const [estimulos, setEstimulos] = useState<{ id: string; nome: string }[]>([]);
    const [terapeutas, setTerapeutas] = useState<{ id: string; nome: string }[]>([]);

    const [filters, setFilters] = useState<Filters>(() => ({
        pacienteId: searchParams.get('pacienteId') || undefined,
        periodo: { mode: '30d' },
        programaId: searchParams.get('programaId') || undefined,
        estimuloId: undefined,
        terapeutaId: undefined,
        comparar: false,
    }));

    // Buscar opções de filtros (programas, estímulos, terapeutas)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [programasRes, estimulosRes, terapeutasRes] = await Promise.all([
                    fetch('/api/ocp/reports/filters/programs', { credentials: 'include' }),
                    fetch('/api/ocp/reports/filters/stimulus', { credentials: 'include' }),
                    fetch('/api/terapeutas/relatorio', { credentials: 'include' }),
                ]);

                const programasData = await programasRes.json();
                const estimulosData = await estimulosRes.json();
                const terapeutasData = await terapeutasRes.json();

                // Garantir que sempre sejam arrays - seguindo padrão da API
                const programasArray = Array.isArray(programasData?.data)
                    ? programasData.data
                    : Array.isArray(programasData?.programas)
                      ? programasData.programas
                      : Array.isArray(programasData)
                        ? programasData
                        : [];

                const estimulosArray = Array.isArray(estimulosData?.data)
                    ? estimulosData.data
                    : Array.isArray(estimulosData?.estimulos)
                      ? estimulosData.estimulos
                      : Array.isArray(estimulosData)
                        ? estimulosData
                        : [];

                const terapeutasArray = Array.isArray(terapeutasData?.data)
                    ? terapeutasData.data
                    : Array.isArray(terapeutasData?.terapeutas)
                      ? terapeutasData.terapeutas
                      : Array.isArray(terapeutasData)
                        ? terapeutasData
                        : [];

                console.log('Terapeutas carregados:', terapeutasArray); // Debug

                setProgramas(programasArray);
                setEstimulos(estimulosArray);
                setTerapeutas(terapeutasArray);
            } catch (error) {
                console.error('Erro ao carregar opções de filtros:', error);
                // Em caso de erro, definir arrays vazios
                setProgramas([]);
                setEstimulos([]);
                setTerapeutas([]);
            }
        };

        fetchFilterOptions();
    }, []);

    const loadData = async (currentFilters: Filters) => {
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

            setSerieLinha(serieLinhaData);
            setPrazoPrograma(prazoProgramaData);
            setLoadingCharts(false);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
            setLoadingKpis(false);
            setLoadingCharts(false);
        }
    };

    useEffect(() => {
        if (!selectedPatient) {
            setSessions([]);
            setSessionsError(null);
            setLoadingSessions(false);
            return;
        }

        let isCancelled = false;

        const loadSessions = async () => {
            setLoadingSessions(true);
            setSessionsError(null);

            try {
                const data = await listSessionsByPatient(selectedPatient.id);
                if (!isCancelled) {
                    setSessions(data);
                }
            } catch (error) {
                console.error('Erro ao carregar sessões do paciente:', error);
                if (!isCancelled) {
                    setSessions([]);
                    setSessionsError('Não foi possível carregar as sessões do paciente.');
                }
            } finally {
                if (!isCancelled) {
                    setLoadingSessions(false);
                }
            }
        };

        loadSessions();

        return () => {
            isCancelled = true;
        };
    }, [selectedPatient]);

    useEffect(() => {
        if (selectedPatient) {
            loadData(filters);
        }
    }, [filters, selectedPatient]);

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
        setFilters((prev) => ({
            ...prev,
            pacienteId: patient.id,
        }));
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
        setFilters((prev) => ({
            ...prev,
            pacienteId: undefined,
        }));
    };

    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
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

    return (
        <div className="flex flex-col w-full h-full">
            {selectedPatient ? (
                <ReportExporter documentTitle={documentTitle}>
                    <div className="space-y-4 md:space-y-6 px-6 pb-6">
                        {/* Bloco de Cliente - aparece em tela e PDF */}
                        <div data-print-program-header>
                            <PatientSelector
                                selected={selectedPatient}
                                onSelect={handlePatientSelect}
                                onClear={handlePatientClear}
                            />
                        </div>

                        {/* Filtros interativos - só aparece na tela */}
                        <div className="no-print">
                            <FiltersBar value={filters} onChange={handleFiltersChange} />
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
                            <AttentionStimuliBlock
                                sessions={sessions}
                                filters={filters}
                                loading={loadingSessions}
                                error={sessionsError}
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
            ) : (
                <div className="flex flex-col w-full h-full">
                    <div className="px-6 pt-6 pb-2">
                        <h1
                            className="text-2xl font-semibold text-primary"
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
