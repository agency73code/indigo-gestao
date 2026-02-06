/**
 * GestaoFaturamentoPage
 * 
 * Página hub do GERENTE para gestão de faturamento.
 * Design consistente com FaturamentoHub do terapeuta.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Users,
    UserCircle,
    ChevronRight,
    AlertCircle,
    Search,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { ItemFaturamento } from '../types/faturamento.types';
import { STATUS_FATURAMENTO } from '../types/faturamento.types';
import { listFaturamento } from '../services/faturamento-sessoes.service';

// ============================================
// COMPONENTES DE ESTATÍSTICAS
// ============================================

interface StatsCardPrimaryProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    onClick?: () => void;
}

function StatsCardPrimary({ icon, label, value, subValue, onClick }: StatsCardPrimaryProps) {
    return (
        <div
            className="bg-primary rounded-xl p-5 cursor-pointer transition-all hover:bg-primary/90"
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
                {subValue && <p className="text-sm text-primary-foreground/50 mt-1">{subValue}</p>}
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
    onClick?: () => void;
}

function StatsCardSecondary({ icon, label, value, subValue, badge, onClick }: StatsCardSecondaryProps) {
    return (
        <div
            className="bg-card border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
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
                {subValue && <p className="text-sm text-muted-foreground mt-1">{subValue}</p>}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={cn(
                        "rounded-xl p-5",
                        i === 0 ? "bg-zinc-900 dark:bg-zinc-800" : "bg-card border"
                    )}>
                        <Skeleton className="h-9 w-9 rounded-lg mb-4" />
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-7 w-24" />
                    </div>
                ))}
            </div>
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-normal mb-2">Nenhum lançamento encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                Os lançamentos aparecem automaticamente quando os terapeutas registram sessões ou atas de reunião.
            </p>
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

function getInitials(nome: string): string {
    return nome
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// ============================================
// TIPO PARA AGRUPAMENTO
// ============================================

interface TerapeutaGroupItem {
    terapeutaId: string;
    terapeutaNome: string;
    terapeutaAvatarUrl?: string;
    totalMinutos: number;
    totalValor: number;
    totalLancamentos: number;
    pendentes: number;
    aprovados: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function GestaoFaturamentoPage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    const navigate = useNavigate();

    const [lancamentos, setLancamentos] = useState<ItemFaturamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        setPageTitle('Gestão de Faturamento');
        setNoMainContainer(true);
        return () => setNoMainContainer(false);
    }, [setPageTitle, setNoMainContainer]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listFaturamento({ pageSize: 500 });
            setLancamentos(response.items);
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

    const stats = useMemo(() => {
        const pendentes = lancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE);
        const aprovados = lancamentos.filter(l => l.status === STATUS_FATURAMENTO.APROVADO);

        const terapeutasSet = new Set(lancamentos.map(l => l.terapeutaId));
        const clientesSet = new Set(lancamentos.filter(l => l.clienteId).map(l => l.clienteId));

        const totalMinutos = lancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0);
        const totalValor = lancamentos.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const valorPendente = pendentes.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);

        return {
            totalLancamentos: lancamentos.length,
            pendentes: pendentes.length,
            aprovados: aprovados.length,
            totalTerapeutas: terapeutasSet.size,
            totalClientes: clientesSet.size,
            totalHoras: formatarHoras(totalMinutos),
            totalValor,
            valorPendente,
        };
    }, [lancamentos]);

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
                };
            }

            grouped[l.terapeutaId].totalMinutos += l.duracaoMinutos;
            grouped[l.terapeutaId].totalValor += l.valorTotal ?? 0;
            grouped[l.terapeutaId].totalLancamentos += 1;

            if (l.status === STATUS_FATURAMENTO.PENDENTE) {
                grouped[l.terapeutaId].pendentes += 1;
            } else if (l.status === STATUS_FATURAMENTO.APROVADO) {
                grouped[l.terapeutaId].aprovados += 1;
            }
        });

        let result = Object.values(grouped);

        if (searchValue) {
            const q = searchValue.toLowerCase();
            result = result.filter(t => t.terapeutaNome.toLowerCase().includes(q));
        }

        return result.sort((a, b) => {
            if (a.pendentes !== b.pendentes) return b.pendentes - a.pendentes;
            return b.totalMinutos - a.totalMinutos;
        });
    }, [lancamentos, searchValue]);

    const handleCardClick = (card: 'pendentes' | 'terapeutas' | 'clientes') => {
        if (card === 'pendentes') {
            navigate('/app/faturamento/aprovar');
        } else if (card === 'terapeutas') {
            navigate('/app/faturamento/por-terapeuta');
        } else if (card === 'clientes') {
            navigate('/app/faturamento/por-cliente');
        }
    };

    const handleTerapeutaClick = (terapeutaId: string) => {
        navigate(`/app/faturamento/por-terapeuta?terapeutaId=${terapeutaId}`);
    };

    return (
        <div className="container py-6 space-y-6">
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCardPrimary
                            icon={<AlertCircle className="h-5 w-5" />}
                            label="Pendentes de Aprovação"
                            value={String(stats.pendentes)}
                            subValue={formatarValor(stats.valorPendente)}
                            onClick={() => handleCardClick('pendentes')}
                        />
                        <StatsCardSecondary
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            label="Aprovados no Período"
                            value={stats.aprovados}
                            subValue={formatarValor(stats.totalValor - stats.valorPendente)}
                            badge={stats.aprovados > 0 ? { value: 'OK', variant: 'success' } : undefined}
                        />
                        <StatsCardSecondary
                            icon={<Users className="h-5 w-5" />}
                            label="Por Terapeuta"
                            value={stats.totalTerapeutas}
                            onClick={() => handleCardClick('terapeutas')}
                        />
                        <StatsCardSecondary
                            icon={<UserCircle className="h-5 w-5" />}
                            label="Por Cliente"
                            value={stats.totalClientes}
                            onClick={() => handleCardClick('clientes')}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
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
                    </div>

                    {groupedByTerapeuta.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                                <span>{groupedByTerapeuta.length} terapeuta(s)</span>
                                {stats.pendentes > 0 && (
                                    <>
                                        <span>•</span>
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                            {stats.pendentes} pendente(s)
                                        </Badge>
                                    </>
                                )}
                            </div>

                            {groupedByTerapeuta.map((terapeuta) => (
                                <div
                                    key={terapeuta.terapeutaId}
                                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors group"
                                    onClick={() => handleTerapeutaClick(terapeuta.terapeutaId)}
                                >
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
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium truncate">{terapeuta.terapeutaNome}</h3>
                                            {terapeuta.pendentes > 0 && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 shrink-0">
                                                    {terapeuta.pendentes} pendente(s)
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {terapeuta.totalLancamentos} lançamento(s) • {formatarHoras(terapeuta.totalMinutos)}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="font-medium">{formatarValor(terapeuta.totalValor)}</p>
                                    </div>

                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default GestaoFaturamentoPage;
