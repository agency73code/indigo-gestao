import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Option {
    id: string;
    nome: string;
}

interface SearchableSelectProps {
    value: string;
    options: Option[];
    placeholder: string;
    emptyMessage: string;
    onSelect: (value: string) => void;
    isLoading?: boolean;
}

export default function SearchableSelect({
    value,
    options,
    placeholder,
    emptyMessage,
    onSelect,
    isLoading = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filtrar opções com base na busca
    const filteredOptions = options.filter((option) =>
        option.nome.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Encontrar a opção selecionada
    const selectedOption = options.find((option) => option.id === value);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionId: string) => {
        onSelect(optionId);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        onSelect('');
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-10 px-3 text-left font-normal"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`truncate ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {selectedOption ? selectedOption.nome : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </Button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                    <div className="p-2">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {/* Clear Option */}
                        <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2"
                            onClick={handleClear}
                        >
                            <X className="h-3 w-3 shrink-0" />
                            <span className="truncate">Limpar seleção</span>
                        </button>

                        {isLoading ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                Carregando...
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                {searchQuery ? 'Nenhum resultado encontrado' : emptyMessage}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 truncate ${
                                        value === option.id ? 'bg-muted' : ''
                                    }`}
                                    onClick={() => handleSelect(option.id)}
                                    title={option.nome}
                                >
                                    {option.nome}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
