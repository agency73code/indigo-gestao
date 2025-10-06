import { Search, User, Users, Filter, Badge } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { LinkFilters, LinkFiltersProps } from '../types';

const STATUS_OPTIONS: Array<{ value: LinkFilters['status']; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'ended', label: 'Encerrados' },
    { value: 'archived', label: 'Arquivados' },
];

const ORDER_OPTIONS: Array<{ value: LinkFilters['orderBy']; label: string }> = [
    { value: 'recent', label: 'Mais recente' },
    { value: 'alpha', label: 'Alfabética' },
];

export default function LinkFilters({ filters, onFiltersChange }: LinkFiltersProps) {
    const updateFilter = <K extends keyof LinkFilters>(key: K, value: LinkFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome do cliente ou terapeuta"
                    value={filters.q || ''}
                    onChange={(e) => updateFilter('q', e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Tabs de visualização */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className="h-4 w-4" />
                        <span className="text-sm font-medium">Visualizar por:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={filters.viewBy === 'patient' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateFilter('viewBy', 'patient')}
                            className="h-8 text-xs sm:text-sm flex items-center gap-2"
                        >
                            <Users className="h-3 w-3" />
                            Cliente
                        </Button>
                        <Button
                            variant={filters.viewBy === 'therapist' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateFilter('viewBy', 'therapist')}
                            className="h-8 text-xs sm:text-sm flex items-center gap-2"
                        >
                            <User className="h-3 w-3" />
                            Terapeuta
                        </Button>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className="h-4 w-4" />
                        <span className="text-sm font-medium">Status:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant={filters.status === option.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateFilter('status', option.value)}
                                className="h-8 text-xs sm:text-sm"
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Ordenação */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Ordenar:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {ORDER_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant={filters.orderBy === option.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateFilter('orderBy', option.value)}
                                className="h-8 text-xs sm:text-sm"
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
