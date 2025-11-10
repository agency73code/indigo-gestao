import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
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

    return (
        <div className="flex items-center justify-between gap-4 w-full">
            {/* Busca - Esquerda */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Buscar por objetivo ou nome do programa"
                    value={q}
                    onChange={(e) => onChange({ q: e.target.value })}
                    className="pl-10"
                    disabled={disabled}
                />
            </div>

            {/* Filtros - Direita */}
            <div className="flex items-center gap-4">
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
