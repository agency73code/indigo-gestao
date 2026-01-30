/**
 * HorasPorClientePage
 * 
 * Tela do GERENTE para visualizar horas por cliente/paciente.
 * Design consistente com FaturamentoHub do terapeuta.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Search,
    AlertCircle,
    CheckCircle2,
    UserCircle,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { ItemFaturamento } from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    STATUS_FATURAMENTO_LABELS,
    ORIGEM_LANCAMENTO,
} from '../types/faturamento.types';
import { listFaturamento } from '../services/faturamento-sessoes.service';
import { FaturamentoTable, type FaturamentoColumnFilters, type FaturamentoColumnFilterOptions } from '../components/FaturamentoTable';

// ============================================
// TIPOS
// ============================================

interface ClienteGroup {
    clienteId: string;
    clienteNome: string;
    clienteAvatarUrl?: string;
    lancamentos: ItemFaturamento[];
    totalMinutos: number;
    totalValor: number;
    totalLancamentos: number;
    totalPendentes: number;
    totalAprovados: number;
    terapeutas: Array<{
        id: string;
        nome: string;
        avatarUrl?: string;
        minutos: number;
    }>;
}

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
        <div className="bg-primary rounded-xl p-5">
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
            <div className="p-4 bg-muted rounded-full mb-4">
                <UserCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-normal mb-2">Nenhum paciente encontrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Não há lançamentos de horas registrados.
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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function HorasPorClientePage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [lancamentos, setLancamentos] = useState<ItemFaturamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');

    // Drill-down
    const selectedClienteId = searchParams.get('clienteId');

    // Filtros de coluna (para drill-down)
    const [columnFilters, setColumnFilters] = useState<FaturamentoColumnFilters>({
        tipoAtividade: undefined,
        status: undefined,
    });

    useEffect(() => {
        setPageTitle('Horas por Paciente');
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

    // ============================================
    // AGRUPAR POR CLIENTE
    // ============================================

    const groupedByCliente = useMemo((): ClienteGroup[] => {
        const grouped: Record<string, ClienteGroup> = {};

        const lancamentosComCliente = lancamentos.filter(
            (l): l is ItemFaturamento & { clienteId: string; clienteNome: string } => 
                !!l.clienteId && !!l.clienteNome
        );

        lancamentosComCliente.forEach(l => {
            if (!grouped[l.clienteId]) {
                grouped[l.clienteId] = {
                    clienteId: l.clienteId,
                    clienteNome: l.clienteNome,
                    clienteAvatarUrl: l.clienteAvatarUrl,
                    lancamentos: [],
                    totalMinutos: 0,
                    totalValor: 0,
                    totalLancamentos: 0,
                    totalPendentes: 0,
                    totalAprovados: 0,
                    terapeutas: [],
                };
            }

            grouped[l.clienteId].lancamentos.push(l);
            grouped[l.clienteId].totalMinutos += l.duracaoMinutos;
            grouped[l.clienteId].totalValor += l.valorTotal ?? 0;
            grouped[l.clienteId].totalLancamentos += 1;

            if (l.status === STATUS_FATURAMENTO.PENDENTE) {
                grouped[l.clienteId].totalPendentes += 1;
            } else if (l.status === STATUS_FATURAMENTO.APROVADO) {
                grouped[l.clienteId].totalAprovados += 1;
            }

            // Agrupar terapeutas
            const existingTerapeuta = grouped[l.clienteId].terapeutas.find(t => t.id === l.terapeutaId);
            if (existingTerapeuta) {
                existingTerapeuta.minutos += l.duracaoMinutos;
            } else {
                grouped[l.clienteId].terapeutas.push({
                    id: l.terapeutaId,
                    nome: l.terapeutaNome,
                    avatarUrl: l.terapeutaAvatarUrl,
                    minutos: l.duracaoMinutos,
                });
            }
        });

        let result = Object.values(grouped);

        if (searchValue) {
            const q = searchValue.toLowerCase();
            result = result.filter(c => c.clienteNome.toLowerCase().includes(q));
        }

        return result.sort((a, b) => a.clienteNome.localeCompare(b.clienteNome));
    }, [lancamentos, searchValue]);

    const selectedCliente = useMemo(() => {
        if (!selectedClienteId) return null;
        return groupedByCliente.find(c => c.clienteId === selectedClienteId);
    }, [selectedClienteId, groupedByCliente]);

    const clienteLancamentos = useMemo(() => {
        if (!selectedCliente) return [];
        
        let items = selectedCliente.lancamentos;

        if (columnFilters.tipoAtividade) {
            items = items.filter(l => l.tipoAtividade === columnFilters.tipoAtividade);
        }
        if (columnFilters.status) {
            items = items.filter(l => l.status === columnFilters.status);
        }

        return items;
    }, [selectedCliente, columnFilters]);

    const columnFilterOptions: FaturamentoColumnFilterOptions = useMemo(() => {
        if (!selectedCliente) return { tipoAtividade: [], status: [] };

        const tipoSet = new Set<string>();
        const statusSet = new Set<string>();

        selectedCliente.lancamentos.forEach(l => {
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
    }, [selectedCliente]);

    // ============================================
    // HANDLERS
    // ============================================

    const navigateToCliente = useCallback((clienteId: string) => {
        setSearchParams({ clienteId });
        setColumnFilters({ tipoAtividade: undefined, status: undefined });
    }, [setSearchParams]);

    const navigateBack = useCallback(() => {
        if (selectedClienteId) {
            setSearchParams({});
        } else {
            navigate('/app/faturamento/gestao');
        }
    }, [selectedClienteId, setSearchParams, navigate]);

    const handleViewDetails = useCallback((item: ItemFaturamento) => {
        toast.info(`Visualizar ${item.origem === ORIGEM_LANCAMENTO.SESSAO ? 'sessão' : 'ata'}: ${item.origemId}`);
    }, []);

    // ============================================
    // ESTATÍSTICAS
    // ============================================

    const stats = useMemo(() => {
        const totalPacientes = groupedByCliente.length;
        const totalHoras = lancamentos.reduce((acc, l) => acc + l.duracaoMinutos, 0);
        const totalValor = lancamentos.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
        const totalPendentes = lancamentos.filter(l => l.status === STATUS_FATURAMENTO.PENDENTE).length;
        const totalAprovados = lancamentos.filter(l => l.status === STATUS_FATURAMENTO.APROVADO).length;
        return { totalPacientes, totalHoras, totalValor, totalPendentes, totalAprovados };
    }, [lancamentos, groupedByCliente]);

    // ============================================
    // RENDER DRILL-DOWN
    // ============================================

    if (selectedCliente) {
        return (
            <div className="container py-6 space-y-6">
                {/* Header do drill-down */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={navigateBack}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-12 w-12">
                        <AvatarImage
                            src={selectedCliente.clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${selectedCliente.clienteAvatarUrl}` : ''}
                            alt={selectedCliente.clienteNome}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {getInitials(selectedCliente.clienteNome)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-xl font-medium">{selectedCliente.clienteNome}</h1>
                        <p className="text-sm text-muted-foreground">
                            {selectedCliente.totalLancamentos} lançamentos • {selectedCliente.terapeutas.length} terapeuta(s)
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-medium">{formatarValor(selectedCliente.totalValor)}</p>
                        <div className="flex items-center gap-2 justify-end">
                            {selectedCliente.totalPendentes > 0 && (
                                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                    {selectedCliente.totalPendentes} pendentes
                                </Badge>
                            )}
                            {selectedCliente.totalAprovados > 0 && (
                                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                                    {selectedCliente.totalAprovados} aprovados
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cards de estatísticas do paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCardPrimary
                        icon={<Clock className="h-5 w-5" />}
                        label="Total de Horas"
                        value={formatarHoras(selectedCliente.totalMinutos)}
                        subValue={`${selectedCliente.totalLancamentos} lançamentos`}
                    />
                    <StatsCardSecondary
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Valor Total"
                        value={formatarValor(selectedCliente.totalValor)}
                    />
                    <StatsCardSecondary
                        icon={<AlertCircle className="h-5 w-5" />}
                        label="Pendentes"
                        value={selectedCliente.totalPendentes}
                    />
                    <StatsCardSecondary
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        label="Aprovados"
                        value={selectedCliente.totalAprovados}
                    />
                </div>

                {/* Terapeutas que atendem o paciente */}
                {selectedCliente.terapeutas.length > 0 && (
                    <div className="bg-card border rounded-xl p-4">
                        <h3 className="text-sm font-medium mb-3">Terapeutas que atendem</h3>
                        <div className="flex flex-wrap gap-3">
                            {selectedCliente.terapeutas.map(terapeuta => (
                                <div 
                                    key={terapeuta.id}
                                    className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage
                                            src={terapeuta.avatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${terapeuta.avatarUrl}` : ''}
                                            alt={terapeuta.nome}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {getInitials(terapeuta.nome)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{terapeuta.nome}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {formatarHoras(terapeuta.minutos)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabela de lançamentos */}
                <FaturamentoTable
                    data={clienteLancamentos}
                    columnFilters={columnFilters}
                    filterOptions={columnFilterOptions}
                    onColumnFilterChange={setColumnFilters}
                    onViewDetails={handleViewDetails}
                />
            </div>
        );
    }

    // ============================================
    // RENDER LISTA PRINCIPAL
    // ============================================

    return (
        <div className="container py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={navigateBack}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-medium">Horas por Paciente</h1>
                    <p className="text-sm text-muted-foreground">Visualize as horas agrupadas por paciente</p>
                </div>
            </div>

            {loading ? (
                <LoadingSkeleton />
            ) : groupedByCliente.length === 0 && !searchValue ? (
                <EmptyState onBack={navigateBack} />
            ) : (
                <>
                    {/* Cards de estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCardPrimary
                            icon={<UserCircle className="h-5 w-5" />}
                            label="Total de Pacientes"
                            value={String(stats.totalPacientes)}
                            subValue={formatarHoras(stats.totalHoras)}
                        />
                        <StatsCardSecondary
                            icon={<DollarSign className="h-5 w-5" />}
                            label="Valor Total"
                            value={formatarValor(stats.totalValor)}
                        />
                        <StatsCardSecondary
                            icon={<AlertCircle className="h-5 w-5" />}
                            label="Pendentes"
                            value={stats.totalPendentes}
                        />
                        <StatsCardSecondary
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            label="Aprovados"
                            value={stats.totalAprovados}
                        />
                    </div>

                    {/* Barra de busca */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar paciente..."
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
                        <span className="text-sm text-muted-foreground">
                            {groupedByCliente.length} paciente(s)
                        </span>
                    </div>

                    {/* Lista de pacientes */}
                    <div className="space-y-2">
                        {groupedByCliente.map((cliente) => (
                            <div
                                key={cliente.clienteId}
                                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                                onClick={() => navigateToCliente(cliente.clienteId)}
                            >
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
                                    <p className="font-medium truncate">{cliente.clienteNome}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {cliente.terapeutas.length} terapeuta(s) • {cliente.totalLancamentos} lançamentos
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {cliente.totalPendentes > 0 && (
                                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                                            {cliente.totalPendentes} pendentes
                                        </Badge>
                                    )}
                                </div>

                                <div className="text-right shrink-0 w-24">
                                    <p className="font-medium">{formatarHoras(cliente.totalMinutos)}</p>
                                    <p className="text-sm text-muted-foreground">{formatarValor(cliente.totalValor)}</p>
                                </div>

                                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default HorasPorClientePage;
