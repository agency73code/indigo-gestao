import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CardHeader, CardTitle } from '@/ui/card';
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

export default function RelatorioMensalPage() {
    const [searchParams] = useSearchParams();

    // Estado do paciente selecionado
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Estados para os dados
    const [kpis, setKpis] = useState<KpisRelatorio | null>(null);
    const [serieLinha, setSerieLinha] = useState<SerieLinha[]>([]);
    const [prazoPrograma, setPrazoPrograma] = useState<PrazoPrograma | null>(null);
    const [sessions, setSessions] = useState<SessionDetail[]>([]);

    // Estados de loading
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [sessionsError, setSessionsError] = useState<string | null>(null);

    // Filtros - inicializa com queryParams se existirem
    const [filters, setFilters] = useState<Filters>(() => ({
        pacienteId: searchParams.get('pacienteId') || undefined,
        periodo: { mode: '30d' },
        programaId: searchParams.get('programaId') || undefined,
        estimuloId: undefined,
        terapeutaId: undefined,
        comparar: false,
    }));

    // Função para carregar todos os dados
    const loadData = async (currentFilters: Filters) => {
        try {
            // Carregar KPIs primeiro (mais rápido)
            setLoadingKpis(true);
            const kpisData = await fetchKpis(currentFilters);
            setKpis(kpisData);
            setLoadingKpis(false);

            // Carregar gráficos em paralelo
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

    // Carrega dados quando os filtros mudam
    useEffect(() => {
        // Só carrega dados se houver paciente selecionado
        if (selectedPatient) {
            loadData(filters);
        }
    }, [filters, selectedPatient]);

    // Handler para seleção de paciente
    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        // Atualizar filtros com o ID do paciente
        setFilters((prev) => ({
            ...prev,
            pacienteId: patient.id,
        }));
    };

    // Handler para limpar paciente
    const handlePatientClear = () => {
        setSelectedPatient(null);
        // Limpar pacienteId dos filtros
        setFilters((prev) => ({
            ...prev,
            pacienteId: undefined,
        }));
    };

    // Handler para mudança de filtros
    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <CardHeader className="px-6 pt-6 pb-2">
                <CardTitle
                    className="text-2xl font-semibold text-primary"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                >
                    Painel de Progresso - Programas & Objetivos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Análise completa do desempenho e evolução do cliente
                </p>
            </CardHeader>

            <div className="space-y-4 md:space-y-6 px-6 pb-6">
                {/* Seleção de Paciente */}
                <PatientSelector
                    selected={selectedPatient}
                    onSelect={handlePatientSelect}
                    onClear={handlePatientClear}
                />

                {/* Conteúdo - só aparece quando houver paciente selecionado */}
                {selectedPatient ? (
                    <>
                        {/* Filtros */}
                        <FiltersBar value={filters} onChange={handleFiltersChange} />

                        {/* KPIs */}
                        {kpis && <KpiCards data={kpis} loading={loadingKpis} />}

                        {/* Linha dupla */}
                        <DualLineProgress data={serieLinha} loading={loadingCharts} />

                        <AttentionStimuliBlock
                            sessions={sessions}
                            filters={filters}
                            loading={loadingSessions}
                            error={sessionsError}
                        />

                        {/* Prazo do Programa (OCP) - Full Width */}
                        <OcpDeadlineCard
                            inicio={prazoPrograma?.inicio}
                            fim={prazoPrograma?.fim}
                            percent={prazoPrograma?.percent}
                            label={prazoPrograma?.label}
                            loading={loadingCharts}
                        />
                    </>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                            Selecione um cliente para visualizar o relatório
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
