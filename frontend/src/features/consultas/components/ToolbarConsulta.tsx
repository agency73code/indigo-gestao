import { Search, Filter } from 'lucide-react';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';

interface ToolbarConsultaProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    showFilters?: boolean;
    onFiltersClick?: () => void;
    className?: string;
}

export default function ToolbarConsulta({
    searchValue,
    onSearchChange,
    placeholder = 'Buscar...',
    showFilters = false,
    onFiltersClick,
    className = '',
}: ToolbarConsultaProps) {
    return (
        <div className={`flex items-center gap-4 mb-4 ${className}`}>
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-12"
                />
            </div>

            {showFilters && (
                <Button
                    variant="outline"
                    onClick={onFiltersClick}
                    className="flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" />
                    Filtros
                </Button>
            )}
        </div>
    );
}
