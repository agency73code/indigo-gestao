/**
 * AprovarHorasPage
 * 
 * Tela do GERENTE para aprovar horas pendentes.
 * Design consistente com FaturamentoHub do terapeuta.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Check,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Loader2,
    ChevronLeft,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import type { ItemFaturamento, ResumoGerente } from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_COLORS,
} from '../types/faturamento.types';
import {
    listFaturamento,
    getResumoGerente,
    aprovarLancamentos,
} from '../services/faturamento-sessoes.service';

// ============================================
// COMPONENTES DE ESTATÍSTICAS
// ============================================

interface StatsCardPrimaryProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
}

function StatsCardPrimary({ icon, label, value, subValue }: StatsCardPrimaryProps) {
    return (
        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-xs text-zinc-400 mb-1">{label}</p>
                <p className="text-2xl font-normal text-white">{value}</p>
                {subValue && <p className="text-sm text-zinc-500 mt-1">{subValue}</p>}
            </div>
        </div>
    );
}

interface StatsCardSecondaryProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    subValue?: string;
}

function StatsCardSecondary({ icon, label, value, subValue }: StatsCardSecondaryProps) {
    return (
        <div className="bg-card border rounded-xl p-5">
            <div className="flex items-start justify-between">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    {icon}
                </div>
                <span className="text-muted-foreground">•••</span>
            </div>
            <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-normal">{value}</p>
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
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ onBack }: { onBack: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-normal mb-2">Nenhum lançamento pendente</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Todos os lançamentos foram aprovados. Você está em dia!
            </p>
            <Button variant="outline" onClick={onBack}>
                Voltar para gestão
            </Button>
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

function formatarData(dataStr: string): string {
    return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AprovarHorasPage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    const navigate = useNavigate();

    const [lancamentos, setLancamentos] = useState<ItemFaturamento[]>([]);
    const [resumo, setResumo] = useState<ResumoGerente | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isApproving, setIsApproving] = useState(false);

    useEffect(() => {
        setPageTitle('Aprovar Horas');
        setNoMainContainer(true);
        return () => setNoMainContainer(false);
    }, [setPageTitle, setNoMainContainer]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [resumoData, lancamentosData] = await Promise.all([
                getResumoGerente(),
                listFaturamento({ pageSize: 500 }),
            ]);
            setResumo(resumoData);
            setLancamentos(lancamentosData.items.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE));
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

    // Lançamentos filtrados
    const filteredLancamentos = useMemo(() => {
        if (!searchValue) return lancamentos;
        const q = searchValue.toLowerCase();
        return lancamentos.filter(l =>
            l.terapeutaNome.toLowerCase().includes(q) ||
            l.clienteNome?.toLowerCase().includes(q) ||
            TIPO_ATIVIDADE_FATURAMENTO_LABELS[l.tipoAtividade]?.toLowerCase().includes(q)
        );
    }, [lancamentos, searchValue]);

    // Estatísticas
    const stats = useMemo(() => {
        const totalMinutos = lancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0);
        const totalValor = lancamentos.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const selectedTotal = Array.from(selectedIds).reduce((acc, id) => {
            const l = lancamentos.find(x => x.id === id);
            return acc + (l?.valorTotal ?? 0);
        }, 0);
        return { totalMinutos, totalValor, selectedTotal };
    }, [lancamentos, selectedIds]);

    // Handlers
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredLancamentos.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredLancamentos.map(l => l.id)));
        }
    }, [selectedIds.size, filteredLancamentos]);

    const handleAprovar = useCallback(async () => {
        if (selectedIds.size === 0) return;

        setIsApproving(true);
        try {
            await aprovarLancamentos(Array.from(selectedIds));
            toast.success(`${selectedIds.size} lançamento(s) aprovado(s) com sucesso!`);
            loadData();
        } catch (error) {
            console.error('Erro ao aprovar:', error);
            toast.error('Erro ao aprovar lançamentos');
        } finally {
            setIsApproving(false);
        }
    }, [selectedIds, loadData]);

    const isAllSelected = filteredLancamentos.length > 0 && selectedIds.size === filteredLancamentos.length;

    return (
        <div className="container py-6 space-y-6">
            {/* Header com botão voltar */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/app/faturamento/gestao')}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-medium">Aprovar Horas</h1>
                    <p className="text-sm text-muted-foreground">Revise e aprove os lançamentos pendentes</p>
                </div>
                {selectedIds.size > 0 && (
                    <Button onClick={handleAprovar} disabled={isApproving} className="gap-2">
                        {isApproving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        Aprovar {selectedIds.size} selecionado(s)
                        <span className="text-xs opacity-80">({formatarValor(stats.selectedTotal)})</span>
                    </Button>
                )}
            </div>

            {loading ? (
                <LoadingSkeleton />
            ) : lancamentos.length === 0 ? (
                <EmptyState onBack={() => navigate('/app/faturamento/gestao')} />
            ) : (
                <>
                    {/* Cards de estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCardPrimary
                            icon={<AlertCircle className="h-5 w-5" />}
                            label="Pendentes de Aprovação"
                            value={String(lancamentos.length)}
                            subValue={formatarValor(stats.totalValor)}
                        />
                        <StatsCardSecondary
                            icon={<Clock className="h-5 w-5" />}
                            label="Total de Horas"
                            value={formatarHoras(stats.totalMinutos)}
                        />
                        <StatsCardSecondary
                            icon={<Check className="h-5 w-5" />}
                            label="Selecionados"
                            value={selectedIds.size}
                            subValue={formatarValor(stats.selectedTotal)}
                        />
                        <StatsCardSecondary
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            label="Já Aprovados"
                            value={resumo?.aprovadosPeriodo ?? 0}
                        />
                    </div>

                    {/* Barra de busca */}
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

                    {/* Lista de lançamentos */}
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-4 px-4 py-2">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={toggleSelectAll}
                                aria-label="Selecionar todos"
                            />
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.size > 0
                                    ? `${selectedIds.size} de ${filteredLancamentos.length} selecionado(s)`
                                    : `${filteredLancamentos.length} lançamento(s) pendente(s)`
                                }
                            </span>
                        </div>

                        {/* Itens */}
                        {filteredLancamentos.map((lancamento) => (
                            <div
                                key={lancamento.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border bg-card transition-colors cursor-pointer",
                                    selectedIds.has(lancamento.id) ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
                                )}
                                onClick={() => toggleSelect(lancamento.id)}
                            >
                                <Checkbox
                                    checked={selectedIds.has(lancamento.id)}
                                    onCheckedChange={() => toggleSelect(lancamento.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />

                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage
                                        src={lancamento.terapeutaAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${lancamento.terapeutaAvatarUrl}` : ''}
                                        alt={lancamento.terapeutaNome}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {getInitials(lancamento.terapeutaNome)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{lancamento.terapeutaNome}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{lancamento.clienteNome ?? 'Sem cliente'}</span>
                                        <span>•</span>
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-xs border",
                                                TIPO_ATIVIDADE_FATURAMENTO_COLORS[lancamento.tipoAtividade]?.bg,
                                                TIPO_ATIVIDADE_FATURAMENTO_COLORS[lancamento.tipoAtividade]?.text,
                                                TIPO_ATIVIDADE_FATURAMENTO_COLORS[lancamento.tipoAtividade]?.border
                                            )}
                                        >
                                            {TIPO_ATIVIDADE_FATURAMENTO_LABELS[lancamento.tipoAtividade]}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-sm">{formatarData(lancamento.data)}</p>
                                    <p className="text-xs text-muted-foreground">{lancamento.horarioInicio}</p>
                                </div>

                                <div className="text-right shrink-0 w-20">
                                    <p className="font-medium">{formatarHoras(lancamento.duracaoMinutos)}</p>
                                    <p className="text-sm text-muted-foreground">{formatarValor(lancamento.valorTotal ?? 0)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default AprovarHorasPage;
