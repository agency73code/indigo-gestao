/**
 * LancamentosHub
 * 
 * Componente principal para visualização de lançamentos no estilo "Atas de Reunião".
 * - Cards de estatísticas no topo
 * - Barra de busca à esquerda, filtros e botão de adicionar à direita
 * - Lista de clientes agrupados
 * - Ao clicar no cliente, expande mostrando os lançamentos daquele cliente
 * 
 * Usado por: MinhasHorasPage (terapeuta) e GestaoHorasPage (gerente)
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
    FileEdit,
    Plus,
    Search,
    X,
    FileText,
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

import type { Lancamento, StatusLancamento, TipoAtividade } from '../types';
import { STATUS_LANCAMENTO_LABELS, TIPO_ATIVIDADE_LABELS } from '../types';
import {
    listLancamentos,
    getTerapeutaLogado,
} from '../services/faturamento.service';
import LancamentosTable, { 
    type SortState,
    type LancamentoColumnFilters,
    type LancamentoColumnFilterOptions,
} from './LancamentosTable';
import { LancamentoDrawer } from './LancamentoDrawer';

// ============================================
// TIPOS
// ============================================

export interface LancamentosHubProps {
    /** Modo de visualização: terapeuta vê só suas horas, gerente vê de todos */
    mode: 'terapeuta' | 'gerente';
    /** Título da página (opcional, para contexto) */
    title?: string;
}

interface LancamentoFilters {
    q?: string;
    dataInicio?: string;
    dataFim?: string;
    terapeutaId?: string;
    clienteId?: string;
    status?: StatusLancamento;
    tipoAtividade?: TipoAtividade;
    orderBy?: 'recent' | 'oldest';
    page?: number;
    pageSize?: number;
}

interface ClienteGroup {
    clienteId: string;
    clienteNome: string;
    clienteAvatarUrl?: string;
    lancamentos: Lancamento[];
    totalMinutos: number;
    totalValor: number;
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
    badge?: {
        value: string;
        variant: 'success' | 'warning' | 'default';
    };
    isActive?: boolean;
    onClick?: () => void;
}

function StatsCardSecondary({ icon, label, value, badge, isActive, onClick }: StatsCardSecondaryProps) {
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
                    : 'Comece registrando seu primeiro lançamento de horas.'}
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

function calcularDuracaoMinutos(horaInicio: string, horaFim: string): number {
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFim.split(':').map(Number);
    return (horaF * 60 + minF) - (horaI * 60 + minI);
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function LancamentosHub({ mode }: LancamentosHubProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Estados
    const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
    const [terapeutaId, setTerapeutaId] = useState<string | undefined>();

    // Filtro de status
    const [statusFilter, setStatusFilter] = useState<StatusLancamento | 'all'>('all');

    // Estados para a tabela de lançamentos
    const [tableSortState, setTableSortState] = useState<SortState>({ field: 'data', direction: 'desc' });
    const [tableColumnFilters, setTableColumnFilters] = useState<LancamentoColumnFilters>({});

    // Estados para o drawer de lançamento
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | null>(null);

    // Filtros atuais da URL
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const clienteIdFilter = searchParams.get('clienteId') ?? undefined;
    const orderBy = (searchParams.get('orderBy') as 'recent' | 'oldest') ?? 'recent';

    const filters: LancamentoFilters = {
        q: searchParams.get('q') ?? undefined,
        dataInicio: dateFrom,
        dataFim: dateTo,
        orderBy,
        page: Number(searchParams.get('page')) || 1,
        pageSize: 100,
    };

    const dateRangeValue: DateRangeValue | undefined = (dateFrom || dateTo)
        ? { from: dateFrom, to: dateTo }
        : undefined;

    const hasFilters = !!(filters.q || dateFrom || dateTo || statusFilter !== 'all');

    // Verificar se estamos visualizando um cliente específico
    const isViewingClient = !!clienteIdFilter;

    // ============================================
    // ESTATÍSTICAS
    // ============================================

    const stats = useMemo(() => {
        const lancamentosParaStats = clienteIdFilter
            ? lancamentos.filter(l => l.clienteId === clienteIdFilter)
            : lancamentos;

        const pendentes = lancamentosParaStats.filter(l => l.status === 'pendente').length;
        const aprovados = lancamentosParaStats.filter(l => l.status === 'aprovado').length;
        const rejeitados = lancamentosParaStats.filter(l => l.status === 'rejeitado').length;
        // Calcular minutos totais e valor
        const minutosTotal = lancamentosParaStats.reduce((acc, l) => {
            return acc + calcularDuracaoMinutos(l.horarioInicio, l.horarioFim);
        }, 0);

        const valorTotal = lancamentosParaStats.reduce((acc, l) => acc + (l.valorTotal || 0), 0);

        return {
            total: lancamentosParaStats.length,
            pendentes,
            aprovados,
            rejeitados,
            horasRealizadas: formatarHoras(minutosTotal),
            valorTotal: formatarValor(valorTotal),
        };
    }, [lancamentos, clienteIdFilter]);

    // ============================================
    // FILTRAR E AGRUPAR POR CLIENTE
    // ============================================

    const filteredLancamentos = useMemo(() => {
        let result = lancamentos;

        if (statusFilter !== 'all') {
            result = result.filter(l => l.status === statusFilter);
        }

        if (clienteIdFilter) {
            result = result.filter(l => l.clienteId === clienteIdFilter);
        }

        // Ordenação
        result = [...result].sort((a, b) => {
            const comparison = a.data.localeCompare(b.data);
            return orderBy === 'recent' ? -comparison : comparison;
        });

        return result;
    }, [lancamentos, statusFilter, clienteIdFilter, orderBy]);

    const groupedByClient = useMemo((): ClienteGroup[] => {
        let lancamentosParaAgrupar = lancamentos;

        if (statusFilter !== 'all') {
            lancamentosParaAgrupar = lancamentosParaAgrupar.filter(l => l.status === statusFilter);
        }

        const grouped: Record<string, ClienteGroup> = {};

        lancamentosParaAgrupar.forEach(lancamento => {
            const clienteId = lancamento.clienteId;
            const clienteNome = lancamento.clienteNome;
            const clienteAvatarUrl = lancamento.clienteAvatarUrl;

            if (!grouped[clienteId]) {
                grouped[clienteId] = {
                    clienteId,
                    clienteNome,
                    clienteAvatarUrl,
                    lancamentos: [],
                    totalMinutos: 0,
                    totalValor: 0,
                };
            }

            grouped[clienteId].lancamentos.push(lancamento);
            grouped[clienteId].totalMinutos += calcularDuracaoMinutos(lancamento.horarioInicio, lancamento.horarioFim);
            grouped[clienteId].totalValor += lancamento.valorTotal || 0;
        });

        return Object.values(grouped).sort((a, b) => a.clienteNome.localeCompare(b.clienteNome));
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
            const params: LancamentoFilters = {
                q: filters.q,
                dataInicio: filters.dataInicio,
                dataFim: filters.dataFim,
                orderBy: filters.orderBy,
                page: 1,
                pageSize: 9999, // Buscar todos para agrupar no frontend
            };

            // Se for terapeuta, filtrar por seu ID
            if (mode === 'terapeuta' && terapeutaId) {
                params.terapeutaId = terapeutaId;
            }

            const response = await listLancamentos(params);
            setLancamentos(response.items);
        } catch (error) {
            console.error('Erro ao carregar lançamentos:', error);
            toast.error('Erro ao carregar lançamentos');
            // Garante que mostra estado vazio ao invés de ficar no loading
            setLancamentos([]);
        } finally {
            setLoading(false);
        }
    }, [filters.q, filters.dataInicio, filters.dataFim, filters.orderBy, mode, terapeutaId]);

    // Buscar terapeuta logado
    useEffect(() => {
        if (mode === 'terapeuta') {
            getTerapeutaLogado()
                .then(terapeuta => setTerapeutaId(terapeuta.id))
                .catch((error) => {
                    console.error('Erro ao buscar terapeuta logado:', error);
                    toast.error('Erro ao carregar dados do terapeuta');
                    // Define um ID placeholder para permitir que loadData execute e mostre o estado vazio
                    setTerapeutaId('_error_');
                });
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
    }, [setSearchParams]);

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

    const handleNovoLancamento = useCallback(() => {
        setSelectedLancamento(null);
        setDrawerOpen(true);
    }, []);

    // ============================================
    // HANDLERS - TABELA DE LANÇAMENTOS
    // ============================================

    const handleTableSort = useCallback((field: string) => {
        setTableSortState(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleTableFilterChange = useCallback((key: keyof LancamentoColumnFilters, value: string | undefined) => {
        setTableColumnFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const handleViewLancamentoDetails = useCallback((lancamento: Lancamento) => {
        setSelectedLancamento(lancamento);
        setDrawerOpen(true);
    }, []);

    const handleDrawerClose = useCallback(() => {
        setDrawerOpen(false);
        setSelectedLancamento(null);
    }, []);

    const handleDrawerSuccess = useCallback(() => {
        loadData();
        handleDrawerClose();
    }, [loadData, handleDrawerClose]);

    // Opções de filtro para a tabela
    const tableFilterOptions = useMemo((): LancamentoColumnFilterOptions => {
        const statusCountMap = new Map<string, number>();
        const tipoCountMap = new Map<string, number>();
        
        for (const lancamento of filteredLancamentos) {
            statusCountMap.set(lancamento.status, (statusCountMap.get(lancamento.status) || 0) + 1);
            tipoCountMap.set(lancamento.tipoAtividade, (tipoCountMap.get(lancamento.tipoAtividade) || 0) + 1);
        }
        
        return {
            status: Array.from(statusCountMap.entries()).map(([value, count]) => ({
                value,
                label: STATUS_LANCAMENTO_LABELS[value as StatusLancamento],
                count,
            })),
            tipoAtividade: Array.from(tipoCountMap.entries()).map(([value, count]) => ({
                value,
                label: TIPO_ATIVIDADE_LABELS[value as TipoAtividade],
                count,
            })),
        };
    }, [filteredLancamentos]);

    // Lançamentos filtrados e ordenados para a tabela
    const tableLancamentos = useMemo(() => {
        let result = [...filteredLancamentos];
        
        // Aplicar filtros de coluna
        if (tableColumnFilters.status) {
            result = result.filter(l => l.status === tableColumnFilters.status);
        }
        if (tableColumnFilters.tipoAtividade) {
            result = result.filter(l => l.tipoAtividade === tableColumnFilters.tipoAtividade);
        }
        
        // Aplicar ordenação
        result.sort((a, b) => {
            let comparison = 0;
            if (tableSortState.field === 'data') {
                comparison = a.data.localeCompare(b.data);
            } else if (tableSortState.field === 'clienteNome') {
                comparison = a.clienteNome.localeCompare(b.clienteNome);
            } else if (tableSortState.field === 'terapeutaNome') {
                comparison = a.terapeutaNome.localeCompare(b.terapeutaNome);
            }
            return tableSortState.direction === 'asc' ? comparison : -comparison;
        });
        
        return result;
    }, [filteredLancamentos, tableColumnFilters, tableSortState]);

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
                        badge={stats.total > 0 ? {
                            value: `${Math.round((stats.aprovados / stats.total) * 100)}%`,
                            variant: 'success'
                        } : undefined}
                        isActive={statusFilter === 'aprovado'}
                        onClick={() => setStatusFilter(statusFilter === 'aprovado' ? 'all' : 'aprovado')}
                    />
                    <StatsCardSecondary
                        icon={stats.pendentes > 0 ? <AlertCircle className="h-5 w-5" /> : <FileEdit className="h-5 w-5" />}
                        label="Pendentes"
                        value={stats.pendentes}
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
                                        ...Object.entries(TIPO_ATIVIDADE_LABELS).map(([value, label]) => ({
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
                                if (key === 'tipoAtividade') {
                                    // Implementar se necessário
                                } else if (key === 'periodo') {
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

                        <Button onClick={handleNovoLancamento} className="gap-2 shrink-0 h-9">
                            <Plus className="h-4 w-4" />
                            Novo Lançamento
                        </Button>
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

                        {/* Tabela de Lançamentos do Cliente */}
                        {filteredLancamentos.length === 0 ? (
                            <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
                        ) : (
                            <LancamentosTable
                                lancamentos={tableLancamentos}
                                loading={false}
                                onViewDetails={handleViewLancamentoDetails}
                                sortState={tableSortState}
                                onSort={handleTableSort}
                                columnFilters={tableColumnFilters}
                                filterOptions={tableFilterOptions}
                                onFilterChange={handleTableFilterChange}
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
                        {groupedByClient.map(({ clienteId, clienteNome, clienteAvatarUrl, lancamentos: clientLancamentos, totalMinutos, totalValor }) => {
                            const totalClientLancamentos = clientLancamentos.length;
                            const pendentesCliente = clientLancamentos.filter(l => l.status === 'pendente').length;

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
                                            <Badge variant="secondary" className="text-xs">
                                                {pendentesCliente} pendente{pendentesCliente > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        <span className="text-sm text-muted-foreground">
                                            {totalClientLancamentos} {totalClientLancamentos === 1 ? 'lançamento' : 'lançamentos'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Drawer lateral para criar/editar lançamentos */}
            <LancamentoDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                lancamento={selectedLancamento}
                onSuccess={handleDrawerSuccess}
            />
        </div>
    );
}

export default LancamentosHub;
