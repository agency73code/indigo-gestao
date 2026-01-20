/**
 * TableColumnFilters - Componente de filtros por coluna para tabelas
 * 
 * Características:
 * - Filtros são enviados via query params (preparado para backend)
 * - Enquanto backend não implementa, filtragem é feita no frontend
 * - Mostra total de registros e contador de filtros ativos
 * - Reutilizável em qualquer tabela
 * 
 * @example
 * ```tsx
 * <TableColumnFilters
 *   filters={[
 *     { key: 'status', label: 'Status', options: ['Ativo', 'Inativo'] },
 *     { key: 'especialidade', label: 'Especialidade', options: especialidades },
 *   ]}
 *   activeFilters={{ status: 'Ativo' }}
 *   onChange={(key, value) => updateUrlParam(key, value)}
 *   onClear={() => clearAllFilters()}
 *   totalCount={150}
 *   filteredCount={45}
 * />
 * ```
 */

import { useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

export interface FilterOption {
    value: string;
    label: string;
    count?: number; // Quantidade de itens com esse valor
}

export interface ColumnFilterConfig {
    /** Chave única do filtro (usada como query param) */
    key: string;
    /** Label exibido no filtro */
    label: string;
    /** Opções do filtro */
    options: FilterOption[];
    /** Placeholder quando nenhum valor selecionado */
    placeholder?: string;
}

export interface TableColumnFiltersProps {
    /** Configuração dos filtros */
    filters: ColumnFilterConfig[];
    /** Valores atuais dos filtros (key -> value) */
    activeFilters: Record<string, string | undefined>;
    /** Callback quando um filtro muda */
    onChange: (key: string, value: string | undefined) => void;
    /** Callback para limpar todos os filtros */
    onClear: () => void;
    /** Total de registros sem filtros */
    totalCount: number;
    /** Total de registros após filtros (opcional, se frontend filtra) */
    filteredCount?: number;
    /** Texto customizado para o total */
    totalLabel?: string;
    /** Se está carregando */
    loading?: boolean;
    /** Classes adicionais */
    className?: string;
}

// ============================================
// COMPONENTE
// ============================================

export function TableColumnFilters({
    filters,
    activeFilters,
    onChange,
    onClear,
    totalCount,
    filteredCount,
    totalLabel = 'registros',
    loading = false,
    className,
}: TableColumnFiltersProps) {
    // Conta quantos filtros estão ativos
    const activeFiltersCount = useMemo(() => {
        return Object.values(activeFilters).filter(v => v && v !== 'all').length;
    }, [activeFilters]);

    const hasActiveFilters = activeFiltersCount > 0;

    // Determina o count a exibir
    const displayCount = filteredCount !== undefined ? filteredCount : totalCount;
    const isFiltered = filteredCount !== undefined && filteredCount !== totalCount;

    return (
        <div className={cn("flex items-center gap-3", className)}>
            {/* Contador de registros */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    {loading ? (
                        <span className="animate-pulse">Carregando...</span>
                    ) : (
                        <>
                            <span className="font-medium text-foreground">{displayCount}</span>
                            {' '}{totalLabel}
                            {isFiltered && (
                                <span className="text-muted-foreground ml-1">
                                    (de {totalCount})
                                </span>
                            )}
                        </>
                    )}
                </span>
            </div>

            <Separator orientation="vertical" className="h-5" />

            {/* Popover de Filtros */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "gap-2 h-9",
                            hasActiveFilters && "border-primary"
                        )}
                        disabled={loading}
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {hasActiveFilters && (
                            <Badge 
                                variant="secondary" 
                                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
                            >
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-80 p-0" align="start">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="text-sm font-medium">Filtrar por coluna</span>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Limpar tudo
                            </Button>
                        )}
                    </div>

                    {/* Filtros */}
                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        {filters.map((filter) => {
                            const currentValue = activeFilters[filter.key];
                            const hasValue = currentValue && currentValue !== 'all';
                            
                            return (
                                <div key={filter.key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                            {filter.label}
                                        </Label>
                                        {hasValue && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onChange(filter.key, undefined)}
                                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Limpar
                                            </Button>
                                        )}
                                    </div>
                                    <Select
                                        value={currentValue || 'all'}
                                        onValueChange={(value) => 
                                            onChange(filter.key, value === 'all' ? undefined : value)
                                        }
                                    >
                                        <SelectTrigger className={cn(
                                            "w-full",
                                            hasValue && "border-primary"
                                        )}>
                                            <SelectValue placeholder={filter.placeholder || `Todos`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Todos
                                            </SelectItem>
                                            {filter.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <span>{option.label}</span>
                                                        {option.count !== undefined && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ({option.count})
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer com resumo */}
                    {hasActiveFilters && (
                        <div className="px-4 py-3 border-t bg-muted/30">
                            <p className="text-xs text-muted-foreground text-center">
                                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
                                {isFiltered && (
                                    <> • Mostrando {displayCount} de {totalCount}</>
                                )}
                            </p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {/* Tags de filtros ativos (inline) */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    {filters.map((filter) => {
                        const value = activeFilters[filter.key];
                        if (!value || value === 'all') return null;
                        
                        const option = filter.options.find(o => o.value === value);
                        
                        return (
                            <Badge
                                key={filter.key}
                                variant="secondary"
                                className="gap-1 pl-2 pr-1 py-1"
                            >
                                <span className="text-xs">
                                    {filter.label}: {option?.label || value}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onChange(filter.key, undefined)}
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ============================================
// HOOK AUXILIAR PARA EXTRAIR OPÇÕES ÚNICAS
// ============================================

/**
 * Hook para extrair opções únicas de uma lista de dados
 * 
 * @example
 * ```tsx
 * const statusOptions = useUniqueFilterOptions(patients, 'status');
 * // Retorna: [{ value: 'ATIVO', label: 'Ativo', count: 45 }, ...]
 * ```
 */
export function useUniqueFilterOptions<T>(
    data: T[],
    key: keyof T,
    labelFormatter?: (value: string) => string
): FilterOption[] {
    return useMemo(() => {
        const countMap = new Map<string, number>();
        
        for (const item of data) {
            const value = item[key];
            if (value === null || value === undefined) continue;
            
            // Se for array, conta cada item
            if (Array.isArray(value)) {
                for (const v of value) {
                    const strValue = String(v);
                    countMap.set(strValue, (countMap.get(strValue) || 0) + 1);
                }
            } else {
                const strValue = String(value);
                countMap.set(strValue, (countMap.get(strValue) || 0) + 1);
            }
        }

        return Array.from(countMap.entries())
            .map(([value, count]) => ({
                value,
                label: labelFormatter ? labelFormatter(value) : value,
                count,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [data, key, labelFormatter]);
}

/**
 * Hook para extrair opções de idade agrupadas em faixas
 */
export function useAgeRangeOptions<T>(
    data: T[],
    birthDateKey: keyof T
): FilterOption[] {
    return useMemo(() => {
        const ranges = [
            { value: '0-5', label: '0-5 anos', min: 0, max: 5 },
            { value: '6-12', label: '6-12 anos', min: 6, max: 12 },
            { value: '13-17', label: '13-17 anos', min: 13, max: 17 },
            { value: '18+', label: '18+ anos', min: 18, max: 200 },
        ];

        const calculateAge = (birthDate: string): number => {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        };

        const countMap = new Map<string, number>();
        
        for (const item of data) {
            const birthDate = item[birthDateKey];
            if (!birthDate) continue;
            
            const age = calculateAge(String(birthDate));
            const range = ranges.find(r => age >= r.min && age <= r.max);
            if (range) {
                countMap.set(range.value, (countMap.get(range.value) || 0) + 1);
            }
        }

        return ranges
            .filter(r => countMap.has(r.value))
            .map(r => ({
                value: r.value,
                label: r.label,
                count: countMap.get(r.value),
            }));
    }, [data, birthDateKey]);
}

export default TableColumnFilters;
