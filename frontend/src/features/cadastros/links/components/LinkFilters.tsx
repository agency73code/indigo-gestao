import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { LinkFilters, LinkFiltersProps } from '../types';

const STATUS_OPTIONS: Array<{ value: LinkFilters['status']; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'ended', label: 'Encerrados' },
    { value: 'archived', label: 'Arquivados' },
];

export default function LinkFilters({ filters, onFiltersChange }: LinkFiltersProps) {
    const updateFilter = <K extends keyof LinkFilters>(key: K, value: LinkFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    // Função para exibir o label customizado no Select
    const getStatusLabel = () => {
        const currentStatus = filters.status || 'all';
        
        // Se for "all" (Todos), mostra "Filtros"
        if (currentStatus === 'all') {
            return 'Filtros';
        }
        
        // Caso contrário, mostra o label correspondente
        const option = STATUS_OPTIONS.find(opt => opt.value === currentStatus);
        return option?.label || 'Filtros';
    };

    return (
        <div className="space-y-4">
            {/* Linha com Busca à esquerda e Filtro de Status à direita */}
            <div className="flex items-center gap-4">
                {/* Busca - Esquerda */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar por nome do cliente ou terapeuta"
                        value={filters.q || ''}
                        onChange={(e) => updateFilter('q', e.target.value)}
                        className="pl-10 h-12 rounded-[5px]"
                    />
                </div>

                {/* Filtro de Status - Direita */}
                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => updateFilter('status', value as any)}
                >
                    <SelectTrigger
                        className="w-[170px] !h-12 min-h-12 rounded-[5px]"
                        aria-label="Filtrar por status"
                    >
                        <span className="text-sm">{getStatusLabel()}</span>
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value || 'all'}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tabs de visualização - Embaixo */}
            <Tabs value={filters.viewBy} onValueChange={(value) => updateFilter('viewBy', value as any)}>
                <TabsList className="grid w-full grid-cols-3 h-10 rounded-[5px] p-1">
                    <TabsTrigger
                        value="patient"
                        className="rounded-[5px] data-[state=active]:rounded-[5px]"
                    >
                        Cliente
                    </TabsTrigger>
                    <TabsTrigger
                        value="therapist"
                        className="rounded-[5px] data-[state=active]:rounded-[5px]"
                    >
                        Terapeuta
                    </TabsTrigger>
                    <TabsTrigger
                        value="supervision"
                        className="rounded-[5px] data-[state=active]:rounded-[5px]"
                    >
                        Supervisão
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
