/**
 * FaturamentoTable
 * 
 * Tabela de lançamentos de faturamento com filtros por coluna.
 * Segue o mesmo padrão da PatientTable.
 */

import { memo, useMemo, useCallback } from 'react';
import { MoreHorizontal, FileText, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ColumnHeaderFilter, type FilterOption } from '@/components/ui/column-header-filter';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getSpecialtyColors } from '@/utils/specialtyColors';

import type { ItemFaturamento, TipoAtividadeFaturamento } from '../types/faturamento.types';
import {
    STATUS_FATURAMENTO,
    STATUS_FATURAMENTO_LABELS,
    STATUS_FATURAMENTO_COLORS,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    TIPO_ATIVIDADE_FATURAMENTO_COLORS,
    ORIGEM_LANCAMENTO,
} from '../types/faturamento.types';

// ============================================
// TIPOS
// ============================================

export interface FaturamentoColumnFilters {
    firstColumn?: string;
    tipoAtividade?: string;
    especialidade?: string;
    status?: string;
}

export interface FaturamentoColumnFilterOptions {
    firstColumn: FilterOption[];
    tipoAtividade: FilterOption[];
    especialidade: FilterOption[];
    status: FilterOption[];
}

/** Contexto de visualização - determina qual informação mostrar na primeira coluna */
export type FaturamentoViewContext = 'default' | 'by-client' | 'by-therapist';

interface FaturamentoTableProps {
    /** Dados para exibir na tabela */
    data: ItemFaturamento[];
    /** Filtros ativos das colunas */
    columnFilters: FaturamentoColumnFilters;
    /** Opções de filtros para cada coluna */
    filterOptions: FaturamentoColumnFilterOptions;
    /** Callback quando filtros mudam */
    onColumnFilterChange: (filters: FaturamentoColumnFilters) => void;
    /** Callback para ver detalhes (abre sessão ou ata) */
    onViewDetails: (item: ItemFaturamento) => void;
    /** Callback para corrigir e reenviar (itens rejeitados) */
    onCorrectAndResend?: (item: ItemFaturamento) => void;
    /** Se está carregando */
    loading?: boolean;
    /** Contexto de visualização - 'by-client' mostra terapeuta, 'by-therapist' mostra cliente */
    viewContext?: FaturamentoViewContext;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatarData(data: string): string {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function formatarDuracao(minutos: number): string {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h${mins}min` : `${horas}h`;
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

function getTipoAtividadeLabel(tipo: TipoAtividadeFaturamento): string {
    return TIPO_ATIVIDADE_FATURAMENTO_LABELS[tipo] ?? tipo;
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum lançamento encontrado</h3>
        <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros de busca.
        </p>
    </div>
);

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="border rounded-lg p-4 animate-pulse flex flex-col gap-3 md:grid md:grid-cols-7 md:items-center"
            >
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded-full" />
                    <div className="h-4 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-12" />
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-14" />
            </div>
        ))}
    </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const FaturamentoTable = memo(function FaturamentoTable({
    data,
    loading = false,
    onViewDetails,
    // onCorrectAndResend removido - correção feita via BillingDrawer
    columnFilters,
    filterOptions,
    onColumnFilterChange,
    viewContext = 'default',
}: FaturamentoTableProps) {
    // Determina qual nome e label exibir na primeira coluna baseado no contexto
    const getFirstColumnData = useCallback((item: ItemFaturamento) => {
        if (viewContext === 'by-client') {
            // Se está agrupado por cliente, mostra o terapeuta
            return { name: item.terapeutaNome || 'Sem terapeuta', label: 'Terapeuta' };
        }
        // Por padrão (ou agrupado por terapeuta), mostra o cliente
        return { name: item.clienteNome || 'Sem cliente', label: 'Cliente' };
    }, [viewContext]);

    const firstColumnLabel = viewContext === 'by-client' ? 'Terapeuta' : 'Cliente';

    // Handlers para atualizar filtros individuais
    const handleFirstColumnFilterChange = useCallback((value: string | undefined) => {
        onColumnFilterChange({
            ...columnFilters,
            firstColumn: value,
        });
    }, [columnFilters, onColumnFilterChange]);

    const handleTipoFilterChange = useCallback((value: string | undefined) => {
        onColumnFilterChange({
            ...columnFilters,
            tipoAtividade: value,
        });
    }, [columnFilters, onColumnFilterChange]);

    const handleEspecialidadeFilterChange = useCallback((value: string | undefined) => {
        onColumnFilterChange({
            ...columnFilters,
            especialidade: value,
        });
    }, [columnFilters, onColumnFilterChange]);

    const handleStatusFilterChange = useCallback((value: string | undefined) => {
        onColumnFilterChange({
            ...columnFilters,
            status: value,
        });
    }, [columnFilters, onColumnFilterChange]);

    // Filtra os dados baseado nos filtros ativos
    const filteredData = useMemo(() => {
        let filtered = data;
        
        if (columnFilters.firstColumn) {
            filtered = filtered.filter(item => {
                const columnValue = getFirstColumnData(item).name;
                return columnValue === columnFilters.firstColumn;
            });
        }
        
        if (columnFilters.especialidade) {
            filtered = filtered.filter(item => item.area === columnFilters.especialidade);
        }
        
        return filtered;
    }, [data, columnFilters.firstColumn, columnFilters.especialidade, getFirstColumnData]);

    // Early returns DEPOIS dos hooks
    if (loading) {
        return <LoadingSkeleton />;
    }

    if (data.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex flex-col min-h-0 rounded-lg" style={{ backgroundColor: 'var(--table-bg)' }}>
            {/* Tabela Desktop */}
            <div className="hidden md:block overflow-x-auto overflow-y-visible scroll-pt-16">
                <table className="w-full">
                    <thead className="sticky top-0 z-10 shadow-sm rounded-lg rounded-br-0 rounded-bl-0" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                        <tr>
                            <th className="text-left p-3 font-medium text-sm first:rounded-tl-lg" style={{ color: 'var(--table-text-secondary)' }}>
                                <ColumnHeaderFilter
                                    label={firstColumnLabel}
                                    options={filterOptions.firstColumn}
                                    value={columnFilters.firstColumn}
                                    onChange={handleFirstColumnFilterChange}
                                />
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                <ColumnHeaderFilter
                                    label="Tipo"
                                    options={filterOptions.tipoAtividade}
                                    value={columnFilters.tipoAtividade}
                                    onChange={handleTipoFilterChange}
                                />
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                <ColumnHeaderFilter
                                    label="Especialidade"
                                    options={filterOptions.especialidade}
                                    value={columnFilters.especialidade}
                                    onChange={handleEspecialidadeFilterChange}
                                />
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Data
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Horário
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Duração
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Valor
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                <ColumnHeaderFilter
                                    label="Status"
                                    options={filterOptions.status}
                                    value={columnFilters.status}
                                    onChange={handleStatusFilterChange}
                                />
                            </th>
                            <th className="text-center p-3 font-medium text-sm last:rounded-tr-lg" style={{ color: 'var(--table-text-secondary)' }}>
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => {
                            const rowBg = index % 2 === 0 ? 'var(--table-bg)' : 'var(--table-row-alt)';
                            return (
                                <tr
                                    key={item.id}
                                    className="transition-colors"
                                    style={{ backgroundColor: rowBg }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowBg}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {getInitials(getFirstColumnData(item).name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span 
                                                className="font-medium text-[14px] truncate"
                                                style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                            >
                                                {getFirstColumnData(item).name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs border",
                                                TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.bg,
                                                TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.text,
                                                TIPO_ATIVIDADE_FATURAMENTO_COLORS[item.tipoAtividade]?.border
                                            )}
                                        >
                                            {getTipoAtividadeLabel(item.tipoAtividade)}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        {item.area ? (
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-0"
                                                style={{
                                                    backgroundColor: getSpecialtyColors(item.area).bg,
                                                    color: getSpecialtyColors(item.area).text,
                                                }}
                                            >
                                                {item.area}
                                            </Badge>
                                        ) : (
                                            <span className="text-[14px] text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span 
                                            className="text-[14px] font-normal"
                                            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                        >
                                            {formatarData(item.data)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span 
                                            className="text-[14px] font-normal"
                                            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}
                                        >
                                            {item.horarioInicio} - {item.horarioFim}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span 
                                            className="text-[14px] font-normal"
                                            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                        >
                                            {formatarDuracao(item.duracaoMinutos)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span 
                                            className="text-[14px] font-medium"
                                            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                        >
                                            {item.valorTotal ? formatarValor(item.valorTotal) : '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            className={cn(
                                                "text-xs",
                                                STATUS_FATURAMENTO_COLORS[item.status].bg,
                                                STATUS_FATURAMENTO_COLORS[item.status].text
                                            )}
                                        >
                                            {STATUS_FATURAMENTO_LABELS[item.status]}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                        <Popover>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-3 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    >
                                                        <span className="text-xs">Ações</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52">
                                                    <DropdownMenuItem
                                                        onClick={() => onViewDetails(item)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>Ver faturamento</span>
                                                    </DropdownMenuItem>
                                                    
                                                    {item.status === STATUS_FATURAMENTO.REJEITADO && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <PopoverTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                                    <span>Ver motivo da rejeição</span>
                                                                </DropdownMenuItem>
                                                            </PopoverTrigger>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <PopoverContent side="left" className="w-72 p-0">
                                                <div className="bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Motivo da rejeição</p>
                                                            <p className="text-sm text-red-600 dark:text-red-300">{item.motivoRejeicao || 'Motivo não informado'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden space-y-3 p-2">
                {filteredData.map((item) => (
                    <div
                        key={item.id}
                        className="border rounded-lg p-4 space-y-3"
                        style={{ backgroundColor: 'var(--table-bg)' }}
                    >
                        {/* Header: Cliente/Terapeuta + Status */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {getInitials(getFirstColumnData(item).name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">
                                        {getFirstColumnData(item).name}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs mt-1",
                                            item.origem === ORIGEM_LANCAMENTO.SESSAO
                                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                                : "border-purple-200 text-purple-700 bg-purple-50"
                                        )}
                                    >
                                        {getTipoAtividadeLabel(item.tipoAtividade)}
                                    </Badge>
                                </div>
                            </div>
                            <Badge
                                className={cn(
                                    "text-xs",
                                    STATUS_FATURAMENTO_COLORS[item.status].bg,
                                    STATUS_FATURAMENTO_COLORS[item.status].text
                                )}
                            >
                                {STATUS_FATURAMENTO_LABELS[item.status]}
                            </Badge>
                        </div>

                        {/* Detalhes */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {item.area && (
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Especialidade:</span>
                                    <Badge
                                        variant="outline"
                                        className="text-xs border-0 ml-2"
                                        style={{
                                            backgroundColor: getSpecialtyColors(item.area).bg,
                                            color: getSpecialtyColors(item.area).text,
                                        }}
                                    >
                                        {item.area}
                                    </Badge>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground">Data:</span>
                                <span className="ml-2">{formatarData(item.data)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Horário:</span>
                                <span className="ml-2">{item.horarioInicio} - {item.horarioFim}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Duração:</span>
                                <span className="ml-2">{formatarDuracao(item.duracaoMinutos)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Valor:</span>
                                <span className="ml-2 font-medium">
                                    {item.valorTotal ? formatarValor(item.valorTotal) : '-'}
                                </span>
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(item)}
                                className="w-full gap-2"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Ver {item.origem === ORIGEM_LANCAMENTO.SESSAO ? 'sessão' : 'ata'}
                            </Button>
                            {item.status === STATUS_FATURAMENTO.REJEITADO && (
                                <>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Ver motivo da rejeição
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-72 p-0">
                                            <div className="bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Motivo da rejeição</p>
                                                        <p className="text-sm text-red-600 dark:text-red-300">{item.motivoRejeicao || 'Motivo não informado'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default FaturamentoTable;
