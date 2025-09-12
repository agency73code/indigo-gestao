import { Search, Badge, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SearchAndFiltersState } from '../types';

interface SearchAndFiltersProps {
    disabled?: boolean;
    q: string;
    status: 'active' | 'archived' | 'all';
    sort: 'recent' | 'alphabetic';
    onChange: (next: Partial<SearchAndFiltersState>) => void;
}

export default function SearchAndFilters({
    disabled = false,
    q,
    status,
    sort,
    onChange,
}: SearchAndFiltersProps) {
    return (
        <div className="space-y-3 sm:space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por objetivo ou nome do programa"
                    value={q}
                    onChange={(e) => onChange({ q: e.target.value })}
                    className="pl-10"
                    disabled={disabled}
                />
            </div>

            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className="h-4 w-4" />
                        <span className="text-sm font-medium">Status:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'active', 'archived'] as const).map((statusOption) => (
                            <Button
                                key={statusOption}
                                variant={status === statusOption ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onChange({ status: statusOption })}
                                disabled={disabled}
                                className="h-8 text-xs sm:text-sm"
                            >
                                {statusOption === 'all'
                                    ? 'Todos'
                                    : statusOption === 'active'
                                      ? 'Ativo'
                                      : 'Arquivado'}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Ordenar:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['recent', 'alphabetic'] as const).map((sortOption) => (
                            <Button
                                key={sortOption}
                                variant={sort === sortOption ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onChange({ sort: sortOption })}
                                disabled={disabled}
                                className="h-8 text-xs sm:text-sm"
                            >
                                {sortOption === 'recent' ? 'Mais recente' : 'Alfabética'}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
