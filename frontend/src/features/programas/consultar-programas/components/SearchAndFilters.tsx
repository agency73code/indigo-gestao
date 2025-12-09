import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import type { SearchAndFiltersState } from '../types';

interface SearchAndFiltersProps {
    disabled?: boolean;
    q: string;
    status: 'active' | 'archived' | 'all';
    sort: 'recent' | 'alphabetic';
    onChange: (next: Partial<SearchAndFiltersState>) => void;
}

const STATUS_OPTIONS = [
    { value: 'all' as const, label: 'Todos' },
    { value: 'active' as const, label: 'Ativo' },
    { value: 'archived' as const, label: 'Arquivado' },
];

const SORT_OPTIONS = [
    { value: 'recent' as const, label: 'Mais recente' },
    { value: 'alphabetic' as const, label: 'Alfabética' },
];

export default function SearchAndFilters({
    disabled = false,
    q,
    status,
    sort,
    onChange,
}: SearchAndFiltersProps) {
    const [filterOpen, setFilterOpen] = useState(false);

    // Função para exibir o label customizado no Select de Status
    const getStatusLabel = () => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status);
        return option?.label || 'Status';
    };

    // Função para exibir o label customizado no Select de Ordenação
    const getSortLabel = () => {
        const option = SORT_OPTIONS.find(opt => opt.value === sort);
        return option?.label || 'Ordenar';
    };

    // Verifica se há filtros ativos (diferentes do padrão)
    const hasActiveFilters = status !== 'all' || sort !== 'recent';

    return (
        <div className="flex items-center gap-2 sm:gap-4 w-full">
            {/* Busca */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Buscar..."
                    value={q}
                    onChange={(e) => onChange({ q: e.target.value })}
                    className="pl-10"
                    disabled={disabled}
                />
            </div>

            {/* Mobile: Botão de filtro com popover */}
            <div className="sm:hidden">
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={disabled}
                            className="h-10 w-10 shrink-0 relative"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4" align="end">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => onChange({ status: value as 'active' | 'archived' | 'all' })}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className="w-full">
                                        <span className="text-sm">{getStatusLabel()}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Ordenar por</Label>
                                <Select
                                    value={sort}
                                    onValueChange={(value) => onChange({ sort: value as 'recent' | 'alphabetic' })}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className="w-full">
                                        <span className="text-sm">{getSortLabel()}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORT_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Desktop: Filtros inline */}
            <div className="hidden sm:flex items-center gap-4">
                {/* Filtro de Status */}
                <Select
                    value={status}
                    onValueChange={(value) => onChange({ status: value as 'active' | 'archived' | 'all' })}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className="w-[170px]"
                        aria-label="Filtrar por status"
                    >
                        <span className="text-sm">{getStatusLabel()}</span>
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filtro de Ordenação */}
                <Select
                    value={sort}
                    onValueChange={(value) => onChange({ sort: value as 'recent' | 'alphabetic' })}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className="w-[170px]"
                        aria-label="Ordenar por"
                    >
                        <span className="text-sm">{getSortLabel()}</span>
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
