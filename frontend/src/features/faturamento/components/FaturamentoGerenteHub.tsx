/**
 * FaturamentoGerenteHub
 * 
 * Tela principal de faturamento para o GERENTE.
 * 
 * Funcionalidades:
 * - Ver sessões pendentes de aprovação
 * - Aprovar em massa
 * - Ver por Terapeuta (com drill-down para clientes)
 * - Ver por Cliente (com drill-down para terapeutas)
 * 
 * Fluxo:
 * Terapeuta lança sessão/ata → Status "Pendente" → Gerente aprova → Status "Aprovado"
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Users,
    UserCheck,
    CheckCircle2,
    AlertCircle,
    FileText,
    Search,
    X,
    Check,
    Loader2,
    Clock,
    DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { FiltersPopover } from '@/components/ui/filters-popover';
import type { DateRangeValue } from '@/ui/date-range-picker-field';
import { cn } from '@/lib/utils';

import type {
    ItemFaturamento,
    StatusFaturamento,
    TipoAtividadeFaturamento,
    TerapeutaGroup,
    ClienteGroup,
    FaturamentoListFilters,
    ResumoGerente,
} from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    STATUS_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_COLORS,
    ORIGEM_LANCAMENTO,
} from '../types/faturamento.types';
import {
    listFaturamento,
    getResumoGerente,
    aprovarLancamentos,
} from '../services/faturamento-sessoes.service';
import { FaturamentoTable, type FaturamentoColumnFilters, type FaturamentoColumnFilterOptions } from './FaturamentoTable';
import { BillingDrawer } from './BillingDrawer';
import { useBillingCorrection } from '../hooks/useBillingCorrection';
import type { BillingLancamento } from '../types/billingCorrection';

// ============================================
// TIPOS
// ============================================

type ViewMode = 'pendentes' | 'por-terapeuta' | 'por-cliente';

// ============================================
// COMPONENTES DE ESTATÍSTICAS
// ============================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    badge?: {
        value: string;
        variant: 'success' | 'warning' | 'default';
    };
    variant?: 'default' | 'primary' | 'warning' | 'success';
    isActive?: boolean;
    onClick?: () => void;
}

function StatCard({ icon, label, value, subValue, badge, variant = 'default', isActive, onClick }: StatCardProps) {
    const bgColors = {
        default: 'bg-card hover:bg-muted/50',
        primary: 'bg-primary hover:bg-primary/90',
        warning: 'bg-card hover:bg-muted/50',
        success: 'bg-card hover:bg-muted/50',
    };

    const iconColors = {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary-foreground/10 text-primary-foreground',
        warning: 'bg-muted text-muted-foreground',
        success: 'bg-muted text-muted-foreground',
    };

    const textColors = {
        default: 'text-foreground',
        primary: 'text-primary-foreground',
        warning: 'text-foreground',
        success: 'text-foreground',
    };
    
    const badgeColors = {
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    };

    return (
        <div
            className={cn(
                "rounded-xl p-5 transition-all border",
                bgColors[variant],
                onClick && "cursor-pointer",
                isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", iconColors[variant])}>
                    {icon}
                </div>
                <span className="text-muted-foreground">•••</span>
            </div>
            <div className="mt-4">
                <p className={cn(
                    "text-xs mb-1",
                    variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                    {label}
                </p>
                <div className="flex items-center gap-3">
                    <p className={cn("text-2xl font-normal", textColors[variant])}>
                        {value}
                    </p>
                    {badge && (
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            badgeColors[badge.variant]
                        )}>
                            {badge.value}
                        </span>
                    )}
                </div>
                {subValue && (
                    <p className={cn(
                        "text-sm mt-1",
                        variant === 'primary' ? 'text-primary-foreground/50' : 'text-muted-foreground'
                    )}>
                        {subValue}
                    </p>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
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

function EmptyState({ message, description }: { message: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-normal mb-2">{message}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    );
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatarHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
}

function formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatarData(data: string): string {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function formatarDuracao(minutos: number): string {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h${mins}min` : `${horas}h`;
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

export function FaturamentoGerenteHub() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Hook de correção de faturamento (igual ao terapeuta)
    const {
        isOpen: isDrawerOpen,
        lancamento: lancamentoCorrection,
        isSaving: isSavingCorrection,
        openCorrection,
        closeCorrection,
        saveCorrection,
        getBillingData,
    } = useBillingCorrection();

    // Estados principais
    const [lancamentos, setLancamentos] = useState<ItemFaturamento[]>([]);
    const [resumo, setResumo] = useState<ResumoGerente | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
    
    // View mode (pendentes, por-terapeuta, por-cliente)
    const viewMode = (searchParams.get('view') as ViewMode) || 'pendentes';
    
    // Seleção para aprovação em massa
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isApproving, setIsApproving] = useState(false);

    // Navegação drill-down
    const terapeutaIdFilter = searchParams.get('terapeutaId') ?? undefined;
    const clienteIdFilter = searchParams.get('clienteId') ?? undefined;
    
    // Filtros de coluna
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        firstColumn: undefined,
        tipoAtividade: undefined,
        especialidade: undefined,
        status: undefined,
    });

    // Filtros da URL
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const orderBy = (searchParams.get('orderBy') as 'recent' | 'oldest') ?? 'recent';

    const dateRangeValue: DateRangeValue | undefined = (dateFrom || dateTo)
        ? { from: dateFrom, to: dateTo }
        : undefined;

    // ============================================
    // MEMOS - FILTRAR E AGRUPAR
    // ============================================

    // Filtrar lançamentos base
    const filteredLancamentos = useMemo(() => {
        let result = lancamentos;

        // Filtro de busca
        if (searchValue) {
            const q = searchValue.toLowerCase();
            result = result.filter(l => 
                l.terapeutaNome.toLowerCase().includes(q) ||
                l.clienteNome?.toLowerCase().includes(q) ||
                l.tipoAtividade.toLowerCase().includes(q)
            );
        }

        // Filtro por view mode
        if (viewMode === 'pendentes') {
            result = result.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE);
        }

        // Filtro por terapeuta (drill-down)
        if (terapeutaIdFilter) {
            result = result.filter(l => l.terapeutaId === terapeutaIdFilter);
        }

        // Filtro por cliente (drill-down)
        if (clienteIdFilter) {
            result = result.filter(l => l.clienteId === clienteIdFilter);
        }

        // Filtros de coluna
        if (columnFilters.tipoAtividade) {
            result = result.filter(l => l.tipoAtividade === columnFilters.tipoAtividade);
        }

        if (columnFilters.status) {
            result = result.filter(l => l.status === columnFilters.status);
        }

        return result;
    }, [lancamentos, searchValue, viewMode, terapeutaIdFilter, clienteIdFilter, columnFilters]);

    // Agrupar por terapeuta
    const groupedByTerapeuta = useMemo((): TerapeutaGroup[] => {
        if (viewMode !== 'por-terapeuta' || terapeutaIdFilter) return [];

        const grouped: Record<string, TerapeutaGroup> = {};

        lancamentos.forEach(l => {
            if (!grouped[l.terapeutaId]) {
                grouped[l.terapeutaId] = {
                    terapeutaId: l.terapeutaId,
                    terapeutaNome: l.terapeutaNome,
                    terapeutaAvatarUrl: l.terapeutaAvatarUrl,
                    lancamentos: [],
                    totalMinutos: 0,
                    totalValor: 0,
                    totalLancamentos: 0,
                    totalPendentes: 0,
                    totalAprovados: 0,
                };
            }

            grouped[l.terapeutaId].lancamentos.push(l);
            grouped[l.terapeutaId].totalMinutos += l.duracaoMinutos;
            grouped[l.terapeutaId].totalValor += l.valorTotal ?? 0;
            grouped[l.terapeutaId].totalLancamentos += 1;
            
            if (l.status === STATUS_FATURAMENTO.PENDENTE) {
                grouped[l.terapeutaId].totalPendentes += 1;
            } else if (l.status === STATUS_FATURAMENTO.APROVADO) {
                grouped[l.terapeutaId].totalAprovados += 1;
            }
        });

        return Object.values(grouped).sort((a, b) => {
            // Ordena por pendentes primeiro, depois por nome
            if (a.totalPendentes !== b.totalPendentes) {
                return b.totalPendentes - a.totalPendentes;
            }
            return a.terapeutaNome.localeCompare(b.terapeutaNome);
        });
    }, [lancamentos, viewMode, terapeutaIdFilter]);

    // Agrupar por cliente - usa valorTotalCliente (quanto o cliente paga à clínica)
    const groupedByCliente = useMemo((): ClienteGroup[] => {
        if (viewMode !== 'por-cliente' || clienteIdFilter) return [];

        const grouped: Record<string, ClienteGroup> = {};
        const SEM_CLIENTE_KEY = '__sem_cliente__';

        lancamentos.forEach(l => {
            const clienteId = l.clienteId ?? SEM_CLIENTE_KEY;
            const clienteNome = l.clienteNome ?? 'Atividades sem cliente';

            if (!grouped[clienteId]) {
                grouped[clienteId] = {
                    clienteId,
                    clienteNome,
                    clienteAvatarUrl: l.clienteAvatarUrl,
                    lancamentos: [],
                    totalMinutos: 0,
                    totalValor: 0, // Valor do cliente (quanto o cliente paga)
                    totalValorTerapeuta: 0, // Valor do terapeuta (quanto pagar)
                    totalLancamentos: 0,
                    totalPendentes: 0,
                    totalAprovados: 0,
                };
            }

            grouped[clienteId].lancamentos.push(l);
            grouped[clienteId].totalMinutos += l.duracaoMinutos;
            // Usar valorTotalCliente para cliente, com fallback para valorTotal
            grouped[clienteId].totalValor += l.valorTotalCliente ?? l.valorTotal ?? 0;
            grouped[clienteId].totalValorTerapeuta += l.valorTotal ?? 0;
            grouped[clienteId].totalLancamentos += 1;
            
            if (l.status === STATUS_FATURAMENTO.PENDENTE) {
                grouped[clienteId].totalPendentes += 1;
            } else if (l.status === STATUS_FATURAMENTO.APROVADO) {
                grouped[clienteId].totalAprovados += 1;
            }
        });

        return Object.values(grouped).sort((a, b) => {
            if (a.clienteId === SEM_CLIENTE_KEY) return 1;
            if (b.clienteId === SEM_CLIENTE_KEY) return -1;
            return a.clienteNome.localeCompare(b.clienteNome);
        });
    }, [lancamentos, viewMode, clienteIdFilter]);

    // Info do drill-down selecionado
    const selectedTerapeutaInfo = useMemo(() => {
        if (!terapeutaIdFilter) return null;
        const terapeuta = lancamentos.find(l => l.terapeutaId === terapeutaIdFilter);
        if (!terapeuta) return null;
        
        const terapeutaLancamentos = lancamentos.filter(l => l.terapeutaId === terapeutaIdFilter);
        return {
            id: terapeutaIdFilter,
            nome: terapeuta.terapeutaNome,
            avatarUrl: terapeuta.terapeutaAvatarUrl,
            totalLancamentos: terapeutaLancamentos.length,
            totalMinutos: terapeutaLancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0),
            totalPendentes: terapeutaLancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE).length,
        };
    }, [terapeutaIdFilter, lancamentos]);

    const selectedClienteInfo = useMemo(() => {
        if (!clienteIdFilter) return null;
        const cliente = lancamentos.find(l => l.clienteId === clienteIdFilter);
        if (!cliente) return null;
        
        const clienteLancamentos = lancamentos.filter(l => l.clienteId === clienteIdFilter);
        return {
            id: clienteIdFilter,
            nome: cliente.clienteNome ?? 'Sem cliente',
            avatarUrl: cliente.clienteAvatarUrl,
            totalLancamentos: clienteLancamentos.length,
            totalMinutos: clienteLancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0),
            // Valor do cliente (quanto o cliente paga)
            totalValor: clienteLancamentos.reduce((acc, l) => acc + (l.valorTotalCliente ?? l.valorTotal ?? 0), 0),
            totalPendentes: clienteLancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE).length,
            totalAprovados: clienteLancamentos.filter(l => l.status === STATUS_FATURAMENTO.APROVADO).length,
        };
    }, [clienteIdFilter, lancamentos]);

    // Opções de filtro para colunas
    const columnFilterOptions: FaturamentoColumnFilterOptions = useMemo(() => {
        const firstColumnSet = new Set<string>();
        const tipoSet = new Set<TipoAtividadeFaturamento>();
        const especialidadeSet = new Set<string>();
        const statusSet = new Set<StatusFaturamento>();

        filteredLancamentos.forEach(l => {
            // Para firstColumn, usa terapeuta ou cliente dependendo do viewMode
            if (viewMode === 'por-cliente' && clienteIdFilter) {
                firstColumnSet.add(l.terapeutaNome);
            } else if (viewMode === 'por-terapeuta' && terapeutaIdFilter) {
                firstColumnSet.add(l.clienteNome || 'Sem cliente');
            }
            tipoSet.add(l.tipoAtividade);
            if (l.area) especialidadeSet.add(l.area);
            statusSet.add(l.status);
        });

        return {
            firstColumn: Array.from(firstColumnSet).sort().map(name => ({
                value: name,
                label: name,
            })),
            tipoAtividade: Array.from(tipoSet).map(tipo => ({
                value: tipo,
                label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo] ?? tipo,
            })),
            especialidade: Array.from(especialidadeSet).sort().map(esp => ({
                value: esp,
                label: esp,
            })),
            status: Array.from(statusSet).map(status => ({
                value: status,
                label: STATUS_FATURAMENTO_LABELS[status] ?? status,
            })),
        };
    }, [filteredLancamentos, viewMode, clienteIdFilter, terapeutaIdFilter]);

    // ============================================
    // CARREGAR DADOS
    // ============================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params: FaturamentoListFilters = {
                q: searchValue || undefined,
                dataInicio: dateFrom,
                dataFim: dateTo,
                orderBy,
                page: 1,
                pageSize: 500, // Gerente vê mais dados
            };

            const [responseList, responseResumo] = await Promise.all([
                listFaturamento(params),
                getResumoGerente(params),
            ]);

            setLancamentos(responseList.items);
            setResumo(responseResumo);
        } catch (error) {
            console.error('Erro ao carregar faturamento:', error);
            toast.error('Erro ao carregar dados de faturamento');
        } finally {
            setLoading(false);
        }
    }, [searchValue, dateFrom, dateTo, orderBy]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================================
    // HANDLERS
    // ============================================

    const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });

        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        const newParams = new URLSearchParams();
        newParams.set('view', mode);
        // Reset drill-down e seleção ao mudar de view
        setSelectedIds(new Set());
        setColumnFilters({ tipoAtividade: undefined, status: undefined });
        setSearchParams(newParams);
    }, [setSearchParams]);

    const handleDateRangeChange = useCallback((range: DateRangeValue | undefined) => {
        updateFilters({ dateFrom: range?.from, dateTo: range?.to });
    }, [updateFilters]);

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams({ view: viewMode }));
        setSearchValue('');
        setColumnFilters({ firstColumn: undefined, tipoAtividade: undefined, status: undefined });
        setSelectedIds(new Set());
    }, [setSearchParams, viewMode]);

    // Navegação drill-down
    const navigateToTerapeuta = useCallback((terapeutaId: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('terapeutaId', terapeutaId);
        newParams.delete('clienteId');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const navigateToCliente = useCallback((clienteId: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('clienteId', clienteId);
        newParams.delete('terapeutaId');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const navigateBack = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('terapeutaId');
        newParams.delete('clienteId');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Seleção para aprovação em massa
    const toggleSelectItem = useCallback((id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        // Selecionar apenas pendentes SEM ajuda de custo (podem ser aprovados em massa)
        const pendentesSemAjuda = filteredLancamentos.filter(
            l => l.status === STATUS_FATURAMENTO.PENDENTE && !l.temAjudaCusto
        );
        const allSemAjudaSelected = pendentesSemAjuda.every(l => selectedIds.has(l.id));
        
        if (allSemAjudaSelected) {
            // Deselecionar todos
            setSelectedIds(new Set());
        } else {
            // Selecionar apenas os sem ajuda de custo
            setSelectedIds(new Set(pendentesSemAjuda.map(l => l.id)));
        }
    }, [filteredLancamentos, selectedIds]);

    const handleAprovarSelecionados = useCallback(async () => {
        if (selectedIds.size === 0) return;

        setIsApproving(true);
        try {
            await aprovarLancamentos(Array.from(selectedIds));
            toast.success(`${selectedIds.size} lançamento(s) aprovado(s) com sucesso!`);
            setSelectedIds(new Set());
            loadData(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao aprovar lançamentos:', error);
            toast.error('Erro ao aprovar lançamentos');
        } finally {
            setIsApproving(false);
        }
    }, [selectedIds, loadData]);

    // Handler para visualizar detalhes (igual ao terapeuta)
    const handleViewDetails = useCallback((item: ItemFaturamento) => {
        // Converter ItemFaturamento para BillingLancamento e abrir drawer
        const lancamento: BillingLancamento = {
            id: String(item.origemId),
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

    const handleColumnFilterChange = useCallback((newFilters: FaturamentoColumnFilters) => {
        setColumnFilters(newFilters);
    }, []);

    // Debounce para busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (searchParams.get('q') ?? '')) {
                updateFilters({ q: searchValue || undefined });
            }
        }, 300);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    // ============================================
    // RENDER
    // ============================================

    const selectedPendentes = filteredLancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE);
    // Separar pendentes sem ajuda de custo (podem ser selecionados em massa)
    const pendentesSemAjudaCusto = selectedPendentes.filter(l => !l.temAjudaCusto);
    const pendentesComAjudaCusto = selectedPendentes.filter(l => l.temAjudaCusto);
    
    const isAllSelected = pendentesSemAjudaCusto.length > 0 && 
        pendentesSemAjudaCusto.every(l => selectedIds.has(l.id));
    const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

    // Valores para FiltersPopover
    const filterValues = {
        periodo: dateRangeValue,
    };

    const handleFilterChange = (key: string, value: DateRangeValue | string | undefined) => {
        if (key === 'periodo') {
            handleDateRangeChange(value as DateRangeValue | undefined);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* ========================================
                CARDS DE ESTATÍSTICAS
                
                Layout:
                - Total Horas: horas totais (pendentes + aprovadas)
                - A Pagar (Terapeuta): quanto a clínica vai pagar
                - A Receber (Cliente): quanto a clínica vai receber
                - Aprovados: valores aprovados
                - Pendentes: valores pendentes (previsão)
               ======================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Card 1: Total de Horas */}
                <StatCard
                    icon={<Clock className="h-5 w-5" />}
                    label="Total Horas"
                    value={resumo?.totalHoras ?? '0h'}
                    subValue={`${lancamentos.length} lançamentos`}
                    variant="primary"
                />
                
                {/* Card 2: A Pagar (Terapeuta) */}
                <StatCard
                    icon={<DollarSign className="h-5 w-5" />}
                    label="A Pagar (Terapeuta)"
                    value={resumo ? formatarValor(resumo.totalValorTerapeuta) : 'R$ 0,00'}
                    subValue={resumo ? `Aprovado: ${formatarValor(resumo.valorAprovadoTerapeuta)}` : undefined}
                    variant="default"
                />
                
                {/* Card 3: A Receber (Cliente) */}
                <StatCard
                    icon={<DollarSign className="h-5 w-5" />}
                    label="A Receber (Cliente)"
                    value={resumo ? formatarValor(resumo.totalValorCliente) : 'R$ 0,00'}
                    subValue={resumo ? `Aprovado: ${formatarValor(resumo.valorAprovadoCliente)}` : undefined}
                    variant="success"
                />
                
                {/* Card 4: Aprovados */}
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    label="Aprovados"
                    value={resumo?.aprovadosPeriodo ?? 0}
                    subValue={resumo && lancamentos.length > 0 
                        ? `${Math.round((resumo.aprovadosPeriodo / lancamentos.length) * 100)}% do total`
                        : undefined}
                    badge={resumo?.aprovadosPeriodo && resumo.aprovadosPeriodo > 0 ? {
                        value: formatarValor(resumo.valorAprovadoTerapeuta),
                        variant: 'success'
                    } : undefined}
                    variant="default"
                />
                
                {/* Card 5: Pendentes (Previsão) */}
                <StatCard
                    icon={<AlertCircle className="h-5 w-5" />}
                    label="Pendentes"
                    value={resumo?.pendentesAprovacao ?? 0}
                    subValue={resumo ? `Pagar: ${formatarValor(resumo.valorPendenteTerapeuta)}` : undefined}
                    badge={resumo?.pendentesAprovacao && resumo.pendentesAprovacao > 0 ? {
                        value: `Receber: ${formatarValor(resumo.valorPendenteCliente)}`,
                        variant: 'warning'
                    } : undefined}
                    variant="warning"
                    isActive={viewMode === 'pendentes'}
                    onClick={() => handleViewModeChange('pendentes')}
                />
            </div>
            
            {/* ========================================
                ABAS DE NAVEGAÇÃO
               ======================================== */}
            <div className="flex items-center gap-1 border-b">
                <button
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        viewMode === 'pendentes'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleViewModeChange('pendentes')}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovar Horas
                    {(resumo?.pendentesAprovacao ?? 0) > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-amber-100 text-amber-700">
                            {resumo?.pendentesAprovacao}
                        </Badge>
                    )}
                </button>
                <button
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        viewMode === 'por-terapeuta'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleViewModeChange('por-terapeuta')}
                >
                    <Users className="h-4 w-4" />
                    Por Terapeuta
                    <span className="text-muted-foreground">{resumo?.totalTerapeutas ?? 0}</span>
                </button>
                <button
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        viewMode === 'por-cliente'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleViewModeChange('por-cliente')}
                >
                    <UserCheck className="h-4 w-4" />
                    Por Cliente
                    <span className="text-muted-foreground">{resumo?.totalClientes ?? 0}</span>
                </button>
            </div>

            {/* ========================================
                BARRA DE BUSCA E FILTROS
               ======================================== */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar terapeuta, cliente..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchValue && (
                        <button
                            onClick={() => setSearchValue('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 items-center">
                    <FiltersPopover
                        filters={[
                            { type: 'date-range', key: 'periodo', label: 'Período' },
                        ]}
                        values={filterValues}
                        onChange={handleFilterChange}
                        onClear={clearFilters}
                    />

                    {/* Botão de aprovação em massa (só aparece quando há seleção) */}
                    {viewMode === 'pendentes' && selectedIds.size > 0 && (
                        <Button
                            onClick={handleAprovarSelecionados}
                            disabled={isApproving}
                            className="gap-2"
                        >
                            {isApproving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Aprovar {selectedIds.size} selecionado(s)
                        </Button>
                    )}
                </div>
            </div>

            {/* ========================================
                ÁREA DE CONTEÚDO
               ======================================== */}
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <div className="flex flex-col gap-4">
                    {/* ----------------------------------------
                        VIEW: PENDENTES DE APROVAÇÃO
                       ---------------------------------------- */}
                    {viewMode === 'pendentes' && (
                        <>
                            {selectedPendentes.length === 0 ? (
                                <EmptyState
                                    message="Nenhum lançamento pendente"
                                    description="Todos os lançamentos já foram aprovados. 🎉"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {/* Header com select all */}
                                    <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg">
                                        <Checkbox
                                            checked={isAllSelected}
                                            // @ts-expect-error - indeterminate is valid
                                            indeterminate={isSomeSelected}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">
                                                Selecionar todos ({pendentesSemAjudaCusto.length} sem ajuda de custo)
                                            </span>
                                            {pendentesComAjudaCusto.length > 0 && (
                                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                                    {pendentesComAjudaCusto.length} item(ns) com ajuda de custo requer(em) aprovação individual
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lista de pendentes com checkbox */}
                                    {selectedPendentes.map((item) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-lg border transition-all",
                                                selectedIds.has(item.id)
                                                    ? "bg-primary/5 border-primary/30"
                                                    : "bg-card hover:bg-muted/30"
                                            )}
                                        >
                                            <Checkbox
                                                checked={selectedIds.has(item.id)}
                                                onCheckedChange={() => toggleSelectItem(item.id)}
                                            />

                                            {/* Terapeuta */}
                                            <div className="flex items-center gap-3 min-w-[180px]">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={item.terapeutaAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${item.terapeutaAvatarUrl}` : ''}
                                                        alt={item.terapeutaNome}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                        {getInitials(item.terapeutaNome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.terapeutaNome}</p>
                                                    <p className="text-xs text-muted-foreground">{item.area ?? 'Terapeuta'}</p>
                                                </div>
                                            </div>

                                            {/* Cliente */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">{item.clienteNome ?? 'Sem cliente'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs border",
                                                            TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.bg,
                                                            TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.text,
                                                            TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.border
                                                        )}
                                                    >
                                                        {TIPO_ATIVIDADE_FATURAMENTO_LABELS[item.tipoAtividade]}
                                                    </Badge>
                                                    {item.temAjudaCusto && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                                                        >
                                                            📎 Ajuda de custo
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Data e horário */}
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-sm">{formatarData(item.data)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.horarioInicio} - {item.horarioFim}
                                                </p>
                                            </div>

                                            {/* Duração e valor */}
                                            <div className="text-right min-w-[80px]">
                                                <p className="text-sm font-medium">{formatarDuracao(item.duracaoMinutos)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.valorTotal ? formatarValor(item.valorTotal) : '-'}
                                                </p>
                                            </div>

                                            {/* Ação individual */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetails(item)}
                                                className="shrink-0"
                                            >
                                                Ver
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ----------------------------------------
                        VIEW: POR TERAPEUTA
                       ---------------------------------------- */}
                    {viewMode === 'por-terapeuta' && !terapeutaIdFilter && (
                        <>
                            {groupedByTerapeuta.length === 0 ? (
                                <EmptyState
                                    message="Nenhum terapeuta encontrado"
                                    description="Não há lançamentos para exibir."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {groupedByTerapeuta.map((terapeuta) => (
                                        <div
                                            key={terapeuta.terapeutaId}
                                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-all"
                                            onClick={() => navigateToTerapeuta(terapeuta.terapeutaId)}
                                        >
                                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />

                                            <Avatar className="h-12 w-12 shrink-0">
                                                <AvatarImage
                                                    src={terapeuta.terapeutaAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${terapeuta.terapeutaAvatarUrl}` : ''}
                                                    alt={terapeuta.terapeutaNome}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(terapeuta.terapeutaNome)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{terapeuta.terapeutaNome}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {terapeuta.totalLancamentos} lançamentos • {formatarHoras(terapeuta.totalMinutos)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                {terapeuta.totalPendentes > 0 && (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                        {terapeuta.totalPendentes} pendente(s)
                                                    </Badge>
                                                )}
                                                <span className="text-sm font-medium">
                                                    {formatarValor(terapeuta.totalValor)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Drill-down: Terapeuta selecionado */}
                    {viewMode === 'por-terapeuta' && terapeutaIdFilter && selectedTerapeutaInfo && (
                        <div className="space-y-4">
                            {/* Header com voltar */}
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={navigateBack}
                                    className="shrink-0"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarImage
                                        src={selectedTerapeutaInfo.avatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${selectedTerapeutaInfo.avatarUrl}` : ''}
                                        alt={selectedTerapeutaInfo.nome}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {getInitials(selectedTerapeutaInfo.nome)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium truncate">{selectedTerapeutaInfo.nome}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTerapeutaInfo.totalLancamentos} lançamentos • {formatarHoras(selectedTerapeutaInfo.totalMinutos)}
                                        {selectedTerapeutaInfo.totalPendentes > 0 && (
                                            <span className="text-amber-600"> • {selectedTerapeutaInfo.totalPendentes} pendente(s)</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Tabela de lançamentos */}
                            <FaturamentoTable
                                data={filteredLancamentos}
                                columnFilters={columnFilters}
                                filterOptions={columnFilterOptions}
                                onColumnFilterChange={handleColumnFilterChange}
                                onViewDetails={handleViewDetails}
                                viewContext="by-therapist"
                            />
                        </div>
                    )}

                    {/* ----------------------------------------
                        VIEW: POR CLIENTE
                       ---------------------------------------- */}
                    {viewMode === 'por-cliente' && !clienteIdFilter && (
                        <>
                            {groupedByCliente.length === 0 ? (
                                <EmptyState
                                    message="Nenhum cliente encontrado"
                                    description="Não há lançamentos para exibir."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {groupedByCliente.map((cliente) => (
                                        <div
                                            key={cliente.clienteId}
                                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-all"
                                            onClick={() => navigateToCliente(cliente.clienteId)}
                                        >
                                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />

                                            <Avatar className="h-12 w-12 shrink-0">
                                                <AvatarImage
                                                    src={cliente.clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${cliente.clienteAvatarUrl}` : ''}
                                                    alt={cliente.clienteNome}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(cliente.clienteNome)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{cliente.clienteNome}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {cliente.totalLancamentos} lançamentos • {formatarHoras(cliente.totalMinutos)}
                                                </p>
                                            </div>

                                            <span className="text-sm font-medium shrink-0">
                                                {formatarValor(cliente.totalValor)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Drill-down: Cliente selecionado */}
                    {viewMode === 'por-cliente' && clienteIdFilter && selectedClienteInfo && (
                        <div className="space-y-4">
                            {/* Header com voltar */}
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={navigateBack}
                                    className="shrink-0"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarImage
                                        src={selectedClienteInfo.avatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${selectedClienteInfo.avatarUrl}` : ''}
                                        alt={selectedClienteInfo.nome}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {getInitials(selectedClienteInfo.nome)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium truncate">{selectedClienteInfo.nome}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedClienteInfo.totalLancamentos} lançamentos • {formatarHoras(selectedClienteInfo.totalMinutos)}
                                    </p>
                                </div>
                            </div>

                            {/* Tabela de lançamentos */}
                            <FaturamentoTable
                                data={filteredLancamentos}
                                columnFilters={columnFilters}
                                filterOptions={columnFilterOptions}
                                onColumnFilterChange={handleColumnFilterChange}
                                onViewDetails={handleViewDetails}
                                viewContext="by-client"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Drawer de Visualização de Faturamento (gerente não pode corrigir) */}
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
                canEdit={false}
            />
        </div>
    );
}

export default FaturamentoGerenteHub;
