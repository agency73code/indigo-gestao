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
    FileDown,
    Image as ImageIcon,
    ExternalLink,
    XCircle,
    LayoutList,
    MoreHorizontal,
    FileBarChart,
} from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { FiltersPopover } from '@/components/ui/filters-popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { CloseButton } from '@/components/layout/CloseButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    aprovarLancamento,
    rejeitarLancamento,
} from '../services/faturamento-sessoes.service';
import { gerarRelatorioFaturamento, exportarRelatorioWord } from '../services/relatorio-faturamento.service';
import { FaturamentoTable, type FaturamentoColumnFilters, type FaturamentoColumnFilterOptions } from '../components/FaturamentoTable';
import { BillingDrawer } from '../components/BillingDrawer';
import { useBillingCorrection } from '../hooks/useBillingCorrection';
import type { BillingLancamento } from '../types/billingCorrection';
import { ORIGEM_LANCAMENTO } from '../types/faturamento.types';

// ============================================
// TIPOS
// ============================================

type TabType = 'aprovar' | 'terapeutas' | 'clientes' | 'relatorios';

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

interface StatsCardPrimaryProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    items?: Array<{ label: string; value: string }>;
    sparklineData?: Array<{ date: string; dateFormatted: string; value: number }>;
    onMoreClick?: () => void;
    onClick?: () => void;
}

// Tooltip customizado para o sparkline
function SparklineTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { dateFormatted: string; value: number } }> }) {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    return (
        <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
            <p className="font-medium text-foreground">{data.dateFormatted}</p>
            <p className="text-primary font-semibold">
                {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </div>
    );
}

function StatsCardPrimary({ icon, label, value, items, sparklineData, onMoreClick, onClick }: StatsCardPrimaryProps) {
    return (
        <div 
            className="bg-primary rounded-xl p-5 pb-4 relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:brightness-110"
            onClick={onClick}
        >
            {/* Botão de três pontinhos - sempre visível */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoreClick?.();
                            }}
                            className="absolute top-3 right-3 p-1 rounded-md hover:bg-primary-foreground/10 transition-colors text-primary-foreground/70 hover:text-primary-foreground z-10"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver mais</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {/* Sparkline com gradiente */}
            {sparklineData && sparklineData.length > 0 && (
                <div className="absolute top-10 right-5 w-24 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>
                            <RechartsTooltip
                                content={<SparklineTooltip />}
                                cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth={2}
                                fill="url(#sparklineGradient)"
                                dot={false}
                                activeDot={{ r: 4, fill: 'white', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div className="flex items-center gap-4 min-h-[48px]">
                <div className="p-2 bg-primary-foreground/10 rounded-lg text-primary-foreground">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-primary-foreground/70">{label}</p>
                    <p className="text-1xl font-normal text-primary-foreground">{value}</p>
                </div>
            </div>
            {items && items.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-primary-foreground/20 pt-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-primary-foreground/70">{item.label}</span>
                            <span className="text-primary-foreground font-normal">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
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
    items?: Array<{ label: string; value: string }>;
    sparklineData?: Array<{ date: string; dateFormatted: string; value: number }>;
    bottomSparklineData?: Array<{ date: string; dateFormatted: string; value: number }>;
    progressPercent?: number; // 0-100 para mostrar gráfico circular
    progressColor?: 'primary' | 'success' | 'warning';
    progressLabel?: string; // Label para o tooltip do gráfico circular
    totalCount?: number; // Total para mostrar no tooltip
    onMoreClick?: () => void;
    isActive?: boolean;
    onClick?: () => void;
}

function StatsCardSecondary({ icon, label, value, subValue, badge, items, sparklineData, bottomSparklineData, progressPercent, progressColor = 'primary', progressLabel, totalCount, onMoreClick, isActive, onClick }: StatsCardSecondaryProps) {
    // ID único para o gradiente do sparkline
    const gradientId = `sparklineGradientSecondary-${label.replace(/\s/g, '')}`;
    const bottomGradientId = `bottomSparklineGradient-${label.replace(/\s/g, '')}`;
    
    // Dados para o gráfico circular com label para tooltip
    const progressData = progressPercent !== undefined ? [{ 
        value: progressPercent, 
        fill: 'currentColor',
        label: progressLabel || label,
        count: typeof value === 'number' ? value : 0,
        total: totalCount || 0
    }] : null;
    
    // Cor do progresso
    const progressColorClass = progressColor === 'success' 
        ? 'text-emerald-500' 
        : progressColor === 'warning' 
            ? 'text-amber-500' 
            : 'text-primary';
    
    return (
        <div
            className={cn(
                "bg-card border rounded-xl p-5 pb-4 relative cursor-pointer transition-all hover:shadow-md hover:border-primary/20",
                isActive && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={onClick}
        >
            {/* Botão de três pontinhos */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoreClick?.();
                            }}
                            className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground z-10"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver mais</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            
            {/* Gráfico Circular de Progresso */}
            {progressData && (
                <div className={cn("absolute top-5 right-10 w-14 h-14", progressColorClass)} style={{ overflow: 'visible' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="70%"
                            outerRadius="100%"
                            data={progressData}
                            startAngle={90}
                            endAngle={-270}
                            style={{ overflow: 'visible' }}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RechartsTooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-xs whitespace-nowrap">
                                            <p className="font-medium text-foreground">{data.label}</p>
                                            <p className="text-muted-foreground">
                                                {data.count} de {data.total} ({data.value}%)
                                            </p>
                                        </div>
                                    );
                                }}
                                cursor={false}
                                wrapperStyle={{ zIndex: 100 }}
                                position={{ x: -100, y: 0 }}
                            />
                            <RadialBar
                                background={{ fill: '#e5e7eb' }}
                                dataKey="value"
                                cornerRadius={10}
                                fill="currentColor"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            {/* Sparkline com gradiente */}
            {sparklineData && sparklineData.length > 0 && !progressData && (
                <div className="absolute top-10 right-5 w-24 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <RechartsTooltip
                                content={<SparklineTooltip />}
                                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeOpacity: 0.3 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                strokeOpacity={0.6}
                                fill={`url(#${gradientId})`}
                                dot={false}
                                activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeOpacity: 0.3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            {/* Ícone + Label + Value na mesma linha */}
            <div className="flex items-center gap-4 min-h-[48px]">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-normal">{value}</p>
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
            
            {/* Items - A pagar / A receber */}
            {items && items.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-border pt-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="text-foreground font-normal">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Bottom Sparkline - Linha na parte inferior do card */}
            {bottomSparklineData && bottomSparklineData.length > 0 && (
                <div className="mt-4 h-10 -mx-1 -mb-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={bottomSparklineData} margin={{ top: 5, right: 4, left: 4, bottom: 4 }}>
                            <defs>
                                <linearGradient id={bottomGradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
                                    <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                                </linearGradient>
                            </defs>
                            <RechartsTooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
                                            <p className="font-medium text-foreground">{data.dateFormatted}</p>
                                            <p className="text-emerald-600 font-semibold">{data.value} lançamentos</p>
                                        </div>
                                    );
                                }}
                                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeOpacity: 0.3 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="rgba(16,185,129,0.8)"
                                strokeWidth={2}
                                fill={`url(#${bottomGradientId})`}
                                dot={false}
                                activeDot={{ r: 4, fill: '#10b981', stroke: 'rgba(16,185,129,0.5)', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primeiro card - estilo primário */}
                <div className="bg-primary rounded-xl p-5">
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-9 w-9 rounded-lg bg-primary-foreground/10" />
                    </div>
                    <div className="mt-4 space-y-1">
                        <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
                        <Skeleton className="h-7 w-24 bg-primary-foreground/20" />
                    </div>
                </div>
                {/* Cards secundários */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-card border rounded-xl p-5">
                        <div className="flex items-start justify-between">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <Skeleton className="h-4 w-6" />
                        </div>
                        <div className="mt-4 space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-7 w-16" />
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
    
    // Estado para drawer de detalhes
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
    const [drawerType, setDrawerType] = useState<'valor' | 'lancamentos' | 'aprovados' | 'pendentes'>('valor');
    
    // Handler para abrir drawer de detalhes
    const openDetailsDrawer = useCallback((type: 'valor' | 'lancamentos' | 'aprovados' | 'pendentes') => {
        setDrawerType(type);
        setShowDetailsDrawer(true);
    }, []);

    // Handler para visualizar detalhes (igual ao terapeuta)
    const handleViewDetails = useCallback((item: ItemFaturamento) => {
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

    const rejeitados = useMemo(() => 
        lancamentos.filter(l => l.status === STATUS_FATURAMENTO.REJEITADO),
        [lancamentos]
    );

    const stats = useMemo(() => {
        const totalMinutos = lancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0);
        const totalValor = lancamentos.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorPendente = pendentes.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorAprovado = aprovados.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        
        // Valor do terapeuta (o que a clínica paga ao terapeuta)
        const totalValorTerapeuta = lancamentos.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        // Valor do cliente (o que o cliente paga à clínica)
        const totalValorCliente = lancamentos.reduce((acc, l) => acc + (l.valorTotalCliente ?? l.valorTotal ?? 0), 0);
        
        // Valores aprovados separados
        const valorAprovadoTerapeuta = aprovados.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorAprovadoCliente = aprovados.reduce((acc, l) => acc + (l.valorTotalCliente ?? l.valorTotal ?? 0), 0);
        
        // Valores pendentes separados
        const valorPendenteTerapeuta = pendentes.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorPendenteCliente = pendentes.reduce((acc, l) => acc + (l.valorTotalCliente ?? l.valorTotal ?? 0), 0);
        
        // Valores rejeitados
        const valorRejeitado = rejeitados.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorRejeitadoTerapeuta = rejeitados.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorRejeitadoCliente = rejeitados.reduce((acc, l) => acc + (l.valorTotalCliente ?? l.valorTotal ?? 0), 0);

        return {
            totalLancamentos: lancamentos.length,
            pendentes: pendentes.length,
            aprovados: aprovados.length,
            rejeitados: rejeitados.length,
            totalHoras: formatarHoras(totalMinutos),
            totalValor,
            valorPendente,
            valorAprovado,
            valorRejeitado,
            totalValorTerapeuta,
            totalValorCliente,
            valorAprovadoTerapeuta,
            valorAprovadoCliente,
            valorPendenteTerapeuta,
            valorPendenteCliente,
            valorRejeitadoTerapeuta,
            valorRejeitadoCliente,
        };
    }, [lancamentos, pendentes, aprovados, rejeitados]);

    // Dados para o sparkline - agrupa valores por data (últimos 7 dias)
    const sparklineData = useMemo(() => {
        // Agrupar lançamentos por data
        const valorPorData: Record<string, number> = {};
        
        lancamentos.forEach(l => {
            const data = l.data;
            valorPorData[data] = (valorPorData[data] || 0) + (l.valorTotal ?? 0);
        });
        
        // Ordenar por data e pegar os últimos registros
        const sortedDates = Object.keys(valorPorData).sort();
        const recentDates = sortedDates.slice(-10);
        
        return recentDates.map(data => ({
            date: data,
            dateFormatted: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: valorPorData[data],
        }));
    }, [lancamentos]);

    // Dados para o sparkline de lançamentos - agrupa quantidade por data
    const lancamentosSparklineData = useMemo(() => {
        // Agrupar lançamentos por data (contagem)
        const countPorData: Record<string, number> = {};
        
        lancamentos.forEach(l => {
            const data = l.data;
            countPorData[data] = (countPorData[data] || 0) + 1;
        });
        
        // Ordenar por data e pegar os últimos registros
        const sortedDates = Object.keys(countPorData).sort();
        const recentDates = sortedDates.slice(-10);
        
        return recentDates.map(data => ({
            date: data,
            dateFormatted: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: countPorData[data],
        }));
    }, [lancamentos]);

    // Sparkline de aprovados por data
    const aprovadosSparklineData = useMemo(() => {
        const valorPorData: Record<string, number> = {};
        aprovados.forEach(l => {
            const data = l.data;
            valorPorData[data] = (valorPorData[data] || 0) + (l.valorTotal ?? 0);
        });
        const sortedDates = Object.keys(valorPorData).sort();
        return sortedDates.map(data => ({
            date: data,
            dateFormatted: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: valorPorData[data],
        }));
    }, [aprovados]);

    // Sparkline de pendentes por data
    const pendentesSparklineData = useMemo(() => {
        const valorPorData: Record<string, number> = {};
        pendentes.forEach(l => {
            const data = l.data;
            valorPorData[data] = (valorPorData[data] || 0) + (l.valorTotal ?? 0);
        });
        const sortedDates = Object.keys(valorPorData).sort();
        return sortedDates.map(data => ({
            date: data,
            dateFormatted: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: valorPorData[data],
        }));
    }, [pendentes]);

    // Sparkline de rejeitados por data
    const rejeitadosSparklineData = useMemo(() => {
        const valorPorData: Record<string, number> = {};
        rejeitados.forEach(l => {
            const data = l.data;
            valorPorData[data] = (valorPorData[data] || 0) + (l.valorTotal ?? 0);
        });
        const sortedDates = Object.keys(valorPorData).sort();
        return sortedDates.map(data => ({
            date: data,
            dateFormatted: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: valorPorData[data],
        }));
    }, [rejeitados]);

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


                    {/* Cards de estatísticas - igual ao Minhas Horas do terapeuta */}
                    {!loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card Primário - Valor Total (destaque) */}
                            <StatsCardPrimary
                                icon={<DollarSign className="h-5 w-5" />}
                                label="Valor Total"
                                value={formatarValor(stats.totalValor)}
                                items={[
                                    { label: 'A pagar', value: formatarValor(stats.totalValorTerapeuta) },
                                    { label: 'A receber', value: formatarValor(stats.totalValorCliente) },
                                ]}
                                sparklineData={sparklineData}
                                onClick={() => openDetailsDrawer('valor')}
                                onMoreClick={() => openDetailsDrawer('valor')}
                            />

                            {/* Card Secundário - Total de Lançamentos */}
                            <StatsCardSecondary
                                icon={<LayoutList className="h-5 w-5" />}
                                label="Total de Lançamentos"
                                value={lancamentos.length}
                                bottomSparklineData={lancamentosSparklineData}
                                onClick={() => openDetailsDrawer('lancamentos')}
                                onMoreClick={() => openDetailsDrawer('lancamentos')}
                            />

                            {/* Card Secundário - Aprovados */}
                            <StatsCardSecondary
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                label="Aprovados"
                                value={stats.aprovados}
                                badge={lancamentos.length > 0 ? {
                                    value: `${Math.round((stats.aprovados / lancamentos.length) * 100)}%`,
                                    variant: 'success'
                                } : undefined}
                                progressPercent={lancamentos.length > 0 ? Math.round((stats.aprovados / lancamentos.length) * 100) : 0}
                                progressColor="success"
                                totalCount={lancamentos.length}
                                items={[
                                    { label: 'A pagar', value: formatarValor(stats.valorAprovadoTerapeuta) },
                                    { label: 'A receber', value: formatarValor(stats.valorAprovadoCliente) },
                                ]}
                                onClick={() => openDetailsDrawer('aprovados')}
                                onMoreClick={() => openDetailsDrawer('aprovados')}
                            />

                            {/* Card Secundário - Pendentes */}
                            <StatsCardSecondary
                                icon={stats.pendentes > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                label="Pendentes"
                                value={stats.pendentes}
                                badge={stats.pendentes > 0 ? {
                                    value: `${stats.pendentes} aguardando`,
                                    variant: 'warning'
                                } : undefined}
                                progressPercent={lancamentos.length > 0 ? Math.round((stats.pendentes / lancamentos.length) * 100) : 0}
                                progressColor="warning"
                                totalCount={lancamentos.length}
                                items={[
                                    { label: 'A pagar', value: formatarValor(stats.valorPendenteTerapeuta) },
                                    { label: 'A receber', value: formatarValor(stats.valorPendenteCliente) },
                                ]}
                                onClick={() => openDetailsDrawer('pendentes')}
                                onMoreClick={() => openDetailsDrawer('pendentes')}
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
                        <TabButton
                            active={activeTab === 'relatorios'}
                            icon={<FileBarChart className="h-4 w-4" />}
                            label="Relatórios"
                            onClick={() => handleTabChange('relatorios')}
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
                                        onRefresh={loadData}
                                    />
                                )}

                                {activeTab === 'terapeutas' && (
                                    <TerapeutasTab
                                        grupos={groupedByTerapeuta}
                                        expandedId={expandedTerapeutaId}
                                        onToggleExpand={(id) => setExpandedTerapeutaId(prev => prev === id ? null : id)}
                                        onViewDetails={handleViewDetails}
                                        lancamentos={lancamentos}
                                    />
                                )}

                                {activeTab === 'clientes' && (
                                    <ClientesTab
                                        grupos={groupedByCliente}
                                        expandedId={expandedClienteId}
                                        onToggleExpand={(id) => setExpandedClienteId(prev => prev === id ? null : id)}
                                        onViewDetails={handleViewDetails}
                                        lancamentos={lancamentos}
                                    />
                                )}

                                {activeTab === 'relatorios' && (
                                    <RelatoriosTab
                                        lancamentos={lancamentos}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer de Visualização/Correção de Faturamento (igual ao terapeuta) */}
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

            {/* Drawer de Detalhes - Ver mais */}
            <Sheet open={showDetailsDrawer} onOpenChange={setShowDetailsDrawer}>
                <SheetContent side="right" className="w-[80vw] max-w-[1000px] p-0 flex flex-col gap-0">
                    {/* Header */}
                    <div className="flex items-center gap-4 px-4 py-4 bg-background shrink-0 rounded-2xl">
                        <CloseButton onClick={() => setShowDetailsDrawer(false)} />
                        <SheetTitle 
                            style={{ 
                                fontSize: 'var(--page-title-font-size)',
                                fontWeight: 'var(--page-title-font-weight)',
                                fontFamily: 'var(--page-title-font-family)',
                                color: 'hsl(var(--foreground))'
                            }}
                        >
                            {drawerType === 'valor' ? 'Análise de Valores' : 'Análise de Lançamentos'}
                        </SheetTitle>
                    </div>
                    
                    {/* Content Area - igual ao padrão do sistema */}
                    <div className="flex flex-1 min-h-0 p-2 gap-2 bg-background rounded-2xl">
                        {/* Caixa de conteúdo */}
                        <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
                            {/* Conteúdo scrollável */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                                
                                {/* Gráficos por Status - Drawer de Valores */}
                                {drawerType === 'valor' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Card 1 - Valor Total */}
                                        <div className="bg-primary rounded-xl p-5 pb-4 relative overflow-hidden">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-2 bg-primary-foreground/10 rounded-lg text-primary-foreground">
                                                    <DollarSign className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-primary-foreground/70">Valor Total</p>
                                                    <p className="text-xl font-normal text-primary-foreground">{formatarValor(stats.totalValor)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 border-t border-primary-foreground/20 pt-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-primary-foreground/70">A pagar</span>
                                                    <span className="text-primary-foreground font-normal">{formatarValor(stats.totalValorTerapeuta)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-primary-foreground/70">A receber</span>
                                                    <span className="text-primary-foreground font-normal">{formatarValor(stats.totalValorCliente)}</span>
                                                </div>
                                            </div>
                                            <div className="h-36">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={sparklineData} margin={{ top: 10, right: 16, left: 16, bottom: 10 }}>
                                                        <defs>
                                                            <linearGradient id="drawerValueGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                                                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                                            </linearGradient>
                                                        </defs>
                                                        <RechartsTooltip content={<SparklineTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }} />
                                                        <Area type="monotone" dataKey="value" stroke="rgba(255,255,255,0.8)" strokeWidth={2} fill="url(#drawerValueGradient)" dot={{ r: 3, fill: 'white', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2 }} activeDot={{ r: 5, fill: 'white', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Card 2 - Aprovados */}
                                        <div className="bg-background rounded-xl p-5 pb-4 border relative overflow-hidden">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Aprovados</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-normal">{stats.aprovados}</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            {lancamentos.length > 0 ? Math.round((stats.aprovados / lancamentos.length) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 border-t border-border pt-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">A pagar</span>
                                                    <span className="text-foreground font-normal">{formatarValor(stats.valorAprovadoTerapeuta)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">A receber</span>
                                                    <span className="text-foreground font-normal">{formatarValor(stats.valorAprovadoCliente)}</span>
                                                </div>
                                            </div>
                                            <div className="h-36">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={aprovadosSparklineData} margin={{ top: 10, right: 16, left: 16, bottom: 10 }}>
                                                        <defs>
                                                            <linearGradient id="drawerAprovadosGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <RechartsTooltip content={<SparklineTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeOpacity: 0.3 }} />
                                                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#drawerAprovadosGradient)" dot={{ r: 3, fill: '#10b981', stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Card 3 - Pendentes */}
                                        <div className="bg-background rounded-xl p-5 pb-4 border relative overflow-hidden">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                                    <AlertCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Pendentes</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-normal">{stats.pendentes}</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                            {stats.pendentes} aguardando
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 border-t border-border pt-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">A pagar</span>
                                                    <span className="text-foreground font-normal">{formatarValor(stats.valorPendenteTerapeuta)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">A receber</span>
                                                    <span className="text-foreground font-normal">{formatarValor(stats.valorPendenteCliente)}</span>
                                                </div>
                                            </div>
                                            <div className="h-36">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={pendentesSparklineData} margin={{ top: 10, right: 16, left: 16, bottom: 10 }}>
                                                        <defs>
                                                            <linearGradient id="drawerPendentesGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <RechartsTooltip content={<SparklineTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeOpacity: 0.3 }} />
                                                        <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#drawerPendentesGradient)" dot={{ r: 3, fill: '#f59e0b', stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#f59e0b', stroke: 'white', strokeWidth: 2 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Card 4 - Rejeitados */}
                                        <div className="bg-background rounded-xl p-5 pb-4 border relative overflow-hidden">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                                                    <XCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Rejeitados</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-normal">{stats.rejeitados}</p>
                                                        {stats.rejeitados > 0 && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                {lancamentos.length > 0 ? Math.round((stats.rejeitados / lancamentos.length) * 100) : 0}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 border-t border-border pt-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">A pagar</span>
                                                    <span className="text-foreground font-normal">{formatarValor(stats.valorRejeitadoTerapeuta)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">A receber</span>
                                                    <span className="text-foreground font-normal">{formatarValor(stats.valorRejeitadoCliente)}</span>
                                                </div>
                                            </div>
                                            <div className="h-36">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={rejeitadosSparklineData} margin={{ top: 10, right: 16, left: 16, bottom: 10 }}>
                                                        <defs>
                                                            <linearGradient id="drawerRejeitadosGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                                                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <RechartsTooltip content={<SparklineTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeOpacity: 0.3 }} />
                                                        <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#drawerRejeitadosGradient)" dot={{ r: 3, fill: '#ef4444', stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#ef4444', stroke: 'white', strokeWidth: 2 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Drawer Unificado - Lançamentos, Aprovados e Pendentes */}
                                {(drawerType === 'lancamentos' || drawerType === 'aprovados' || drawerType === 'pendentes') && (
                                    <div className="bg-background rounded-xl p-6 border">
                                        {/* Resumo - Total, Aprovados, Pendentes */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                                                <p className="text-xs text-muted-foreground mb-1">Total</p>
                                                <p className="text-2xl font-normal">{lancamentos.length}</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <p className="text-xs text-muted-foreground">Aprovados</p>
                                                </div>
                                                <p className="text-2xl font-normal">{stats.aprovados}</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <p className="text-xs text-muted-foreground">Pendentes</p>
                                                </div>
                                                <p className="text-2xl font-normal">{stats.pendentes}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Gráficos circulares lado a lado */}
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            {/* Aprovados */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 text-emerald-500">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadialBarChart
                                                            innerRadius="70%"
                                                            outerRadius="100%"
                                                            data={[{ value: lancamentos.length > 0 ? Math.round((stats.aprovados / lancamentos.length) * 100) : 0 }]}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                        >
                                                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                                            <RadialBar
                                                                background={{ fill: '#e5e7eb' }}
                                                                dataKey="value"
                                                                cornerRadius={10}
                                                                fill="currentColor"
                                                            />
                                                        </RadialBarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-2xl font-normal">{stats.aprovados}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        <p className="text-xs text-muted-foreground">aprovados ({lancamentos.length > 0 ? Math.round((stats.aprovados / lancamentos.length) * 100) : 0}%)</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Pendentes */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 text-amber-500">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadialBarChart
                                                            innerRadius="70%"
                                                            outerRadius="100%"
                                                            data={[{ value: lancamentos.length > 0 ? Math.round((stats.pendentes / lancamentos.length) * 100) : 0 }]}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                        >
                                                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                                            <RadialBar
                                                                background={{ fill: '#e5e7eb' }}
                                                                dataKey="value"
                                                                cornerRadius={10}
                                                                fill="currentColor"
                                                            />
                                                        </RadialBarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-2xl font-normal">{stats.pendentes}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        <p className="text-xs text-muted-foreground">pendentes ({lancamentos.length > 0 ? Math.round((stats.pendentes / lancamentos.length) * 100) : 0}%)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Valores - A Pagar e A Receber */}
                                        <div className="border-t border-border pt-4">
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <p className="text-sm font-medium">Valores Aprovados</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-muted/50 rounded-xl p-4">
                                                    <p className="text-xs text-muted-foreground mb-1">A Pagar (Terapeutas)</p>
                                                    <p className="text-xl font-normal">{formatarValor(stats.valorAprovadoTerapeuta)}</p>
                                                </div>
                                                <div className="bg-muted/50 rounded-xl p-4">
                                                    <p className="text-xs text-muted-foreground mb-1">A Receber (Clientes)</p>
                                                    <p className="text-xl font-normal">{formatarValor(stats.valorAprovadoCliente)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                <p className="text-sm font-medium">Valores Pendentes</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-muted/50 rounded-xl p-4">
                                                    <p className="text-xs text-muted-foreground mb-1">A Pagar (Terapeutas)</p>
                                                    <p className="text-xl font-normal">{formatarValor(stats.valorPendenteTerapeuta)}</p>
                                                </div>
                                                <div className="bg-muted/50 rounded-xl p-4">
                                                    <p className="text-xs text-muted-foreground mb-1">A Receber (Clientes)</p>
                                                    <p className="text-xl font-normal">{formatarValor(stats.valorPendenteCliente)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Gráfico de linha - Evolução de lançamentos */}
                                        <div className="border-t border-border pt-4 mt-4">
                                            <p className="text-sm font-medium mb-4">Lançamentos por Data</p>
                                            <div className="h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={lancamentosSparklineData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                                        <defs>
                                                            <linearGradient id="drawerLancamentosGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <RechartsTooltip
                                                            content={({ active, payload }) => {
                                                                if (!active || !payload || !payload.length) return null;
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
                                                                        <p className="font-medium text-foreground">{data.dateFormatted}</p>
                                                                        <p className="text-emerald-600 font-semibold">{data.value} lançamentos</p>
                                                                    </div>
                                                                );
                                                            }}
                                                            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeOpacity: 0.3 }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#10b981"
                                                            strokeWidth={2}
                                                            fill="url(#drawerLancamentosGradient)"
                                                            dot={{ r: 4, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                                                            activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
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
    onRefresh: () => void;
}

function AprovarHorasTab({ lancamentos, selectedIds, onToggleSelect, onToggleSelectAll, onRefresh }: AprovarHorasTabProps) {
    // Estado para item expandido (detalhe)
    const [expandedId, setExpandedId] = useState<string | null>(null);
    // Estado para valores de ajuda de custo por item
    const [valoresAjudaCusto, setValoresAjudaCusto] = useState<Record<string, string>>({});
    // Estado de loading por item
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
    // Estado de loading para aprovação em lote
    const [isApprovingBatch, setIsApprovingBatch] = useState(false);
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

            // Usar aprovação individual para enviar valorAjudaCusto
            await aprovarLancamento(lancamento.origemId, valorNumerico);
            toast.success('Lançamento aprovado!', {
                description: valorNumerico 
                    ? `Ajuda de custo: ${formatarValor(valorNumerico)}`
                    : undefined,
            });
            // Fechar expansão e atualizar lista após aprovar
            setExpandedId(null);
            onRefresh();
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
            await rejeitarLancamento(rejeitandoId, motivoRejeicao);
            toast.success('Lançamento rejeitado', {
                description: 'O terapeuta será notificado com o motivo.',
            });
            setRejeitandoId(null);
            setMotivoRejeicao('');
            setExpandedId(null);
            onRefresh();
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

    // Handler para aprovação em lote
    const handleAprovarEmLote = async (ids: string[]) => {
        if (ids.length === 0) return;
        
        setIsApprovingBatch(true);
        try {
            await aprovarLancamentos(ids);
            toast.success(`${ids.length} lançamento(s) aprovado(s)!`);
            onRefresh();
        } catch (error) {
            toast.error('Erro ao aprovar lançamentos');
        } finally {
            setIsApprovingBatch(false);
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
                    <Button 
                        size="sm" 
                        variant="default" 
                        className="ml-auto gap-2"
                        onClick={() => handleAprovarEmLote(selectedSemAjudaCusto)}
                        disabled={isApprovingBatch}
                    >
                        {isApprovingBatch ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        {isApprovingBatch ? 'Aprovando...' : `Aprovar ${selectedSemAjudaCusto.length} selecionado(s)`}
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
                                <p className="text-xs text-muted-foreground">{lancamento.horarioInicio} - {lancamento.horarioFim}</p>
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
                            <div className="border-t bg-muted/20 p-4 py-2 space-y-4">
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
                                <div className="flex items-center justify-between">
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
    onViewDetails: (item: ItemFaturamento) => void;
    lancamentos: ItemFaturamento[];
}

function TerapeutasTab({ grupos, expandedId, onToggleExpand, onViewDetails, lancamentos }: TerapeutasTabProps) {
    // Estado de filtros de coluna para a tabela expandida
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        firstColumn: undefined,
        tipoAtividade: undefined,
        especialidade: undefined,
        status: undefined,
    });
    
    // Estado para geração de relatório
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Estado para seleção de mês
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const hoje = new Date();
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        return `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;
    });

    // Gerar lista de meses disponíveis (últimos 12 meses)
    const mesesDisponiveis = useMemo(() => {
        const meses: { value: string; label: string }[] = [];
        const hoje = new Date();
        
        for (let i = 0; i < 12; i++) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const value = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const label = `${mes.charAt(0).toUpperCase() + mes.slice(1)}/${data.getFullYear()}`;
            meses.push({ value, label });
        }
        
        return meses;
    }, []);

    // Período do mês selecionado
    const periodoSelecionado = useMemo(() => {
        const [ano, mes] = mesSelecionado.split('-').map(Number);
        return {
            inicio: new Date(ano, mes - 1, 1),
            fim: new Date(ano, mes, 0),
            label: new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        };
    }, [mesSelecionado]);

    // Resetar filtros ao mudar de terapeuta
    useEffect(() => {
        setColumnFilters({ firstColumn: undefined, tipoAtividade: undefined, especialidade: undefined, status: undefined });
    }, [expandedId]);

    // Grupo expandido atual
    const expandedGrupo = useMemo(() => {
        if (!expandedId) return null;
        return grupos.find(g => g.terapeutaId === expandedId);
    }, [grupos, expandedId]);

    // Lançamentos aprovados do mês selecionado para o terapeuta expandido
    const lancamentosAprovadosDoMes = useMemo(() => {
        if (!expandedGrupo) return [];
        return lancamentos.filter(l => {
            const data = new Date(l.data);
            return (
                l.terapeutaId === expandedGrupo.terapeutaId &&
                l.status === STATUS_FATURAMENTO.APROVADO &&
                data >= periodoSelecionado.inicio &&
                data <= periodoSelecionado.fim
            );
        });
    }, [lancamentos, expandedGrupo, periodoSelecionado]);

    // Handler para gerar relatório do terapeuta
    const handleGerarRelatorio = useCallback(async () => {
        if (!expandedGrupo || lancamentosAprovadosDoMes.length === 0) return;
        
        setIsGenerating(true);
        try {
            await gerarRelatorioFaturamento({
                tipo: 'terapeuta',
                terapeutaId: expandedGrupo.terapeutaId,
                periodoInicio: periodoSelecionado.inicio,
                periodoFim: periodoSelecionado.fim,
                lancamentos: lancamentosAprovadosDoMes,
            });
            toast.success('Relatório gerado! O download foi iniciado.');
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
        } finally {
            setIsGenerating(false);
        }
    }, [expandedGrupo, lancamentosAprovadosDoMes, periodoSelecionado]);

    // Handler para exportar relatório do terapeuta para Word
    const handleExportarWord = useCallback(async () => {
        if (!expandedGrupo || lancamentosAprovadosDoMes.length === 0) return;
        
        setIsGenerating(true);
        try {
            await exportarRelatorioWord({
                tipo: 'terapeuta',
                terapeutaId: expandedGrupo.terapeutaId,
                periodoInicio: periodoSelecionado.inicio,
                periodoFim: periodoSelecionado.fim,
                lancamentos: lancamentosAprovadosDoMes,
            });
            toast.success('Documento Word gerado! O download foi iniciado.');
        } catch (error) {
            console.error('Erro ao exportar para Word:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao exportar para Word');
        } finally {
            setIsGenerating(false);
        }
    }, [expandedGrupo, lancamentosAprovadosDoMes, periodoSelecionado]);

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
        if (!expandedGrupo) return { firstColumn: [], tipoAtividade: [], especialidade: [], status: [] };
        
        const firstColumnSet = new Set<string>();
        const tipoSet = new Set<string>();
        const especialidadeSet = new Set<string>();
        const statusSet = new Set<string>();
        expandedGrupo.lancamentos.forEach(l => {
            // Na view por terapeuta, primeira coluna é o cliente
            firstColumnSet.add(l.clienteNome || 'Sem cliente');
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
                label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo as keyof typeof TIPO_ATIVIDADE_FATURAMENTO_LABELS] ?? tipo,
            })),
            especialidade: Array.from(especialidadeSet).sort().map(esp => ({
                value: esp,
                label: esp,
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
                <div className="shrink-0 space-y-3">
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
                    
                    {/* Barra de Relatório - Contextual */}
                    <div 
                        className="flex items-center justify-between p-3 rounded-lg border border-dashed"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Gerar Relatório de Repasse</p>
                                <p className="text-xs text-muted-foreground">
                                    {lancamentosAprovadosDoMes.length > 0 
                                        ? `${lancamentosAprovadosDoMes.length} lançamento${lancamentosAprovadosDoMes.length > 1 ? 's' : ''} aprovado${lancamentosAprovadosDoMes.length > 1 ? 's' : ''}`
                                        : 'Nenhum lançamento aprovado'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select
                                value={mesSelecionado}
                                onValueChange={setMesSelecionado}
                            >
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-background" onClick={(e) => e.stopPropagation()}>
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mesesDisponiveis.map(mes => (
                                        <SelectItem key={mes.value} value={mes.value}>
                                            {mes.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            disabled={isGenerating || lancamentosAprovadosDoMes.length === 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleGerarRelatorio();
                                            }}
                                            className="h-8 gap-1.5"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <FileText className="h-3.5 w-3.5" />
                                            )}
                                            Gerar PDF
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {lancamentosAprovadosDoMes.length === 0 
                                            ? 'Nenhum lançamento aprovado neste período'
                                            : `Gerar relatório de ${periodoSelecionado.label}`
                                        }
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isGenerating || lancamentosAprovadosDoMes.length === 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExportarWord();
                                            }}
                                            className="h-8 gap-1.5"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <FileDown className="h-3.5 w-3.5" />
                                            )}
                                            Word
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {lancamentosAprovadosDoMes.length === 0 
                                            ? 'Nenhum lançamento aprovado neste período'
                                            : 'Exportar para Word (editável)'
                                        }
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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
                        onViewDetails={onViewDetails}
                        viewContext="by-therapist"
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
    onViewDetails: (item: ItemFaturamento) => void;
    lancamentos: ItemFaturamento[];
}

function ClientesTab({ grupos, expandedId, onToggleExpand, onViewDetails, lancamentos }: ClientesTabProps) {
    // Estado de filtros de coluna para a tabela expandida
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        firstColumn: undefined,
        tipoAtividade: undefined,
        especialidade: undefined,
        status: undefined,
    });
    
    // Estado para geração de relatório
    const [isGenerating, setIsGenerating] = useState(false);
    const [tipoRelatorio, setTipoRelatorio] = useState<'convenio' | 'pais'>('pais');
    
    // Estado para seleção de mês
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const hoje = new Date();
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        return `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;
    });

    // Gerar lista de meses disponíveis (últimos 12 meses)
    const mesesDisponiveis = useMemo(() => {
        const meses: { value: string; label: string }[] = [];
        const hoje = new Date();
        
        for (let i = 0; i < 12; i++) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const value = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
            const label = `${mes.charAt(0).toUpperCase() + mes.slice(1)}/${data.getFullYear()}`;
            meses.push({ value, label });
        }
        
        return meses;
    }, []);

    // Período do mês selecionado
    const periodoSelecionado = useMemo(() => {
        const [ano, mes] = mesSelecionado.split('-').map(Number);
        return {
            inicio: new Date(ano, mes - 1, 1),
            fim: new Date(ano, mes, 0),
            label: new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        };
    }, [mesSelecionado]);

    // Resetar filtros ao mudar de cliente
    useEffect(() => {
        setColumnFilters({ firstColumn: undefined, tipoAtividade: undefined, especialidade: undefined, status: undefined });
    }, [expandedId]);

    // Grupo expandido atual
    const expandedGrupo = useMemo(() => {
        if (!expandedId) return null;
        return grupos.find(g => g.clienteId === expandedId);
    }, [grupos, expandedId]);

    // Lançamentos aprovados do mês selecionado para o cliente expandido
    const lancamentosAprovadosDoMes = useMemo(() => {
        if (!expandedGrupo) return [];
        return lancamentos.filter(l => {
            const data = new Date(l.data);
            return (
                l.clienteId === expandedGrupo.clienteId &&
                l.status === STATUS_FATURAMENTO.APROVADO &&
                data >= periodoSelecionado.inicio &&
                data <= periodoSelecionado.fim
            );
        });
    }, [lancamentos, expandedGrupo, periodoSelecionado]);

    // Handler para gerar relatório do cliente
    const handleGerarRelatorio = useCallback(async () => {
        if (!expandedGrupo || lancamentosAprovadosDoMes.length === 0) return;
        
        setIsGenerating(true);
        try {
            await gerarRelatorioFaturamento({
                tipo: tipoRelatorio,
                clienteId: expandedGrupo.clienteId,
                periodoInicio: periodoSelecionado.inicio,
                periodoFim: periodoSelecionado.fim,
                lancamentos: lancamentosAprovadosDoMes,
            });
            toast.success('Relatório gerado! O download foi iniciado.');
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
        } finally {
            setIsGenerating(false);
        }
    }, [expandedGrupo, lancamentosAprovadosDoMes, periodoSelecionado, tipoRelatorio]);

    // Handler para exportar relatório do cliente para Word
    const handleExportarWord = useCallback(async () => {
        if (!expandedGrupo || lancamentosAprovadosDoMes.length === 0) return;
        
        setIsGenerating(true);
        try {
            await exportarRelatorioWord({
                tipo: tipoRelatorio,
                clienteId: expandedGrupo.clienteId,
                periodoInicio: periodoSelecionado.inicio,
                periodoFim: periodoSelecionado.fim,
                lancamentos: lancamentosAprovadosDoMes,
            });
            toast.success('Documento Word gerado! O download foi iniciado.');
        } catch (error) {
            console.error('Erro ao exportar para Word:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao exportar para Word');
        } finally {
            setIsGenerating(false);
        }
    }, [expandedGrupo, lancamentosAprovadosDoMes, periodoSelecionado, tipoRelatorio]);

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
        if (!expandedGrupo) return { firstColumn: [], tipoAtividade: [], especialidade: [], status: [] };
        
        const firstColumnSet = new Set<string>();
        const tipoSet = new Set<string>();
        const especialidadeSet = new Set<string>();
        const statusSet = new Set<string>();
        expandedGrupo.lancamentos.forEach(l => {
            // Na view por cliente, primeira coluna é o terapeuta
            firstColumnSet.add(l.terapeutaNome || 'Sem terapeuta');
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
                label: TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo as keyof typeof TIPO_ATIVIDADE_FATURAMENTO_LABELS] ?? tipo,
            })),
            especialidade: Array.from(especialidadeSet).sort().map(esp => ({
                value: esp,
                label: esp,
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
                <div className="shrink-0 space-y-3">
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
                    
                    {/* Barra de Relatório - Contextual */}
                    <div 
                        className="flex items-center justify-between p-3 rounded-lg border border-dashed"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Gerar Relatório do Cliente</p>
                                <p className="text-xs text-muted-foreground">
                                    {lancamentosAprovadosDoMes.length > 0 
                                        ? `${lancamentosAprovadosDoMes.length} lançamento${lancamentosAprovadosDoMes.length > 1 ? 's' : ''} aprovado${lancamentosAprovadosDoMes.length > 1 ? 's' : ''}`
                                        : 'Nenhum lançamento aprovado'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Seletor de tipo de relatório */}
                            <Select
                                value={tipoRelatorio}
                                onValueChange={(value) => setTipoRelatorio(value as 'convenio' | 'pais')}
                            >
                                <SelectTrigger className="h-8 w-[120px] text-xs bg-background" onClick={(e) => e.stopPropagation()}>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pais">Para Pais</SelectItem>
                                    <SelectItem value="convenio">Para Convênio</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Seletor de mês */}
                            <Select
                                value={mesSelecionado}
                                onValueChange={setMesSelecionado}
                            >
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-background" onClick={(e) => e.stopPropagation()}>
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mesesDisponiveis.map(mes => (
                                        <SelectItem key={mes.value} value={mes.value}>
                                            {mes.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            disabled={isGenerating || lancamentosAprovadosDoMes.length === 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleGerarRelatorio();
                                            }}
                                            className="h-8 gap-1.5"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <FileText className="h-3.5 w-3.5" />
                                            )}
                                            Gerar PDF
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {lancamentosAprovadosDoMes.length === 0 
                                            ? 'Nenhum lançamento aprovado neste período'
                                            : `Gerar relatório ${tipoRelatorio === 'pais' ? 'para Pais' : 'para Convênio'} de ${periodoSelecionado.label}`
                                        }
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isGenerating || lancamentosAprovadosDoMes.length === 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExportarWord();
                                            }}
                                            className="h-8 gap-1.5"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <FileDown className="h-3.5 w-3.5" />
                                            )}
                                            Word
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {lancamentosAprovadosDoMes.length === 0 
                                            ? 'Nenhum lançamento aprovado neste período'
                                            : 'Exportar para Word (editável)'
                                        }
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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
                        onViewDetails={onViewDetails}
                        viewContext="by-client"
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

// ============================================
// TAB: RELATÓRIOS
// ============================================

interface RelatoriosTabProps {
    lancamentos: ItemFaturamento[];
}

type TipoRelatorio = 'convenio' | 'terapeuta' | 'pais';

function RelatoriosTab({ lancamentos }: RelatoriosTabProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchCliente, setSearchCliente] = useState('');
    const [searchTerapeuta, setSearchTerapeuta] = useState('');
    
    // Estado para seleção de mês (formato: "2026-01")
    // Por padrão, seleciona o mês anterior (onde geralmente estão os dados para faturamento)
    const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
        const hoje = new Date();
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        return `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;
    });

    // Gerar lista de meses disponíveis (últimos 12 meses)
    const mesesDisponiveis = useMemo(() => {
        const meses: { value: string; label: string }[] = [];
        const hoje = new Date();
        
        for (let i = 0; i < 12; i++) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const value = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
            const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            meses.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
        }
        
        return meses;
    }, []);

    // Período do mês selecionado
    const periodoSelecionado = useMemo(() => {
        const [ano, mes] = mesSelecionado.split('-').map(Number);
        return {
            inicio: new Date(ano, mes - 1, 1),
            fim: new Date(ano, mes, 0),
            label: new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        };
    }, [mesSelecionado]);

    // Filtrar lançamentos aprovados do mês selecionado
    const lancamentosDoMes = useMemo(() => {
        return lancamentos.filter(l => {
            const data = new Date(l.data);
            return data >= periodoSelecionado.inicio && data <= periodoSelecionado.fim && l.status === STATUS_FATURAMENTO.APROVADO;
        });
    }, [lancamentos, periodoSelecionado]);

    // Clientes únicos com lançamentos no mês (para relatório Convênio e Pais)
    const clientesDisponiveis = useMemo(() => {
        const clientesMap = new Map<string, { 
            id: string; 
            nome: string; 
            totalHoras: number;
            totalSessoes: number;
            valorTotal: number;
        }>();
        
        lancamentosDoMes.forEach(l => {
            if (l.clienteId && l.clienteNome) {
                const existing = clientesMap.get(l.clienteId);
                if (existing) {
                    existing.totalHoras += l.duracaoMinutos / 60;
                    existing.totalSessoes += 1;
                    existing.valorTotal += l.valorTotalCliente ?? 0;
                } else {
                    clientesMap.set(l.clienteId, {
                        id: l.clienteId,
                        nome: l.clienteNome,
                        totalHoras: l.duracaoMinutos / 60,
                        totalSessoes: 1,
                        valorTotal: l.valorTotalCliente ?? 0,
                    });
                }
            }
        });
        
        return Array.from(clientesMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [lancamentosDoMes]);

    // Terapeutas únicos com lançamentos no mês (inclui todos os clientes atendidos)
    const terapeutasDisponiveis = useMemo(() => {
        const terapeutasMap = new Map<string, { 
            id: string; 
            nome: string; 
            totalHoras: number; 
            totalValor: number;
            totalSessoes: number;
            clientesAtendidos: Set<string>;
        }>();
        
        lancamentosDoMes.forEach(l => {
            const existing = terapeutasMap.get(l.terapeutaId);
            if (existing) {
                existing.totalHoras += l.duracaoMinutos / 60;
                existing.totalValor += l.valorTotal ?? 0;
                existing.totalSessoes += 1;
                if (l.clienteNome) existing.clientesAtendidos.add(l.clienteNome);
            } else {
                const clientesSet = new Set<string>();
                if (l.clienteNome) clientesSet.add(l.clienteNome);
                terapeutasMap.set(l.terapeutaId, {
                    id: l.terapeutaId,
                    nome: l.terapeutaNome,
                    totalHoras: l.duracaoMinutos / 60,
                    totalValor: l.valorTotal ?? 0,
                    totalSessoes: 1,
                    clientesAtendidos: clientesSet,
                });
            }
        });
        
        return Array.from(terapeutasMap.values())
            .map(t => ({ ...t, totalClientes: t.clientesAtendidos.size }))
            .sort((a, b) => a.nome.localeCompare(b.nome));
    }, [lancamentosDoMes]);

    // Filtrar clientes pela busca
    const clientesFiltrados = useMemo(() => {
        if (!searchCliente.trim()) return clientesDisponiveis;
        const termo = searchCliente.toLowerCase();
        return clientesDisponiveis.filter(c => c.nome.toLowerCase().includes(termo));
    }, [clientesDisponiveis, searchCliente]);

    // Filtrar terapeutas pela busca
    const terapeutasFiltrados = useMemo(() => {
        if (!searchTerapeuta.trim()) return terapeutasDisponiveis;
        const termo = searchTerapeuta.toLowerCase();
        return terapeutasDisponiveis.filter(t => t.nome.toLowerCase().includes(termo));
    }, [terapeutasDisponiveis, searchTerapeuta]);

    const handleGerarRelatorio = useCallback(async (
        tipo: TipoRelatorio,
        clienteId?: string,
        terapeutaId?: string
    ) => {
        setIsGenerating(true);
        try {
            await gerarRelatorioFaturamento({
                tipo,
                clienteId,
                terapeutaId,
                periodoInicio: periodoSelecionado.inicio,
                periodoFim: periodoSelecionado.fim,
                lancamentos: lancamentosDoMes,
            });
            toast.success('Relatório gerado! O download foi iniciado.');
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
        } finally {
            setIsGenerating(false);
        }
    }, [periodoSelecionado, lancamentosDoMes]);

    const handleExportarWord = useCallback(async (
        tipo: TipoRelatorio,
        clienteId?: string,
        terapeutaId?: string
    ) => {
        setIsGenerating(true);
        try {
            await exportarRelatorioWord({
                tipo,
                clienteId,
                terapeutaId,
                periodoInicio: periodoSelecionado.inicio,
                periodoFim: periodoSelecionado.fim,
                lancamentos: lancamentosDoMes,
            });
            toast.success('Documento Word gerado! O download foi iniciado.');
        } catch (error) {
            console.error('Erro ao exportar para Word:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao exportar para Word');
        } finally {
            setIsGenerating(false);
        }
    }, [periodoSelecionado, lancamentosDoMes]);

    return (
        <div className="h-full overflow-y-auto">
            <div className="space-y-6 pb-6">
                {/* Cabeçalho com seletor de mês */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Relatórios Mensais</h3>
                        <p className="text-sm text-muted-foreground">
                            Gere relatórios para convênios, terapeutas ou pais
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={mesSelecionado}
                            onChange={(e) => setMesSelecionado(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {mesesDisponiveis.map(mes => (
                                <option key={mes.value} value={mes.value}>
                                    {mes.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {lancamentosDoMes.length === 0 ? (
                    <div className="bg-muted/50 rounded-xl p-8 text-center">
                        <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            Nenhum lançamento aprovado em <span className="font-medium capitalize">{periodoSelecionado.label}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Aprove lançamentos primeiro para gerar relatórios.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Coluna: Relatórios por Cliente (Convênio e Pais) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Por Cliente</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Relatórios para Convênio ou Pais
                                    </p>
                                </div>
                                <Badge variant="secondary">{clientesDisponiveis.length} clientes</Badge>
                            </div>
                            
                            {/* Busca de cliente */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar cliente..."
                                    value={searchCliente}
                                    onChange={(e) => setSearchCliente(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            
                            {/* Lista de clientes */}
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {clientesFiltrados.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Nenhum cliente encontrado
                                    </p>
                                ) : (
                                    clientesFiltrados.map(cliente => (
                                        <div
                                            key={cliente.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <Avatar className="h-9 w-9 shrink-0">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {getInitials(cliente.nome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{cliente.nome}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {cliente.totalSessoes} sessões • {cliente.totalHoras.toFixed(1)}h • {formatarValor(cliente.valorTotal)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isGenerating}
                                                                onClick={() => handleGerarRelatorio('convenio', cliente.id)}
                                                                className="h-8 px-2"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>PDF Convênio</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isGenerating}
                                                                onClick={() => handleExportarWord('convenio', cliente.id)}
                                                                className="h-8 px-2"
                                                            >
                                                                <FileDown className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Word Convênio</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isGenerating}
                                                                onClick={() => handleGerarRelatorio('pais', cliente.id)}
                                                                className="h-8 px-2"
                                                            >
                                                                <UserCircle className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>PDF Pais</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isGenerating}
                                                                onClick={() => handleExportarWord('pais', cliente.id)}
                                                                className="h-8 px-2"
                                                            >
                                                                <FileDown className="h-4 w-4 text-primary" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Word Pais</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Coluna: Relatórios por Terapeuta */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Por Terapeuta</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Relatório com todos os clientes atendidos
                                    </p>
                                </div>
                                <Badge variant="secondary">{terapeutasDisponiveis.length} terapeutas</Badge>
                            </div>
                            
                            {/* Busca de terapeuta */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar terapeuta..."
                                    value={searchTerapeuta}
                                    onChange={(e) => setSearchTerapeuta(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            
                            {/* Lista de terapeutas */}
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {terapeutasFiltrados.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Nenhum terapeuta encontrado
                                    </p>
                                ) : (
                                    terapeutasFiltrados.map(terapeuta => (
                                        <div
                                            key={terapeuta.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <Avatar className="h-9 w-9 shrink-0">
                                                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs">
                                                        {getInitials(terapeuta.nome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{terapeuta.nome}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {terapeuta.totalClientes} clientes • {terapeuta.totalSessoes} sessões • {formatarValor(terapeuta.totalValor)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={isGenerating}
                                                                onClick={() => handleGerarRelatorio('terapeuta', undefined, terapeuta.id)}
                                                                className="h-8 gap-1.5"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                PDF
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Gerar PDF do terapeuta</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isGenerating}
                                                                onClick={() => handleExportarWord('terapeuta', undefined, terapeuta.id)}
                                                                className="h-8 px-2"
                                                            >
                                                                <FileDown className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Exportar para Word</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GestaoFaturamentoHub;
