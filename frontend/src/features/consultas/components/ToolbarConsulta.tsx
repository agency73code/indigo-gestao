import { Search, Filter } from 'lucide-react';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { useState, useEffect } from 'react';

interface ToolbarConsultaProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    showFilters?: boolean;
    onFiltersClick?: () => void;
    className?: string;
    /** Delay do debounce em ms (padrão: 300ms) */
    debounceMs?: number;
}

export default function ToolbarConsulta({
    searchValue,
    onSearchChange,
    placeholder = 'Buscar...',
    showFilters = false,
    onFiltersClick,
    className = '',
    debounceMs = 300,
}: ToolbarConsultaProps) {
    // Estado local para input (não causa requisição imediata)
    const [localValue, setLocalValue] = useState(searchValue);

    // Sincronizar com valor externo quando mudar
    useEffect(() => {
        setLocalValue(searchValue);
    }, [searchValue]);

    // Debounce: só chama onSearchChange após delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== searchValue) {
                onSearchChange(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs]);

    return (
        <div className={`flex items-center gap-4 mb-4 ${className}`}>
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder={placeholder}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
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
