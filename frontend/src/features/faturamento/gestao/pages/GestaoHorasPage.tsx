import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ManagerFiltersBar } from '../components/ManagerFiltersBar.js';
import { SummaryCards } from '../components/SummaryCards.js';
import { OverviewByTherapistTable } from '../components/OverviewByTherapistTable.js';
import { ApprovalsQueueTable } from '../components/ApprovalsQueueTable.js';
import { TherapistDetailTable } from '../components/TherapistDetailTable.js';
import { BulkActionsBar } from '../components/BulkActionsBar.js';
import { MarkPaidDialog } from '../components/MarkPaidDialog.js';
import { managerService } from '../../services/faturamento.service';
import { fetchClients } from '../../api';
import type {
    ManagerFilters,
    TherapistDTO,
    TherapistPayrollSummaryDTO,
    ManagerEntryDTO,
    MarkPaidPayload,
    ApproveRejectPayload,
} from '../../types/hourEntry.types';
import type { Patient } from '@/features/consultas/types/consultas.types';
import { toast } from 'sonner';

// Filtro inicial: mês atual
const getInitialFilters = (): ManagerFilters => {
    const today = new Date();
    return {
        from: format(startOfMonth(today), 'yyyy-MM-dd'),
        to: format(endOfMonth(today), 'yyyy-MM-dd'),
    };
};

export default function GestaoHorasPage() {
    // Estados de dados
    const [therapists, setTherapists] = useState<TherapistDTO[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [overviewData, setOverviewData] = useState<TherapistPayrollSummaryDTO[]>([]);
    const [approvalsData, setApprovalsData] = useState<ManagerEntryDTO[]>([]);
    const [detailData, setDetailData] = useState<ManagerEntryDTO[]>([]);

    // Estados de paginação
    const [overviewTotal, setOverviewTotal] = useState(0);
    const [approvalsTotal, setApprovalsTotal] = useState(0);
    const [detailTotal, setDetailTotal] = useState(0);
    const [overviewPage, setOverviewPage] = useState(1);
    const [approvalsPage, setApprovalsPage] = useState(1);
    const [detailPage, setDetailPage] = useState(1);
    const pageSize = 10;

    // Estados de filtros (inicia com mês atual)
    const [filters, setFilters] = useState<ManagerFilters>(getInitialFilters());
    const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');

    // Estados de seleção (para bulk actions)
    const [selectedApprovalIds, setSelectedApprovalIds] = useState<string[]>([]);
    const [selectedDetailIds, setSelectedDetailIds] = useState<string[]>([]);

    // Estados de loading e dialogs
    const [isLoading, setIsLoading] = useState(false);
    const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Carregar terapeutas
    useEffect(() => {
        async function loadTherapists() {
            try {
                const data = await managerService.listTherapists();
                setTherapists(data);
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                toast.error('Erro ao carregar lista de terapeutas');
            }
        }
        loadTherapists();
    }, []);

    // Carregar pacientes
    useEffect(() => {
        async function loadPatients() {
            try {
                const data = await fetchClients();
                setPatients(data);
            } catch (error) {
                console.error('Erro ao carregar pacientes:', error);
                toast.error('Erro ao carregar lista de pacientes');
            }
        }
        loadPatients();
    }, []);

    // Carregar Visão Geral
    const loadOverview = async () => {
        setIsLoading(true);
        try {
            const result = await managerService.listOverviewByTherapist({
                ...filters,
                page: overviewPage,
                pageSize,
            });
            setOverviewData(result.items);
            setOverviewTotal(result.total);
        } catch (error) {
            console.error('Erro ao carregar visão geral:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    };

    // Carregar Aprovações
    const loadApprovals = async () => {
        setIsLoading(true);
        try {
            const result = await managerService.listApprovalsQueue({
                ...filters,
                status: 'submitted', // Somente submitted
                page: approvalsPage,
                pageSize,
            });
            setApprovalsData(result.items);
            setApprovalsTotal(result.total);
        } catch (error) {
            console.error('Erro ao carregar aprovações:', error);
            toast.error('Erro ao carregar fila de aprovações');
        } finally {
            setIsLoading(false);
        }
    };

    // Carregar Detalhe do Terapeuta
    const loadDetail = async () => {
        if (!selectedTherapistId) {
            setDetailData([]);
            setDetailTotal(0);
            return;
        }

        setIsLoading(true);
        try {
            const result = await managerService.listEntriesByTherapist(selectedTherapistId, {
                ...filters,
                page: detailPage,
                pageSize,
            });
            setDetailData(result.items);
            setDetailTotal(result.total);
        } catch (error) {
            console.error('Erro ao carregar detalhe:', error);
            toast.error('Erro ao carregar lançamentos');
        } finally {
            setIsLoading(false);
        }
    };

    // Effects para carregar dados
    useEffect(() => {
        if (activeTab === 'overview') loadOverview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, overviewPage, activeTab]);

    useEffect(() => {
        if (activeTab === 'approvals') loadApprovals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, approvalsPage, activeTab]);

    useEffect(() => {
        if (activeTab === 'detail') loadDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, detailPage, selectedTherapistId, activeTab]);

    // Handlers de ações
    const handleApprove = async (entryIds: string[]) => {
        try {
            await managerService.approve({ entryIds });
            toast.success(`${entryIds.length} lançamento(s) aprovado(s)`);
            setSelectedApprovalIds([]);
            setSelectedDetailIds([]);
            // Recarregar dados
            if (activeTab === 'approvals') loadApprovals();
            if (activeTab === 'detail') loadDetail();
            if (activeTab === 'overview') loadOverview();
        } catch (error) {
            console.error('Erro ao aprovar:', error);
            toast.error('Erro ao aprovar lançamentos');
        }
    };

    const handleReject = async (payload: ApproveRejectPayload) => {
        try {
            await managerService.reject(payload);
            toast.success(`${payload.entryIds.length} lançamento(s) reprovado(s)`);
            setSelectedApprovalIds([]);
            setSelectedDetailIds([]);
            // Recarregar dados
            if (activeTab === 'approvals') loadApprovals();
            if (activeTab === 'detail') loadDetail();
            if (activeTab === 'overview') loadOverview();
        } catch (error) {
            console.error('Erro ao reprovar:', error);
            toast.error('Erro ao reprovar lançamentos');
        }
    };

    const handleMarkPaid = async (payload: MarkPaidPayload) => {
        try {
            await managerService.markPaid(payload);
            toast.success(`${payload.entryIds.length} lançamento(s) marcado(s) como pago(s)`);
            setSelectedDetailIds([]);
            setShowMarkPaidDialog(false);
            // Recarregar dados
            if (activeTab === 'detail') loadDetail();
            if (activeTab === 'overview') loadOverview();
        } catch (error) {
            console.error('Erro ao marcar como pago:', error);
            toast.error('Erro ao processar pagamento');
        }
    };

    const handleViewTherapistDetail = (therapistId: string) => {
        setSelectedTherapistId(therapistId);
        setActiveTab('detail');
    };

    // Calcular totais para SummaryCards
    const summaryTotals = overviewData.reduce(
        (acc, item) => ({
            totalSessions: acc.totalSessions + item.sessionsCount,
            totalDays: acc.totalDays + item.daysWorked,
            totalHoursPayable: acc.totalHoursPayable + item.hoursPayable,
            totalAmount: acc.totalAmount + item.totalAmount,
        }),
        { totalSessions: 0, totalDays: 0, totalHoursPayable: 0, totalAmount: 0 },
    );

    // Opções para os filtros
    const therapistOptions = therapists.map((t) => ({ value: t.id, label: t.name }));
    const patientOptions = patients.map((p) => ({ value: p.id, label: p.nome }));

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div>
                <h1 
                style={{ color: 'var(--primary)', fontFamily: 'sora' }}
                className="text-2xl font-bold tracking-tight">Gestão de Horas</h1>
                <p className="text-sm text-muted-foreground">
                    Aprovação, pagamento e resumo por terapeuta.
                </p>
            </div>
        
            {/* Filtros (persistentes no topo) */}
            <Card className="rounded-[5px]" padding="medium">
                <ManagerFiltersBar
                    filters={filters}
                    onChange={setFilters}
                    therapistOptions={therapistOptions}
                    patientOptions={patientOptions}
                />
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 h-10 rounded-[5px] p-1">
                    <TabsTrigger
                        value="overview"
                        className="h-8 rounded-[5px] data-[state=active]:rounded-[5px]"
                    >
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger
                        value="approvals"
                        className="h-8 rounded-[5px] data-[state=active]:rounded-[5px]"
                    >
                        Aprovações
                    </TabsTrigger>
                    <TabsTrigger
                        value="detail"
                        className="h-8 rounded-[5px] data-[state=active]:rounded-[5px]"
                    >
                        Detalhe do Terapeuta
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Visão Geral */}
                <TabsContent value="overview" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Totais por terapeuta no período selecionado.
                    </p>
                    <SummaryCards {...summaryTotals} />
                    <Card>
                        <OverviewByTherapistTable
                            data={overviewData}
                            total={overviewTotal}
                            page={overviewPage}
                            pageSize={pageSize}
                            onPageChange={setOverviewPage}
                            onViewDetail={handleViewTherapistDetail}
                            isLoading={isLoading}
                        />
                    </Card>
                </TabsContent>

                {/* Tab: Aprovações */}
                <TabsContent value="approvals" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Lançamentos enviados pelos terapeutas. Selecione e Aprovar/Reprovar.
                    </p>
                    <BulkActionsBar
                        selectedCount={selectedApprovalIds.length}
                        onApprove={() => handleApprove(selectedApprovalIds)}
                        onReject={(reason?: string) =>
                            handleReject({ entryIds: selectedApprovalIds, reason })
                        }
                        showMarkPaid={false}
                    />
                    <Card>
                        <ApprovalsQueueTable
                            data={approvalsData}
                            total={approvalsTotal}
                            page={approvalsPage}
                            pageSize={pageSize}
                            onPageChange={setApprovalsPage}
                            selectedIds={selectedApprovalIds}
                            onToggleSelect={setSelectedApprovalIds}
                            onApprove={handleApprove}
                            onReject={(entryIds: string[], reason?: string) =>
                                handleReject({ entryIds, reason })
                            }
                            onViewTherapist={handleViewTherapistDetail}
                            isLoading={isLoading}
                        />
                    </Card>
                </TabsContent>

                {/* Tab: Detalhe do Terapeuta */}
                <TabsContent value="detail" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Itens do terapeuta selecionado. Você pode Aprovar/Reprovar ou Marcar como
                        pago.
                    </p>

                    {/* Select de Terapeuta */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Terapeuta:</label>
                        <select
                            value={selectedTherapistId}
                            onChange={(e) => setSelectedTherapistId(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Selecione um terapeuta</option>
                            {therapists.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} - R$ {t.valorHora}/h
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedTherapistId ? (
                        <>
                            <BulkActionsBar
                                selectedCount={selectedDetailIds.length}
                                onApprove={() => handleApprove(selectedDetailIds)}
                                onReject={(reason) =>
                                    handleReject({ entryIds: selectedDetailIds, reason })
                                }
                                onMarkPaid={() => setShowMarkPaidDialog(true)}
                                showMarkPaid={true}
                            />
                            <Card>
                                <TherapistDetailTable
                                    data={detailData}
                                    total={detailTotal}
                                    page={detailPage}
                                    pageSize={pageSize}
                                    onPageChange={setDetailPage}
                                    selectedIds={selectedDetailIds}
                                    onToggleSelect={setSelectedDetailIds}
                                    onApprove={handleApprove}
                                    onReject={(entryIds, reason) =>
                                        handleReject({ entryIds, reason })
                                    }
                                    onMarkPaid={(entryIds) => {
                                        setSelectedDetailIds(entryIds);
                                        setShowMarkPaidDialog(true);
                                    }}
                                    isLoading={isLoading}
                                />
                            </Card>
                        </>
                    ) : (
                        <Card className="flex h-64 items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                Selecione um terapeuta para visualizar os lançamentos.
                            </p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialog: Marcar como Pago */}
            <MarkPaidDialog
                open={showMarkPaidDialog}
                onOpenChange={setShowMarkPaidDialog}
                onConfirm={(payload: Omit<MarkPaidPayload, 'entryIds'>) =>
                    handleMarkPaid({ ...payload, entryIds: selectedDetailIds })
                }
            />
        </div>
    );
}
