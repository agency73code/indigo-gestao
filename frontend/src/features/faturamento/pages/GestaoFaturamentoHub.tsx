/**
 * GestaoFaturamentoHub
 * 
 * Hub unificado do GERENTE para gestão de faturamento.
 * Interface com tabs para navegação clara entre visões.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Check,
    CheckCircle2,
    Clock,
    Users,
    UserCircle,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    AlertCircle,
    Search,
    X,
    Loader2,
    DollarSign,
    FileCheck,
    Wallet,
    Paperclip,
    FileText,
    Image as ImageIcon,
    ExternalLink,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { FiltersPopover } from '@/components/ui/filters-popover';
import { type DateRangeValue } from '@/ui/date-range-picker-field';
import { cn } from '@/lib/utils';

import type { ItemFaturamento } from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    STATUS_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_COLORS,
} from '../types/faturamento.types';
import {
    listFaturamento,
    aprovarLancamentos,
} from '../services/faturamento-sessoes.service';
import { FaturamentoTable, type FaturamentoColumnFilters, type FaturamentoColumnFilterOptions } from '../components/FaturamentoTable';

// ============================================
// TIPOS
// ============================================

type TabType = 'aprovar' | 'terapeutas' | 'clientes';

interface TerapeutaGroupItem {
    terapeutaId: string;
    terapeutaNome: string;
    terapeutaAvatarUrl?: string;
    totalMinutos: number;
    totalValor: number;
    totalLancamentos: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    lancamentos: ItemFaturamento[];
}

interface ClienteGroupItem {
    clienteId: string;
    clienteNome: string;
    clienteAvatarUrl?: string;
    totalMinutos: number;
    totalValor: number;
    totalLancamentos: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    terapeutas: string[];
    lancamentos: ItemFaturamento[];
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

function getInitials(nome: string): string {
    return nome
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatarData(dataStr: string): string {
    return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

// ============================================
// COMPONENTES
// ============================================

interface TabButtonProps {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    count?: number;
    badge?: { value: number; variant: 'warning' | 'success' };
    onClick: () => void;
}

function TabButton({ active, icon, label, count, badge, onClick }: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
                active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            {icon}
            <span>{label}</span>
            {count !== undefined && (
                <span className="text-muted-foreground">
                    {count}
                </span>
            )}
            {badge && (
                <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full font-medium",
                    badge.variant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    badge.variant === 'success' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                )}>
                    {badge.value}
                </span>
            )}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
        </button>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subLabel?: string;
    variant?: 'default' | 'highlight';
}

function StatCard({ icon, label, value, subLabel, variant = 'default' }: StatCardProps) {
    return (
        <div className={cn(
            "rounded-xl p-4",
            variant === 'highlight' 
                ? "bg-zinc-900 dark:bg-zinc-800 text-white" 
                : "bg-card border"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    variant === 'highlight' ? "bg-white/10" : "bg-muted"
                )}>
                    {icon}
                </div>
                <div>
                    <p className={cn(
                        "text-xs",
                        variant === 'highlight' ? "text-zinc-400" : "text-muted-foreground"
                    )}>{label}</p>
                    <p className="text-lg font-medium">{value}</p>
                    {subLabel && (
                        <p className={cn(
                            "text-xs",
                            variant === 'highlight' ? "text-zinc-500" : "text-muted-foreground"
                        )}>{subLabel}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function GestaoFaturamentoHub() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();

    // Estado principal
    const [lancamentos, setLancamentos] = useState<ItemFaturamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('aprovar');
    const [searchValue, setSearchValue] = useState('');
    
    // Estado de filtros
    const [tipoAtividadeFilter, setTipoAtividadeFilter] = useState<string>('all');
    const [dateRangeValue, setDateRangeValue] = useState<DateRangeValue | undefined>(undefined);
    const [orderBy, setOrderBy] = useState<'recent' | 'oldest'>('recent');
    
    // Estado para aprovação
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Estado para drill-down
    const [expandedTerapeutaId, setExpandedTerapeutaId] = useState<string | null>(null);
    const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null);

    useEffect(() => {
        setPageTitle('Gestão de Faturamento');
        setNoMainContainer(true);
        return () => setNoMainContainer(false);
    }, [setPageTitle, setNoMainContainer]);

    // ============================================
    // CARREGAR DADOS
    // ============================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listFaturamento({ pageSize: 500 });
            setLancamentos(response.items);
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Erro ao carregar:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================================
    // DADOS COMPUTADOS
    // ============================================

    const pendentes = useMemo(() => 
        lancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE),
        [lancamentos]
    );

    const aprovados = useMemo(() => 
        lancamentos.filter(l => l.status === STATUS_FATURAMENTO.APROVADO),
        [lancamentos]
    );

    const stats = useMemo(() => {
        const totalMinutos = lancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0);
        const totalValor = lancamentos.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorPendente = pendentes.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);

        return {
            totalLancamentos: lancamentos.length,
            pendentes: pendentes.length,
            aprovados: aprovados.length,
            totalHoras: formatarHoras(totalMinutos),
            totalValor,
            valorPendente,
        };
    }, [lancamentos, pendentes, aprovados]);

    // Agrupar por terapeuta
    const groupedByTerapeuta = useMemo((): TerapeutaGroupItem[] => {
        const grouped: Record<string, TerapeutaGroupItem> = {};

        lancamentos.forEach(l => {
            if (!grouped[l.terapeutaId]) {
                grouped[l.terapeutaId] = {
                    terapeutaId: l.terapeutaId,
                    terapeutaNome: l.terapeutaNome,
                    terapeutaAvatarUrl: l.terapeutaAvatarUrl,
                    totalMinutos: 0,
                    totalValor: 0,
                    totalLancamentos: 0,
                    pendentes: 0,
                    aprovados: 0,
                    rejeitados: 0,
                    lancamentos: [],
                };
            }

            grouped[l.terapeutaId].lancamentos.push(l);
            grouped[l.terapeutaId].totalMinutos += l.duracaoMinutos;
            grouped[l.terapeutaId].totalValor += l.valorTotal ?? 0;
            grouped[l.terapeutaId].totalLancamentos += 1;

            if (l.status === STATUS_FATURAMENTO.PENDENTE) {
                grouped[l.terapeutaId].pendentes += 1;
            } else if (l.status === STATUS_FATURAMENTO.APROVADO) {
                grouped[l.terapeutaId].aprovados += 1;
            } else if (l.status === STATUS_FATURAMENTO.REJEITADO) {
                grouped[l.terapeutaId].rejeitados += 1;
            }
        });

        let result = Object.values(grouped);

        if (searchValue && activeTab === 'terapeutas') {
            const q = searchValue.toLowerCase();
            result = result.filter(t => t.terapeutaNome.toLowerCase().includes(q));
        }

        return result.sort((a, b) => b.pendentes - a.pendentes || b.totalMinutos - a.totalMinutos);
    }, [lancamentos, searchValue, activeTab]);

    // Agrupar por cliente
    const groupedByCliente = useMemo((): ClienteGroupItem[] => {
        const grouped: Record<string, ClienteGroupItem> = {};

        lancamentos.filter(l => l.clienteId && l.clienteNome).forEach(l => {
            const clienteId = l.clienteId!;
            if (!grouped[clienteId]) {
                grouped[clienteId] = {
                    clienteId,
                    clienteNome: l.clienteNome!,
                    clienteAvatarUrl: l.clienteAvatarUrl,
                    totalMinutos: 0,
                    totalValor: 0,
                    totalLancamentos: 0,
                    pendentes: 0,
                    aprovados: 0,
                    rejeitados: 0,
                    terapeutas: [],
                    lancamentos: [],
                };
            }

            grouped[clienteId].lancamentos.push(l);
            grouped[clienteId].totalMinutos += l.duracaoMinutos;
            grouped[clienteId].totalValor += l.valorTotal ?? 0;
            grouped[clienteId].totalLancamentos += 1;

            if (!grouped[clienteId].terapeutas.includes(l.terapeutaNome)) {
                grouped[clienteId].terapeutas.push(l.terapeutaNome);
            }

            if (l.status === STATUS_FATURAMENTO.PENDENTE) {
                grouped[clienteId].pendentes += 1;
            } else if (l.status === STATUS_FATURAMENTO.APROVADO) {
                grouped[clienteId].aprovados += 1;
            } else if (l.status === STATUS_FATURAMENTO.REJEITADO) {
                grouped[clienteId].rejeitados += 1;
            }
        });

        let result = Object.values(grouped);

        if (searchValue && activeTab === 'clientes') {
            const q = searchValue.toLowerCase();
            result = result.filter(c => c.clienteNome.toLowerCase().includes(q));
        }

        return result.sort((a, b) => a.clienteNome.localeCompare(b.clienteNome));
    }, [lancamentos, searchValue, activeTab]);

    // Pendentes filtrados
    const filteredPendentes = useMemo(() => {
        let result = pendentes;
        
        // Filtro de busca
        if (searchValue && activeTab === 'aprovar') {
            const q = searchValue.toLowerCase();
            result = result.filter(l =>
                l.terapeutaNome.toLowerCase().includes(q) ||
                l.clienteNome?.toLowerCase().includes(q) ||
                l.area?.toLowerCase().includes(q) ||
                l.programaNome?.toLowerCase().includes(q)
            );
        }
        
        // Filtro de tipo de atividade
        if (tipoAtividadeFilter && tipoAtividadeFilter !== 'all') {
            result = result.filter(l => l.tipoAtividade === tipoAtividadeFilter);
        }
        
        // Filtro de período
        if (dateRangeValue?.from) {
            const fromDate = new Date(dateRangeValue.from);
            fromDate.setHours(0, 0, 0, 0);
            result = result.filter(l => {
                const itemDate = new Date(l.data + 'T00:00:00');
                return itemDate >= fromDate;
            });
        }
        if (dateRangeValue?.to) {
            const toDate = new Date(dateRangeValue.to);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(l => {
                const itemDate = new Date(l.data + 'T00:00:00');
                return itemDate <= toDate;
            });
        }
        
        // Ordenação
        result = [...result].sort((a, b) => {
            const dateA = new Date(a.data + 'T' + a.horarioInicio);
            const dateB = new Date(b.data + 'T' + b.horarioInicio);
            return orderBy === 'recent' 
                ? dateB.getTime() - dateA.getTime()
                : dateA.getTime() - dateB.getTime();
        });
        
        return result;
    }, [pendentes, searchValue, activeTab, tipoAtividadeFilter, dateRangeValue, orderBy]);

    // ============================================
    // HANDLERS
    // ============================================

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredPendentes.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredPendentes.map(l => l.id)));
        }
    }, [selectedIds.size, filteredPendentes]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setSearchValue('');
        setSelectedIds(new Set());
        setExpandedTerapeutaId(null);
        setExpandedClienteId(null);
        // Limpar filtros ao trocar de tab
        setTipoAtividadeFilter('all');
        setDateRangeValue(undefined);
        setOrderBy('recent');
    }, []);

    const handleClearFilters = useCallback(() => {
        setTipoAtividadeFilter('all');
        setDateRangeValue(undefined);
        setOrderBy('recent');
    }, []);

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="flex flex-col h-full"> 
            {/* Header fixo com cards e tabs */}
            <div className="bg-background sticky top-0 z-10 p-4 pb-0">
                <div className="container space-y-4">


                    {/* Cards de estatísticas - fixos */}
                    {!loading && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard
                                icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                                label="Pendentes"
                                value={stats.pendentes}
                                subLabel={formatarValor(stats.valorPendente)}
                                variant="highlight"
                            />
                            <StatCard
                                icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                label="Aprovados"
                                value={stats.aprovados}
                            />
                            <StatCard
                                icon={<Clock className="h-5 w-5" />}
                                label="Total Horas"
                                value={stats.totalHoras}
                            />
                            <StatCard
                                icon={<DollarSign className="h-5 w-5" />}
                                label="Valor Total"
                                value={formatarValor(stats.totalValor)}
                            />
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-border">
                        <TabButton
                            active={activeTab === 'aprovar'}
                            icon={<FileCheck className="h-4 w-4" />}
                            label="Aprovar Horas"
                            badge={stats.pendentes > 0 ? { value: stats.pendentes, variant: 'warning' } : undefined}
                            onClick={() => handleTabChange('aprovar')}
                        />
                        <TabButton
                            active={activeTab === 'terapeutas'}
                            icon={<Users className="h-4 w-4" />}
                            label="Por Terapeuta"
                            count={groupedByTerapeuta.length}
                            onClick={() => handleTabChange('terapeutas')}
                        />
                        <TabButton
                            active={activeTab === 'clientes'}
                            icon={<UserCircle className="h-4 w-4" />}
                            label="Por Cliente"
                            count={groupedByCliente.length}
                            onClick={() => handleTabChange('clientes')}
                        />
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-h-0 p-4">
                <div className="container h-full">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="flex flex-col h-full gap-4">
                            {/* Barra de Ferramentas */}
                            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                {/* Busca - Lado Esquerdo */}
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={
                                            activeTab === 'aprovar' ? "Buscar por terapeuta, cliente, área..." :
                                            activeTab === 'terapeutas' ? "Buscar terapeuta..." :
                                            "Buscar cliente..."
                                        }
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
                                                placeholder: 'Todos os tipos',
                                                options: [
                                                    { value: 'all', label: 'Todos os tipos' },
                                                    { value: 'consultorio', label: 'Consultório' },
                                                    { value: 'homecare', label: 'Homecare' },
                                                    { value: 'reuniao', label: 'Reunião' },
                                                    { value: 'supervisao_recebida', label: 'Supervisão Recebida' },
                                                    { value: 'supervisao_dada', label: 'Supervisão Dada' },
                                                    { value: 'desenvolvimento_materiais', label: 'Desenv. Materiais' },
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
                                            tipoAtividade: tipoAtividadeFilter,
                                            periodo: dateRangeValue,
                                            orderBy: orderBy,
                                        }}
                                        onChange={(key, value) => {
                                            if (key === 'tipoAtividade') {
                                                setTipoAtividadeFilter(value as string);
                                            } else if (key === 'periodo') {
                                                setDateRangeValue(value as DateRangeValue);
                                            } else if (key === 'orderBy') {
                                                setOrderBy(value as 'recent' | 'oldest');
                                            }
                                        }}
                                        onClear={handleClearFilters}
                                        buttonText="Filtros"
                                        showBadge={true}
                                    />
                                </div>
                            </div>

                            {/* Lista baseada na tab ativa - ocupa espaço restante */}
                            <div className="flex-1 min-h-0">
                                {activeTab === 'aprovar' && (
                                    <AprovarHorasTab
                                        lancamentos={filteredPendentes}
                                        selectedIds={selectedIds}
                                        onToggleSelect={toggleSelect}
                                        onToggleSelectAll={toggleSelectAll}
                                    />
                                )}

                                {activeTab === 'terapeutas' && (
                                    <TerapeutasTab
                                        grupos={groupedByTerapeuta}
                                        expandedId={expandedTerapeutaId}
                                        onToggleExpand={(id) => setExpandedTerapeutaId(prev => prev === id ? null : id)}
                                    />
                                )}

                                {activeTab === 'clientes' && (
                                    <ClientesTab
                                        grupos={groupedByCliente}
                                        expandedId={expandedClienteId}
                                        onToggleExpand={(id) => setExpandedClienteId(prev => prev === id ? null : id)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// TAB: APROVAR HORAS
// ============================================

interface AprovarHorasTabProps {
    lancamentos: ItemFaturamento[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
}

function AprovarHorasTab({ lancamentos, selectedIds, onToggleSelect, onToggleSelectAll }: AprovarHorasTabProps) {
    // Estado para item expandido (detalhe)
    const [expandedId, setExpandedId] = useState<string | null>(null);
    // Estado para valores de ajuda de custo por item
    const [valoresAjudaCusto, setValoresAjudaCusto] = useState<Record<string, string>>({});
    // Estado de loading por item
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
    // Estado para rejeição com motivo
    const [rejeitandoId, setRejeitandoId] = useState<string | null>(null);
    const [motivoRejeicao, setMotivoRejeicao] = useState<string>('');

    const handleExpandToggle = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const handleAjudaCustoChange = (id: string, valor: string) => {
        // Permitir apenas números e vírgula
        const cleaned = valor.replace(/[^\d,]/g, '');
        setValoresAjudaCusto(prev => ({ ...prev, [id]: cleaned }));
    };

    const handleAprovar = async (lancamento: ItemFaturamento) => {
        setLoadingItems(prev => new Set(prev).add(lancamento.id));
        try {
            const valorAjudaCusto = valoresAjudaCusto[lancamento.id];
            const valorNumerico = valorAjudaCusto 
                ? parseFloat(valorAjudaCusto.replace(',', '.'))
                : undefined;

            // Se tem ajuda de custo mas não preencheu valor, mostrar erro
            if (lancamento.temAjudaCusto && (!valorAjudaCusto || valorNumerico === 0)) {
                toast.error('Informe o valor da ajuda de custo');
                return;
            }

            await aprovarLancamentos([lancamento.id]);
            toast.success('Lançamento aprovado!', {
                description: valorNumerico 
                    ? `Ajuda de custo: ${formatarValor(valorNumerico)}`
                    : undefined,
            });
            // Fechar expansão após aprovar
            setExpandedId(null);
        } catch (error) {
            toast.error('Erro ao aprovar lançamento');
        } finally {
            setLoadingItems(prev => {
                const next = new Set(prev);
                next.delete(lancamento.id);
                return next;
            });
        }
    };

    const handleIniciarRejeicao = (lancamento: ItemFaturamento) => {
        setRejeitandoId(lancamento.id);
        setMotivoRejeicao('');
    };

    const handleCancelarRejeicao = () => {
        setRejeitandoId(null);
        setMotivoRejeicao('');
    };

    const handleConfirmarRejeicao = async () => {
        if (!rejeitandoId) return;
        
        if (!motivoRejeicao.trim()) {
            toast.error('Informe o motivo da rejeição');
            return;
        }

        setLoadingItems(prev => new Set(prev).add(rejeitandoId));
        try {
            // TODO: Chamar API de rejeição com motivo
            // await rejeitarLancamento(rejeitandoId, motivoRejeicao);
            toast.success('Lançamento rejeitado', {
                description: 'O terapeuta será notificado com o motivo.',
            });
            setRejeitandoId(null);
            setMotivoRejeicao('');
            setExpandedId(null);
        } catch (error) {
            toast.error('Erro ao rejeitar lançamento');
        } finally {
            setLoadingItems(prev => {
                const next = new Set(prev);
                next.delete(rejeitandoId);
                return next;
            });
        }
    };

    if (lancamentos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Tudo aprovado!</h3>
                <p className="text-sm text-muted-foreground">
                    Não há lançamentos pendentes de aprovação.
                </p>
            </div>
        );
    }

    const isAllSelected = selectedIds.size === lancamentos.length;
    
    // Itens sem ajuda de custo podem ser aprovados em lote
    const lancamentosSemAjudaCusto = lancamentos.filter(l => !l.temAjudaCusto);
    const lancamentosComAjudaCusto = lancamentos.filter(l => l.temAjudaCusto);
    
    // Só contar selecionados que NÃO têm ajuda de custo para aprovação em lote
    const selectedSemAjudaCusto = Array.from(selectedIds).filter(
        id => !lancamentos.find(l => l.id === id)?.temAjudaCusto
    );
    const canApproveInBatch = selectedSemAjudaCusto.length > 0;

    return (
        <div className="space-y-3">
            {/* Header com select all - para ação em lote */}
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                <Checkbox
                    checked={isAllSelected && lancamentosSemAjudaCusto.length > 0}
                    onCheckedChange={onToggleSelectAll}
                    disabled={lancamentosSemAjudaCusto.length === 0}
                />
                <div className="flex-1">
                    <span className="text-sm text-muted-foreground">
                        {selectedIds.size > 0
                            ? `${selectedIds.size} de ${lancamentos.length} selecionado(s)`
                            : `Selecionar todos (${lancamentosSemAjudaCusto.length} sem ajuda de custo)`
                        }
                    </span>
                    {lancamentosComAjudaCusto.length > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            {lancamentosComAjudaCusto.length} item(ns) com ajuda de custo requer(em) aprovação individual
                        </p>
                    )}
                </div>
                {canApproveInBatch && (
                    <Button size="sm" variant="default" className="ml-auto gap-2">
                        <Check className="h-4 w-4" />
                        Aprovar {selectedSemAjudaCusto.length} selecionado(s)
                    </Button>
                )}
            </div>

            {/* Lista de lançamentos */}
            {lancamentos.map((lancamento) => {
                const isExpanded = expandedId === lancamento.id;
                const isLoading = loadingItems.has(lancamento.id);
                const temAjudaCusto = lancamento.temAjudaCusto;
                const temComprovantes = lancamento.comprovantesAjudaCusto && lancamento.comprovantesAjudaCusto.length > 0;

                return (
                    <div
                        key={lancamento.id}
                        className={cn(
                            "rounded-lg border transition-all overflow-hidden",
                            selectedIds.has(lancamento.id) && !isExpanded && "border-primary/30"
                        )}
                        style={{
                            backgroundColor: isExpanded 
                                ? 'var(--hub-card-background)' 
                                : selectedIds.has(lancamento.id) 
                                    ? 'var(--hub-card-background)' 
                                    : 'var(--hub-card-background)',
                        }}
                    >
                        {/* Linha principal - sempre visível */}
                        <div
                            className="flex items-center gap-4 p-4 cursor-pointer"
                            onClick={() => handleExpandToggle(lancamento.id)}
                        >
                            {/* Checkbox para seleção em lote - desabilitado para itens com ajuda de custo */}
                            <div className="relative">
                                <Checkbox
                                    checked={selectedIds.has(lancamento.id)}
                                    onCheckedChange={() => onToggleSelect(lancamento.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={temAjudaCusto}
                                    className={temAjudaCusto ? "opacity-50" : ""}
                                />
                            </div>

                            {/* Avatar terapeuta */}
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage
                                    src={lancamento.terapeutaAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${lancamento.terapeutaAvatarUrl}` : ''}
                                    alt={lancamento.terapeutaNome}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {getInitials(lancamento.terapeutaNome)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Info principal */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{lancamento.terapeutaNome}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                    <span className="truncate">{lancamento.clienteNome ?? 'Sem cliente'}</span>
                                    <span>•</span>
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            "text-xs shrink-0 border",
                                            TIPO_ATIVIDADE_FATURAMENTO_COLORS[lancamento.tipoAtividade]?.bg,
                                            TIPO_ATIVIDADE_FATURAMENTO_COLORS[lancamento.tipoAtividade]?.text,
                                            TIPO_ATIVIDADE_FATURAMENTO_COLORS[lancamento.tipoAtividade]?.border
                                        )}
                                    >
                                        {TIPO_ATIVIDADE_FATURAMENTO_LABELS[lancamento.tipoAtividade]}
                                    </Badge>
                                    {/* Indicador de ajuda de custo */}
                                    {temAjudaCusto && (
                                        <Badge className="text-xs gap-1 shrink-0 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                            <Wallet className="h-3 w-3" />
                                            Ajuda de custo
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Data e hora */}
                            <div className="text-right shrink-0">
                                <p className="text-sm">{formatarData(lancamento.data)}</p>
                                <p className="text-xs text-muted-foreground">{lancamento.horarioInicio}</p>
                            </div>

                            {/* Duração e valor */}
                            <div className="text-right shrink-0 w-24">
                                <p className="font-medium">{formatarHoras(lancamento.duracaoMinutos)}</p>
                                <p className="text-sm text-muted-foreground">{formatarValor(lancamento.valorTotal ?? 0)}</p>
                            </div>

                            {/* Seta de expansão */}
                            <ChevronDown
                                className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform shrink-0",
                                    isExpanded && "rotate-180"
                                )}
                            />
                        </div>

                        {/* Área expandida - detalhes e ações */}
                        {isExpanded && (
                            <div className="border-t bg-muted/20 p-4 space-y-4">
                                {/* Grid de informações */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Área</span>
                                        <p className="font-medium">{lancamento.area || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Programa</span>
                                        <p className="font-medium">{lancamento.programaNome || lancamento.finalidade || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Horário</span>
                                        <p className="font-medium">{lancamento.horarioInicio} - {lancamento.horarioFim}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Valor/hora</span>
                                        <p className="font-medium">{formatarValor(lancamento.valorHora ?? 0)}</p>
                                    </div>
                                </div>

                                {/* Seção Ajuda de Custo */}
                                {temAjudaCusto && (
                                    <div className="rounded-lg border bg-card">
                                        {/* Header da seção */}
                                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10">
                                                <Wallet className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <span className="font-medium text-sm">Ajuda de Custo Solicitada</span>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Descrição dos gastos do terapeuta */}
                                            {lancamento.motivoAjudaCusto && (
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Descrição dos gastos
                                                    </label>
                                                    <div className="mt-1.5 p-3 bg-muted/40 rounded-md text-sm">
                                                        {lancamento.motivoAjudaCusto}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Comprovantes */}
                                            {temComprovantes && (
                                                <div>
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                                        <Paperclip className="h-3 w-3" />
                                                        Comprovantes anexados
                                                    </label>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {lancamento.comprovantesAjudaCusto!.map((arquivo) => {
                                                            const isImage = arquivo.tipo.startsWith('image/');
                                                            return (
                                                                <a
                                                                    key={arquivo.id}
                                                                    href={arquivo.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="group flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/50 hover:border-primary/30 transition-all text-sm"
                                                                >
                                                                    <div className={cn(
                                                                        "flex items-center justify-center h-7 w-7 rounded",
                                                                        isImage ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20"
                                                                    )}>
                                                                        {isImage ? (
                                                                            <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        ) : (
                                                                            <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                        )}
                                                                    </div>
                                                                    <span className="truncate max-w-[180px]">{arquivo.nome}</span>
                                                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Input valor ajuda de custo */}
                                            <div className="flex items-center gap-4 pt-2 border-t">
                                                <label className="text-sm font-medium">
                                                    Valor a aprovar:
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                                                        R$
                                                    </span>
                                                    <Input
                                                        type="text"
                                                        placeholder="0,00"
                                                        value={valoresAjudaCusto[lancamento.id] || ''}
                                                        onChange={(e) => handleAjudaCustoChange(lancamento.id, e.target.value)}
                                                        className="w-28 pl-10 text-right font-medium"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ações */}
                                <div className="flex items-center justify-between pt-3 border-t">
                                    {/* Resumo de valor */}
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total a pagar</span>
                                        <p className="text-base font-normal">
                                            {formatarValor(
                                                (lancamento.valorTotal ?? 0) +
                                                (valoresAjudaCusto[lancamento.id]
                                                    ? parseFloat(valoresAjudaCusto[lancamento.id].replace(',', '.') || '0')
                                                    : 0)
                                            )}
                                        </p>
                                    </div>

                                    {/* Botões */}
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleIniciarRejeicao(lancamento);
                                            }}
                                            disabled={isLoading || rejeitandoId === lancamento.id}
                                        >
                                            <XCircle className="h-4 w-4 mr-1.5" />
                                            Rejeitar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAprovar(lancamento);
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                            )}
                                            Aprovar
                                        </Button>
                                    </div>
                                </div>

                                {/* Modal de Rejeição inline */}
                                {rejeitandoId === lancamento.id && (
                                    <div className="rounded-lg border border-destructive/30 bg-card overflow-hidden">
                                        {/* Header */}
                                        <div className="flex items-center gap-2 px-4 py-3 border-b bg-destructive/5">
                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-destructive/10">
                                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                                            </div>
                                            <span className="font-medium text-sm">Rejeitar Lançamento</span>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                Informe o motivo da rejeição. O terapeuta receberá essa informação para poder corrigir e reenviar.
                                            </p>
                                            
                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    Motivo da rejeição
                                                </label>
                                                <textarea
                                                    placeholder="Ex: Horário informado não confere com a agenda. Por favor, verifique e corrija."
                                                    value={motivoRejeicao}
                                                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                                                    className="mt-1.5 w-full p-3 border rounded-md text-sm resize-none bg-background focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                                                    rows={3}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>

                                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelarRejeicao();
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConfirmarRejeicao();
                                                    }}
                                                    disabled={loadingItems.has(lancamento.id)}
                                                >
                                                    {loadingItems.has(lancamento.id) ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                    )}
                                                    Confirmar Rejeição
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ============================================
// TAB: POR TERAPEUTA
// ============================================

interface TerapeutasTabProps {
    grupos: TerapeutaGroupItem[];
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
}

function TerapeutasTab({ grupos, expandedId, onToggleExpand }: TerapeutasTabProps) {
    // Estado de filtros de coluna para a tabela expandida
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        tipoAtividade: undefined,
        status: undefined,
    });

    // Resetar filtros ao mudar de terapeuta
    useEffect(() => {
        setColumnFilters({ tipoAtividade: undefined, status: undefined });
    }, [expandedId]);

    // Grupo expandido atual
    const expandedGrupo = useMemo(() => {
        if (!expandedId) return null;
        return grupos.find(g => g.terapeutaId === expandedId);
    }, [grupos, expandedId]);

    // Lançamentos filtrados para o grupo expandido
    const filteredLancamentos = useMemo(() => {
        if (!expandedGrupo) return [];
        let items = expandedGrupo.lancamentos;
        if (columnFilters.tipoAtividade) {
            items = items.filter(l => l.tipoAtividade === columnFilters.tipoAtividade);
        }
        if (columnFilters.status) {
            items = items.filter(l => l.status === columnFilters.status);
        }
        return items;
    }, [expandedGrupo, columnFilters]);

    // Opções de filtro para a tabela
    const filterOptions: FaturamentoColumnFilterOptions = useMemo(() => {
        if (!expandedGrupo) return { tipoAtividade: [], status: [] };
        
        const tipoSet = new Set<string>();
        const statusSet = new Set<string>();
        expandedGrupo.lancamentos.forEach(l => {
            tipoSet.add(l.tipoAtividade);
            statusSet.add(l.status);
        });

        return {
            tipoAtividade: Array.from(tipoSet).map(tipo => ({
                value: tipo,
                label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo as keyof typeof TIPO_ATIVIDADE_FATURAMENTO_LABELS] ?? tipo,
            })),
            status: Array.from(statusSet).map(status => ({
                value: status,
                label: STATUS_FATURAMENTO_LABELS[status as keyof typeof STATUS_FATURAMENTO_LABELS] ?? status,
            })),
        };
    }, [expandedGrupo]);

    if (grupos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum terapeuta encontrado</h3>
                <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca.
                </p>
            </div>
        );
    }

    // Se tem um terapeuta expandido, mostrar a visualização com tabela
    if (expandedGrupo) {
        return (
            <div className="flex flex-col h-full">
                {/* Header do terapeuta selecionado - fixo */}
                <div className="shrink-0">
                    <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        style={{
                            backgroundColor: 'var(--hub-card-background)',
                            borderRadius: 'var(--radius)'
                        }}
                        onClick={() => onToggleExpand(expandedGrupo.terapeutaId)}
                    >
                        <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0" />
                        <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage
                                src={expandedGrupo.terapeutaAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${expandedGrupo.terapeutaAvatarUrl}` : ''}
                                alt={expandedGrupo.terapeutaNome}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(expandedGrupo.terapeutaNome)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{expandedGrupo.terapeutaNome}</h3>
                            <p className="text-sm text-muted-foreground">
                                {expandedGrupo.totalLancamentos} lançamentos • {formatarHoras(expandedGrupo.totalMinutos)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {expandedGrupo.pendentes > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    {expandedGrupo.pendentes} pendente{expandedGrupo.pendentes > 1 ? 's' : ''}
                                </Badge>
                            )}
                            {expandedGrupo.aprovados > 0 && (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {expandedGrupo.aprovados} aprovado{expandedGrupo.aprovados > 1 ? 's' : ''}
                                </Badge>
                            )}
                            {expandedGrupo.rejeitados > 0 && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    {expandedGrupo.rejeitados} rejeitado{expandedGrupo.rejeitados > 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabela com filtros - com scroll */}
                <div className="flex-1 min-h-0 overflow-auto mt-4">
                    <FaturamentoTable
                        data={filteredLancamentos}
                        columnFilters={columnFilters}
                        filterOptions={filterOptions}
                        onColumnFilterChange={setColumnFilters}
                        onViewDetails={(item) => toast.info(`Ver detalhes: ${item.id}`)}
                    />
                </div>
            </div>
        );
    }

    // Lista de terapeutas
    return (
        <div className="space-y-3">
            {grupos.map((grupo) => (
                <div
                    key={grupo.terapeutaId}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    style={{
                        backgroundColor: 'var(--hub-card-background)',
                        borderRadius: 'var(--radius)'
                    }}
                    onClick={() => onToggleExpand(grupo.terapeutaId)}
                >
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />

                    <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage
                            src={grupo.terapeutaAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${grupo.terapeutaAvatarUrl}` : ''}
                            alt={grupo.terapeutaNome}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(grupo.terapeutaNome)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{grupo.terapeutaNome}</h3>
                        <p className="text-sm text-muted-foreground">
                            {formatarHoras(grupo.totalMinutos)} • {formatarValor(grupo.totalValor)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {grupo.pendentes > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                {grupo.pendentes} pendente{grupo.pendentes > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {grupo.aprovados > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                {grupo.aprovados} aprovado{grupo.aprovados > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {grupo.rejeitados > 0 && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                {grupo.rejeitados} rejeitado{grupo.rejeitados > 1 ? 's' : ''}
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {grupo.totalLancamentos} lançamento{grupo.totalLancamentos > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// TAB: POR CLIENTE
// ============================================

interface ClientesTabProps {
    grupos: ClienteGroupItem[];
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
}

function ClientesTab({ grupos, expandedId, onToggleExpand }: ClientesTabProps) {
    // Estado de filtros de coluna para a tabela expandida
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        tipoAtividade: undefined,
        status: undefined,
    });

    // Resetar filtros ao mudar de cliente
    useEffect(() => {
        setColumnFilters({ tipoAtividade: undefined, status: undefined });
    }, [expandedId]);

    // Grupo expandido atual
    const expandedGrupo = useMemo(() => {
        if (!expandedId) return null;
        return grupos.find(g => g.clienteId === expandedId);
    }, [grupos, expandedId]);

    // Lançamentos filtrados para o grupo expandido
    const filteredLancamentos = useMemo(() => {
        if (!expandedGrupo) return [];
        let items = expandedGrupo.lancamentos;
        if (columnFilters.tipoAtividade) {
            items = items.filter(l => l.tipoAtividade === columnFilters.tipoAtividade);
        }
        if (columnFilters.status) {
            items = items.filter(l => l.status === columnFilters.status);
        }
        return items;
    }, [expandedGrupo, columnFilters]);

    // Opções de filtro para a tabela
    const filterOptions: FaturamentoColumnFilterOptions = useMemo(() => {
        if (!expandedGrupo) return { tipoAtividade: [], status: [] };
        
        const tipoSet = new Set<string>();
        const statusSet = new Set<string>();
        expandedGrupo.lancamentos.forEach(l => {
            tipoSet.add(l.tipoAtividade);
            statusSet.add(l.status);
        });

        return {
            tipoAtividade: Array.from(tipoSet).map(tipo => ({
                value: tipo,
                label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo as keyof typeof TIPO_ATIVIDADE_FATURAMENTO_LABELS] ?? tipo,
            })),
            status: Array.from(statusSet).map(status => ({
                value: status,
                label: STATUS_FATURAMENTO_LABELS[status as keyof typeof STATUS_FATURAMENTO_LABELS] ?? status,
            })),
        };
    }, [expandedGrupo]);

    if (grupos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
                <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca.
                </p>
            </div>
        );
    }

    // Se tem um cliente expandido, mostrar a visualização com tabela
    if (expandedGrupo) {
        return (
            <div className="flex flex-col h-full">
                {/* Header do cliente selecionado - fixo */}
                <div className="shrink-0">
                    <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        style={{
                            backgroundColor: 'var(--hub-card-background)',
                            borderRadius: 'var(--radius)'
                        }}
                        onClick={() => onToggleExpand(expandedGrupo.clienteId)}
                    >
                        <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0" />
                        <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage
                                src={expandedGrupo.clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${expandedGrupo.clienteAvatarUrl}` : ''}
                                alt={expandedGrupo.clienteNome}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(expandedGrupo.clienteNome)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{expandedGrupo.clienteNome}</h3>
                            <p className="text-sm text-muted-foreground">
                                {expandedGrupo.totalLancamentos} lançamentos • {expandedGrupo.terapeutas.length} terapeuta(s)
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {expandedGrupo.pendentes > 0 && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    {expandedGrupo.pendentes} pendente{expandedGrupo.pendentes > 1 ? 's' : ''}
                                </Badge>
                            )}
                            {expandedGrupo.aprovados > 0 && (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {expandedGrupo.aprovados} aprovado{expandedGrupo.aprovados > 1 ? 's' : ''}
                                </Badge>
                            )}
                            {expandedGrupo.rejeitados > 0 && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    {expandedGrupo.rejeitados} rejeitado{expandedGrupo.rejeitados > 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabela com filtros - com scroll */}
                <div className="flex-1 min-h-0 overflow-auto mt-4">
                    <FaturamentoTable
                        data={filteredLancamentos}
                        columnFilters={columnFilters}
                        filterOptions={filterOptions}
                        onColumnFilterChange={setColumnFilters}
                        onViewDetails={(item) => toast.info(`Ver detalhes: ${item.id}`)}
                    />
                </div>
            </div>
        );
    }

    // Lista de clientes
    return (
        <div className="space-y-3">
            {grupos.map((grupo) => (
                <div
                    key={grupo.clienteId}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    style={{
                        backgroundColor: 'var(--hub-card-background)',
                        borderRadius: 'var(--radius)'
                    }}
                    onClick={() => onToggleExpand(grupo.clienteId)}
                >
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />

                    <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage
                            src={grupo.clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${grupo.clienteAvatarUrl}` : ''}
                            alt={grupo.clienteNome}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(grupo.clienteNome)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{grupo.clienteNome}</h3>
                        <p className="text-sm text-muted-foreground">
                            {formatarHoras(grupo.totalMinutos)} • {formatarValor(grupo.totalValor)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {grupo.pendentes > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">
                                {grupo.pendentes} pendente{grupo.pendentes > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {grupo.aprovados > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">
                                {grupo.aprovados} aprovado{grupo.aprovados > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {grupo.rejeitados > 0 && (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100">
                                {grupo.rejeitados} rejeitado{grupo.rejeitados > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GestaoFaturamentoHub;
