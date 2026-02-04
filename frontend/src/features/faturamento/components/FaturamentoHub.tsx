/**
 * FaturamentoHub
 * 
 * Componente principal para visualização de faturamento baseado em sessões e atas.
 * - Cards de estatísticas no topo
 * - Barra de busca e filtros
 * - Lista de clientes agrupados
 * - Ao clicar no cliente, expande mostrando os lançamentos
 * 
 * NOTA: Este componente substitui o LancamentosHub antigo.
 * Não há mais "Novo Lançamento" pois os dados vêm de sessões e atas cadastradas.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    LayoutList,
    CheckCircle2,
    AlertCircle,
    FileText,
    Search,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FiltersPopover } from '@/components/ui/filters-popover';
import type { DateRangeValue } from '@/ui/date-range-picker-field';
import { cn } from '@/lib/utils';

import type {
    ItemFaturamento,
    StatusFaturamento,
    TipoAtividadeFaturamento,
    ClienteGroup,
    FaturamentoListFilters,
    ResumoFaturamento,
} from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    STATUS_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    ORIGEM_LANCAMENTO,
} from '../types/faturamento.types';
import {
    listFaturamento,
    getTerapeutaLogado,
    getResumoFaturamento,
} from '../services/faturamento-sessoes.service';
import { FaturamentoTable, type FaturamentoColumnFilters, type FaturamentoColumnFilterOptions } from './FaturamentoTable';
import { BillingDrawer } from './BillingDrawer';
import { useBillingCorrection } from '../hooks/useBillingCorrection';
import type { BillingLancamento } from '../types/billingCorrection';
import type { FilterOption } from '@/components/ui/column-header-filter';

// ============================================
// TIPOS
// ============================================

export interface FaturamentoHubProps {
    /** Modo de visualização: terapeuta vê só suas horas, gerente vê de todos */
    mode: 'terapeuta' | 'gerente';
    /** Título da página (opcional, para contexto) */
    title?: string;
}

// ============================================
// COMPONENTES DE ESTATÍSTICAS
// ============================================

interface StatsCardPrimaryProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    isActive?: boolean;
    onClick?: () => void;
}

function StatsCardPrimary({ icon, label, value, isActive, onClick }: StatsCardPrimaryProps) {
    return (
        <div
            className={cn(
                "bg-primary rounded-xl p-5 cursor-pointer transition-all hover:bg-primary/90",
                isActive && "ring-2 ring-primary-foreground ring-offset-2 ring-offset-background"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-primary-foreground/10 rounded-lg text-primary-foreground">
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-xs text-primary-foreground/70 mb-1">{label}</p>
                <p className="text-2xl font-normal text-primary-foreground">{value}</p>
            </div>
        </div>
    );
}

interface StatsCardSecondaryProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    subValue?: string;
    badge?: {
        value: string;
        variant: 'success' | 'warning' | 'default';
    };
    isActive?: boolean;
    onClick?: () => void;
}

function StatsCardSecondary({ icon, label, value, subValue, badge, isActive, onClick }: StatsCardSecondaryProps) {
    return (
        <div
            className={cn(
                "bg-card border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/20",
                isActive && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    {icon}
                </div>
                <span className="text-muted-foreground">•••</span>
            </div>
            <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <p className="text-2xl font-normal">{value}</p>
                        {badge && (
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                badge.variant === 'success' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                badge.variant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                badge.variant === 'default' && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                            )}>
                                {badge.value}
                            </span>
                        )}
                    </div>
                    {subValue && (
                        <p className="text-xs text-muted-foreground">{subValue}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-normal mb-2">
                {hasFilters ? 'Nenhum lançamento encontrado' : 'Nenhum lançamento registrado'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {hasFilters
                    ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                    : 'Os lançamentos aparecem automaticamente quando você registra sessões ou atas de reunião.'}
            </p>
            {hasFilters && (
                <Button variant="outline" onClick={onClearFilters}>
                    Limpar filtros
                </Button>
            )}
        </div>
    );
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatarHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) {
        return `${horas}h`;
    }
    return `${horas}h ${mins}min`;
}

function formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function getInitials(nome: string): string {
    return nome
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function FaturamentoHub({ mode }: FaturamentoHubProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Hook de correção de faturamento
    const {
        isOpen: isDrawerOpen,
        lancamento: lancamentoCorrection,
        isSaving: isSavingCorrection,
        openCorrection,
        closeCorrection,
        saveCorrection,
        getBillingData,
    } = useBillingCorrection();
    // Estados
    const [lancamentos, setLancamentos] = useState<ItemFaturamento[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [resumo, setResumo] = useState<ResumoFaturamento | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
    const [terapeutaId, setTerapeutaId] = useState<string | undefined>();

    // Filtro de status
    const [statusFilter, setStatusFilter] = useState<StatusFaturamento | 'all'>('all');

    // Filtros de coluna da tabela (FaturamentoTable)
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        firstColumn: undefined,
        tipoAtividade: undefined,
        especialidade: undefined,
        status: undefined,
    });

    // Filtros da URL
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const clienteIdFilter = searchParams.get('clienteId') ?? undefined;
    const orderBy = (searchParams.get('orderBy') as 'recent' | 'oldest') ?? 'recent';

    const filters: FaturamentoListFilters = {
        q: searchParams.get('q') ?? undefined,
        dataInicio: dateFrom,
        dataFim: dateTo,
        orderBy,
        page: 1,
        pageSize: 100,
    };

    const dateRangeValue: DateRangeValue | undefined = (dateFrom || dateTo)
        ? { from: dateFrom, to: dateTo }
        : undefined;

    const hasFilters = !!(filters.q || dateFrom || dateTo || statusFilter !== 'all');
    const isViewingClient = !!clienteIdFilter;

    // ============================================
    // ESTATÍSTICAS
    // ============================================

    const stats = useMemo(() => {
        if (!resumo) {
            return {
                total: 0,
                pendentes: 0,
                aprovados: 0,
                horasRealizadas: '0h',
                valorTotal: 'R$ 0,00',
                valorTotalNum: 0,
                valorPendente: 0,
                valorAprovado: 0,
            };
        }

        // Calcular valores por status baseado nos lançamentos
        const valorPendente = lancamentos
            .filter(l => l.status === STATUS_FATURAMENTO.PENDENTE)
            .reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorAprovado = lancamentos
            .filter(l => l.status === STATUS_FATURAMENTO.APROVADO)
            .reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);

        return {
            total: resumo.totalLancamentos,
            pendentes: resumo.porStatus.pendentes,
            aprovados: resumo.porStatus.aprovados,
            horasRealizadas: resumo.totalHoras,
            valorTotal: formatarValor(resumo.totalValor),
            valorTotalNum: resumo.totalValor,
            valorPendente,
            valorAprovado,
        };
    }, [resumo, lancamentos]);

    // ============================================
    // FILTRAR E AGRUPAR POR CLIENTE
    // ============================================

    // Lançamentos filtrados apenas pelo cliente (para calcular opções de filtro)
    const clientFilteredLancamentos = useMemo(() => {
        let result = lancamentos;

        if (statusFilter !== 'all') {
            result = result.filter(l => l.status === statusFilter);
        }

        if (clienteIdFilter) {
            result = result.filter(l => l.clienteId === clienteIdFilter);
        }

        return result;
    }, [lancamentos, statusFilter, clienteIdFilter]);

    // Opções para os filtros de coluna (baseadas nos lançamentos disponíveis)
    const columnFilterOptions: FaturamentoColumnFilterOptions = useMemo(() => {
        const firstColumnSet = new Set<string>();
        const tipoSet = new Set<TipoAtividadeFaturamento>();
        const especialidadeSet = new Set<string>();
        const statusSet = new Set<StatusFaturamento>();

        clientFilteredLancamentos.forEach(l => {
            firstColumnSet.add(l.clienteNome || 'Sem cliente');
            tipoSet.add(l.tipoAtividade);
            if (l.area) especialidadeSet.add(l.area);
            statusSet.add(l.status);
        });

        const firstColumnOptions: FilterOption[] = Array.from(firstColumnSet).sort().map(name => ({
            value: name,
            label: name,
        }));

        const tipoOptions: FilterOption[] = Array.from(tipoSet).map(tipo => ({
            value: tipo,
            label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo] ?? tipo,
        }));

        const especialidadeOptions: FilterOption[] = Array.from(especialidadeSet).sort().map(esp => ({
            value: esp,
            label: esp,
        }));

        const statusOptions: FilterOption[] = Array.from(statusSet).map(status => ({
            value: status,
            label: STATUS_FATURAMENTO_LABELS[status] ?? status,
        }));

        return {
            firstColumn: firstColumnOptions,
            tipoAtividade: tipoOptions,
            especialidade: especialidadeOptions,
            status: statusOptions,
        };
    }, [clientFilteredLancamentos]);

    // Lançamentos com filtros de coluna aplicados
    const filteredLancamentos = useMemo(() => {
        let result = clientFilteredLancamentos;

        // Aplicar filtros de coluna
        if (columnFilters.tipoAtividade) {
            result = result.filter(l => l.tipoAtividade === columnFilters.tipoAtividade);
        }

        if (columnFilters.status) {
            result = result.filter(l => l.status === columnFilters.status);
        }

        return result;
    }, [clientFilteredLancamentos, columnFilters]);

    const groupedByClient = useMemo((): ClienteGroup[] => {
        let lancamentosParaAgrupar = lancamentos;

        if (statusFilter !== 'all') {
            lancamentosParaAgrupar = lancamentosParaAgrupar.filter(l => l.status === statusFilter);
        }

        const grouped: Record<string, ClienteGroup> = {};

        // Grupo para "Sem cliente" (atas sem cliente vinculado)
        const SEM_CLIENTE_KEY = '__sem_cliente__';

        lancamentosParaAgrupar.forEach(lancamento => {
            const clienteId = lancamento.clienteId ?? SEM_CLIENTE_KEY;
            const clienteNome = lancamento.clienteNome ?? 'Atividades sem cliente';
            const clienteAvatarUrl = lancamento.clienteAvatarUrl;

            if (!grouped[clienteId]) {
                grouped[clienteId] = {
                    clienteId,
                    clienteNome,
                    clienteAvatarUrl,
                    lancamentos: [],
                    totalMinutos: 0,
                    totalValor: 0,
                    totalLancamentos: 0,
                };
            }

            grouped[clienteId].lancamentos.push(lancamento);
            grouped[clienteId].totalMinutos += lancamento.duracaoMinutos;
            grouped[clienteId].totalValor += lancamento.valorTotal ?? 0;
            grouped[clienteId].totalLancamentos += 1;
        });

        // Ordena: clientes com nome primeiro, "Sem cliente" por último
        return Object.values(grouped).sort((a, b) => {
            if (a.clienteId === SEM_CLIENTE_KEY) return 1;
            if (b.clienteId === SEM_CLIENTE_KEY) return -1;
            return a.clienteNome.localeCompare(b.clienteNome);
        });
    }, [lancamentos, statusFilter]);

    const selectedClientInfo = useMemo(() => {
        if (!clienteIdFilter) return null;
        return groupedByClient.find(c => c.clienteId === clienteIdFilter) || null;
    }, [clienteIdFilter, groupedByClient]);

    // ============================================
    // CARREGAR DADOS
    // ============================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params: FaturamentoListFilters = {
                q: filters.q,
                dataInicio: filters.dataInicio,
                dataFim: filters.dataFim,
                orderBy: filters.orderBy,
                page: 1,
                pageSize: 100,
            };

            // Se for terapeuta, filtrar por seu ID
            if (mode === 'terapeuta' && terapeutaId) {
                params.terapeutaId = terapeutaId;
            }

            const [responseList, responseResumo] = await Promise.all([
                listFaturamento(params),
                getResumoFaturamento(mode === 'terapeuta' ? terapeutaId : undefined, params),
            ]);

            setLancamentos(responseList.items);
            setResumo(responseResumo);
        } catch (error) {
            console.error('Erro ao carregar faturamento:', error);
            toast.error('Erro ao carregar dados de faturamento');
        } finally {
            setLoading(false);
        }
    }, [filters.q, filters.dataInicio, filters.dataFim, filters.orderBy, mode, terapeutaId]);

    // Buscar terapeuta logado
    useEffect(() => {
        if (mode === 'terapeuta') {
            getTerapeutaLogado()
                .then(terapeuta => setTerapeutaId(terapeuta.id))
                .catch(console.error);
        }
    }, [mode]);

    useEffect(() => {
        if (mode === 'gerente' || terapeutaId) {
            loadData();
        }
    }, [loadData, mode, terapeutaId]);

    // ============================================
    // HANDLERS - FILTROS
    // ============================================

    const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });

        newParams.delete('page');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleDateRangeChange = useCallback((range: DateRangeValue | undefined) => {
        updateFilters({ dateFrom: range?.from, dateTo: range?.to });
    }, [updateFilters]);

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams());
        setSearchValue('');
        setStatusFilter('all');
        setColumnFilters({ firstColumn: undefined, tipoAtividade: undefined, status: undefined });
    }, [setSearchParams]);

    // Handler para filtros de coluna da tabela
    const handleColumnFilterChange = useCallback((newFilters: FaturamentoColumnFilters) => {
        setColumnFilters(newFilters);
    }, []);

    // Debounce para busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.q ?? '')) {
                updateFilters({ q: searchValue || undefined });
            }
        }, 300);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    // ============================================
    // HANDLERS - NAVEGAÇÃO
    // ============================================

    const navigateToClient = useCallback((clienteId: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('clienteId', clienteId);
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const navigateBackToClients = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('clienteId');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleViewBilling = useCallback((item: ItemFaturamento) => {
        // Converter ItemFaturamento para BillingLancamento e abrir drawer
        const lancamento: BillingLancamento = {
            id: item.id,
            clienteId: item.clienteId || '',
            clienteNome: item.clienteNome || 'Cliente',
            terapeutaId: item.terapeutaId || '',
            tipo: item.tipoAtividade === 'homecare' ? 'homecare' : item.tipoAtividade === 'consultorio' ? 'consultorio' : 'de Reuniões',
            data: item.data,
            horario: `${item.horarioInicio} - ${item.horarioFim}`,
            duracao: `${Math.floor(item.duracaoMinutos / 60)}h ${item.duracaoMinutos % 60}min`,
            valor: item.valorTotal || 0,
            status: item.status as 'aprovado' | 'rejeitado' | 'pendente' | 'aguardando',
            motivoRejeicao: item.motivoRejeicao,
            sessaoId: item.origem === ORIGEM_LANCAMENTO.SESSAO ? String(item.origemId) : null,
            faturamento: item.faturamento,
        };
        
        openCorrection(lancamento);
    }, [openCorrection]);



    // ============================================
    // RENDERIZAÇÃO
    // ============================================

    return (
        <div className="flex flex-col h-full">
            {/* Área Fixa - Cards e Barra de Ferramentas */}
            <div className="shrink-0 space-y-6 p-4 pb-0">
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Card Primário - Horas Realizadas */}
                    <StatsCardPrimary
                        icon={<Clock className="h-5 w-5" />}
                        label="Horas Realizadas"
                        value={stats.horasRealizadas}
                    />

                    {/* Card Secundário - Valor Total */}
                    <StatsCardSecondary
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Valor Total"
                        value={stats.valorTotal}
                    />

                    {/* Cards Secundários */}
                    <StatsCardSecondary
                        icon={<LayoutList className="h-5 w-5" />}
                        label="Total de Lançamentos"
                        value={stats.total}
                        isActive={statusFilter === 'all'}
                        onClick={() => setStatusFilter('all')}
                    />
                    <StatsCardSecondary
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        label="Aprovados"
                        value={stats.aprovados}
                        subValue={formatarValor(stats.valorAprovado)}
                        badge={stats.total > 0 ? {
                            value: `${Math.round((stats.aprovados / stats.total) * 100)}%`,
                            variant: 'success'
                        } : undefined}
                        isActive={statusFilter === 'aprovado'}
                        onClick={() => setStatusFilter(statusFilter === 'aprovado' ? 'all' : 'aprovado')}
                    />
                    <StatsCardSecondary
                        icon={stats.pendentes > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        label="Pendentes"
                        value={stats.pendentes}
                        subValue={formatarValor(stats.valorPendente)}
                        badge={stats.pendentes > 0 ? {
                            value: `${stats.pendentes} aguardando`,
                            variant: 'warning'
                        } : undefined}
                        isActive={statusFilter === 'pendente'}
                        onClick={() => setStatusFilter(statusFilter === 'pendente' ? 'all' : 'pendente')}
                    />
                </div>

                {/* Barra de Ferramentas */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Busca - Lado Esquerdo */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente, atividade..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-9 pr-9 h-9 rounded-3xl w-[400px]"
                        />
                        {searchValue && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setSearchValue('')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Filtros - Lado Direito */}
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap ml-auto">
                        <FiltersPopover
                            filters={[
                                {
                                    type: 'select',
                                    key: 'tipoAtividade',
                                    label: 'Tipo de Atividade',
                                    placeholder: 'Todas as atividades',
                                    options: [
                                        { value: 'all', label: 'Todas as atividades' },
                                        ...Object.entries(TIPO_ATIVIDADE_FATURAMENTO_LABELS).map(([value, label]) => ({
                                            value,
                                            label,
                                        })),
                                    ],
                                },
                                {
                                    type: 'date-range',
                                    key: 'periodo',
                                    label: 'Período',
                                    placeholder: 'Selecione o período',
                                },
                                {
                                    type: 'select',
                                    key: 'orderBy',
                                    label: 'Ordenar por',
                                    options: [
                                        { value: 'recent', label: 'Mais recente' },
                                        { value: 'oldest', label: 'Mais antigo' },
                                    ],
                                },
                            ]}
                            values={{
                                tipoAtividade: 'all',
                                periodo: dateRangeValue,
                                orderBy: orderBy,
                            }}
                            onChange={(key, value) => {
                                if (key === 'periodo') {
                                    handleDateRangeChange(value as DateRangeValue);
                                } else if (key === 'orderBy') {
                                    updateFilters({ orderBy: value as string });
                                }
                            }}
                            onClear={() => {
                                updateFilters({
                                    orderBy: 'recent',
                                    dateFrom: undefined,
                                    dateTo: undefined,
                                });
                            }}
                            buttonText="Filtros"
                            showBadge={true}
                        />
                    </div>
                </div>
            </div>

            {/* Área com Scroll - Lista de Clientes ou Tabela */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {loading ? (
                    <LoadingSkeleton />
                ) : isViewingClient ? (
                    /* ========================================
                       VISUALIZAÇÃO DE LANÇAMENTOS DO CLIENTE
                       ======================================== */
                    <div className="space-y-4">
                        {/* Header do Cliente com botão de voltar */}
                        <div
                            className="flex items-center gap-4 p-4"
                            style={{
                                backgroundColor: 'var(--hub-card-background)',
                                borderRadius: 'var(--radius)'
                            }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={navigateBackToClients}
                                className="shrink-0"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <Avatar className="h-12 w-12 shrink-0">
                                <AvatarImage
                                    src={selectedClientInfo?.clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${selectedClientInfo.clienteAvatarUrl}` : ''}
                                    alt={selectedClientInfo?.clienteNome || ''}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-regular">
                                    {getInitials(selectedClientInfo?.clienteNome || 'SC')}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                                    {selectedClientInfo?.clienteNome || 'Cliente'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {filteredLancamentos.length} {filteredLancamentos.length === 1 ? 'lançamento' : 'lançamentos'} • {formatarHoras(selectedClientInfo?.totalMinutos || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Tabela de Lançamentos com Filtros de Coluna */}
                        {filteredLancamentos.length === 0 && clientFilteredLancamentos.length === 0 ? (
                            <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
                        ) : (
                            <FaturamentoTable
                                data={filteredLancamentos}
                                columnFilters={columnFilters}
                                filterOptions={columnFilterOptions}
                                onColumnFilterChange={handleColumnFilterChange}
                                onViewDetails={handleViewBilling}
                                onCorrectAndResend={handleViewBilling}
                            />
                        )}
                    </div>
                ) : groupedByClient.length === 0 ? (
                    <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
                ) : (
                    /* ========================================
                       LISTA DE CLIENTES (CARDS CLICÁVEIS)
                       ======================================== */
                    <div className="space-y-3">
                        {groupedByClient.map(({ clienteId, clienteNome, clienteAvatarUrl, totalMinutos, totalValor, totalLancamentos, lancamentos: clientLancamentos }) => {
                            const pendentesCliente = clientLancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE).length;
                            const aprovadosCliente = clientLancamentos.filter(l => l.status === STATUS_FATURAMENTO.APROVADO).length;
                            const rejeitadosCliente = clientLancamentos.filter(l => l.status === STATUS_FATURAMENTO.REJEITADO).length;

                            return (
                                <div
                                    key={clienteId}
                                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--hub-card-background)',
                                        borderRadius: 'var(--radius)'
                                    }}
                                    onClick={() => navigateToClient(clienteId)}
                                >
                                    <div className="shrink-0">
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>

                                    <Avatar className="h-12 w-12 shrink-0">
                                        <AvatarImage
                                            src={clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${clienteAvatarUrl}` : ''}
                                            alt={clienteNome}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary font-regular">
                                            {getInitials(clienteNome)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 text-left min-w-0">
                                        <h3 className="text-base font-regular truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                                            {clienteNome}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {formatarHoras(totalMinutos)} • {formatarValor(totalValor)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {pendentesCliente > 0 && (
                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                {pendentesCliente} pendente{pendentesCliente > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {aprovadosCliente > 0 && (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                {aprovadosCliente} aprovado{aprovadosCliente > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {rejeitadosCliente > 0 && (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                {rejeitadosCliente} rejeitado{rejeitadosCliente > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                            {totalLancamentos} {totalLancamentos === 1 ? 'lançamento' : 'lançamentos'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Drawer de Visualização/Correção de Faturamento */}
            <BillingDrawer
                isOpen={isDrawerOpen}
                onClose={closeCorrection}
                lancamento={lancamentoCorrection}
                initialBillingData={lancamentoCorrection ? getBillingData(lancamentoCorrection) : null}
                onSave={async (lancamentoId, dadosCorrigidos, comentario) => {
                    await saveCorrection(lancamentoId, dadosCorrigidos, comentario);
                    // Recarregar dados após correção
                    loadData();
                }}
                isSaving={isSavingCorrection}
            />
        </div>
    );
}

export default FaturamentoHub;
