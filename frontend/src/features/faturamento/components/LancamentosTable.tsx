/**
 * LancamentosTable
 * 
 * Tabela de lançamentos seguindo o padrão visual do sistema (TherapistTable).
 */

import { useState, memo } from 'react';
import { ChevronUp, ChevronDown, ArrowUpRight, FileText } from 'lucide-react';
import { Button } from '@/ui/button';
import type { Lancamento } from '../types';
import {
    TIPO_ATIVIDADE_LABELS,
    STATUS_LANCAMENTO_LABELS,
    STATUS_LANCAMENTO_COLORS,
    type TipoAtividade,
    type StatusLancamento,
} from '../types';
import { ColumnHeaderFilter, type FilterOption } from '@/components/ui/column-header-filter';

// ============================================
// TIPOS
// ============================================

export interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}

export interface LancamentoColumnFilters {
    status?: string;
    tipoAtividade?: string;
}

export interface LancamentoColumnFilterOptions {
    status: FilterOption[];
    tipoAtividade: FilterOption[];
}

interface LancamentosTableProps {
    lancamentos: Lancamento[];
    loading?: boolean;
    onViewDetails: (lancamento: Lancamento) => void;
    sortState: SortState;
    onSort: (field: string) => void;
    /** Filtros ativos das colunas */
    columnFilters?: LancamentoColumnFilters;
    /** Opções de filtros para cada coluna */
    filterOptions?: LancamentoColumnFilterOptions;
    /** Callback quando um filtro muda */
    onFilterChange?: (key: keyof LancamentoColumnFilters, value: string | undefined) => void;
}

// ============================================
// HELPERS
// ============================================

const formatarData = (data: string) => {
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
};

const formatarHorario = (inicio: string, fim: string) => {
    return `${inicio} - ${fim}`;
};

const formatarDuracao = (minutos: number) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}min`;
};

const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// ============================================
// AVATAR COMPONENT
// ============================================

interface AvatarWithSkeletonProps {
    src?: string | null;
    alt: string;
    initials: string;
    size?: 'sm' | 'md';
}

const AvatarWithSkeleton = memo(({ src, alt, initials, size = 'md' }: AvatarWithSkeletonProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const sizeClasses = size === 'sm' ? 'h-8 w-8 min-w-[2rem] text-xs' : 'h-10 w-10 min-w-[2.5rem] text-sm';

    if (!src) {
        return (
            <div className={`${sizeClasses} bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600 shrink-0`}>
                {initials}
            </div>
        );
    }

    const fullSrc = src.startsWith('/api')
        ? `${import.meta.env.VITE_API_BASE ?? ''}${src}`
        : src;

    if (imageError) {
        return (
            <div className={`${sizeClasses} bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600 shrink-0`}>
                {initials}
            </div>
        );
    }

    return (
        <div className={`relative ${sizeClasses} shrink-0`}>
            {!imageLoaded && (
                <div className={`absolute inset-0 bg-muted rounded-full animate-pulse`} />
            )}
            <img
                src={fullSrc}
                alt={alt}
                className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-200 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                    setImageError(true);
                    setImageLoaded(false);
                }}
            />
        </div>
    );
});

AvatarWithSkeleton.displayName = 'AvatarWithSkeleton';

// ============================================
// EMPTY STATE
// ============================================

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum lançamento encontrado</h3>
        <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros de busca ou registre um novo lançamento.
        </p>
    </div>
);

// ============================================
// LOADING SKELETON
// ============================================

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="border rounded-lg p-4 animate-pulse flex flex-col gap-3 md:grid md:grid-cols-[auto,1fr,1fr,1fr,auto] md:items-center"
            >
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-28 md:block hidden" />
                <div className="h-4 bg-muted rounded w-28 md:block hidden" />
                <div className="h-8 bg-muted rounded w-20 self-end md:self-center" />
            </div>
        ))}
    </div>
);

// ============================================
// STATUS BADGE
// ============================================

const getStatusBadge = (status: StatusLancamento) => {
    const colors = STATUS_LANCAMENTO_COLORS[status];
    const label = STATUS_LANCAMENTO_LABELS[status];
    
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
            {label}
        </span>
    );
};

// ============================================
// TIPO ATIVIDADE BADGE
// ============================================

const getTipoAtividadeBadge = (tipo: TipoAtividade) => {
    const label = TIPO_ATIVIDADE_LABELS[tipo];
    const shortLabel = label.replace('Sessão em ', '').replace('Hora ', '').replace('Desenvolvimento', 'Dev.');
    
    // Cores por tipo
    const colorMap: Record<string, string> = {
        sessao_consultorio: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        sessao_homecare: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        desenvolvimento_materiais: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        supervisao_recebida: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        supervisao_dada: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        reuniao: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    };
    
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorMap[tipo] || 'bg-gray-100 text-gray-700'}`}>
            {shortLabel}
        </span>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const LancamentosTable = memo(function LancamentosTable({
    lancamentos,
    loading = false,
    onViewDetails,
    sortState,
    onSort,
    columnFilters,
    filterOptions,
    onFilterChange,
}: LancamentosTableProps) {
    const getSortIcon = (field: string) => {
        if (sortState.field !== field) return null;
        return sortState.direction === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
        ) : (
            <ChevronDown className="w-4 h-4" />
        );
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (lancamentos.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex flex-col min-h-0 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--table-bg)' }}>
            {/* Mobile View */}
            <div className="md:hidden">
                {lancamentos.map((lancamento, index) => (
                    <div 
                        key={lancamento.id} 
                        className="p-4 space-y-3" 
                        style={{ backgroundColor: index % 2 === 0 ? 'var(--table-bg)' : 'var(--table-row-alt)' }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <AvatarWithSkeleton
                                    src={lancamento.clienteAvatarUrl}
                                    alt={lancamento.clienteNome}
                                    initials={getInitials(lancamento.clienteNome)}
                                    size="md"
                                />
                                <div>
                                    <button
                                        onClick={() => onViewDetails(lancamento)}
                                        className="font-medium text-sm text-foreground text-left hover:underline cursor-pointer"
                                    >
                                        {lancamento.clienteNome}
                                    </button>
                                    <div className="mt-1">
                                        {getTipoAtividadeBadge(lancamento.tipoAtividade)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {getStatusBadge(lancamento.status)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div>
                                <span className="font-semibold text-foreground block text-xs">Data</span>
                                <span className="block text-sm text-foreground">{formatarData(lancamento.data)}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold text-foreground block text-xs">Horário</span>
                                <span className="block text-sm text-foreground">
                                    {formatarHorario(lancamento.horarioInicio, lancamento.horarioFim)}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-foreground block text-xs">Duração</span>
                                <span className="block text-sm text-foreground">{formatarDuracao(lancamento.duracaoMinutos)}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold text-foreground block text-xs">Valor</span>
                                <span className="block text-sm text-foreground">{formatarMoeda(lancamento.valorTotal)}</span>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(lancamento)}
                                className="gap-2"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                Visualizar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-fixed">
                    <colgroup>
                        <col className="w-[22%]" />
                        <col className="w-[15%]" />
                        <col className="w-[12%]" />
                        <col className="w-[14%]" />
                        <col className="w-[10%] hidden lg:table-column" />
                        <col className="w-[10%] hidden xl:table-column" />
                        <col className="w-[8%]" />
                        <col className="w-[12%]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                        <tr>
                            <th
                                className="text-left p-3 cursor-pointer transition-colors first:rounded-tl-lg"
                                style={{ color: 'var(--table-text-secondary)' }}
                                onClick={() => onSort('clienteNome')}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    Cliente
                                    {getSortIcon('clienteNome')}
                                </div>
                            </th>
                            <th
                                className="text-left p-3"
                                style={{ color: 'var(--table-text-secondary)' }}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    {filterOptions && onFilterChange ? (
                                        <ColumnHeaderFilter
                                            label="Tipo"
                                            options={filterOptions.tipoAtividade}
                                            value={columnFilters?.tipoAtividade}
                                            onChange={(v) => onFilterChange('tipoAtividade', v)}
                                        />
                                    ) : (
                                        'Tipo'
                                    )}
                                </div>
                            </th>
                            <th
                                className="text-left p-3 cursor-pointer transition-colors"
                                style={{ color: 'var(--table-text-secondary)' }}
                                onClick={() => onSort('data')}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    Data
                                    {getSortIcon('data')}
                                </div>
                            </th>
                            <th
                                className="text-left p-3 font-medium text-sm"
                                style={{ color: 'var(--table-text-secondary)' }}
                            >
                                Horário
                            </th>
                            <th
                                className="text-left p-3 font-medium text-sm hidden lg:table-cell"
                                style={{ color: 'var(--table-text-secondary)' }}
                            >
                                Duração
                            </th>
                            <th
                                className="text-left p-3 font-medium text-sm hidden xl:table-cell"
                                style={{ color: 'var(--table-text-secondary)' }}
                            >
                                Valor
                            </th>
                            <th
                                className="text-left p-3"
                                style={{ color: 'var(--table-text-secondary)' }}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    {filterOptions && onFilterChange ? (
                                        <ColumnHeaderFilter
                                            label="Status"
                                            options={filterOptions.status}
                                            value={columnFilters?.status}
                                            onChange={(v) => onFilterChange('status', v)}
                                        />
                                    ) : (
                                        'Status'
                                    )}
                                </div>
                            </th>
                            <th 
                                className="text-center p-3 font-medium text-sm last:rounded-tr-lg" 
                                style={{ color: 'var(--table-text-secondary)' }}
                            >
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {lancamentos.map((lancamento, index) => (
                            <tr
                                key={lancamento.id}
                                className="transition-colors"
                                style={{ 
                                    backgroundColor: index % 2 === 0 ? 'var(--table-bg)' : 'var(--table-row-alt)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--table-bg)' : 'var(--table-row-alt)'}
                            >
                                <td className="p-3">
                                    <div className="flex items-center gap-2.5">
                                        <AvatarWithSkeleton
                                            src={lancamento.clienteAvatarUrl}
                                            alt={lancamento.clienteNome}
                                            initials={getInitials(lancamento.clienteNome)}
                                            size="sm"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <button
                                                onClick={() => onViewDetails(lancamento)}
                                                className="font-medium text-sm text-left hover:underline cursor-pointer transition-colors"
                                                style={{ color: 'var(--table-text)' }}
                                            >
                                                {lancamento.clienteNome}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    {getTipoAtividadeBadge(lancamento.tipoAtividade)}
                                </td>
                                <td className="p-3">
                                    <span className="text-sm" style={{ color: 'var(--table-text)' }}>
                                        {formatarData(lancamento.data)}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span className="text-sm whitespace-nowrap" style={{ color: 'var(--table-text)' }}>
                                        {formatarHorario(lancamento.horarioInicio, lancamento.horarioFim)}
                                    </span>
                                </td>
                                <td className="p-3 hidden lg:table-cell">
                                    <span className="text-sm" style={{ color: 'var(--table-text)' }}>
                                        {formatarDuracao(lancamento.duracaoMinutos)}
                                    </span>
                                </td>
                                <td className="p-3 hidden xl:table-cell">
                                    <span className="text-sm font-medium" style={{ color: 'var(--table-text)' }}>
                                        {formatarMoeda(lancamento.valorTotal)}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {getStatusBadge(lancamento.status)}
                                </td>
                                <td className="p-3 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewDetails(lancamento)}
                                        className="hover:bg-transparent hover:underline font-normal gap-2 text-[14px] cursor-pointer group px-4 py-2"
                                        style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                    >
                                        Visualizar
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default LancamentosTable;

export { LancamentosTable };
