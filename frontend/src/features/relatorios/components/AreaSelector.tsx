import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { AreaType } from '@/contexts/AreaContext';
import { useArea, AREA_LABELS } from '@/contexts/AreaContext';
import { getAvailableReportAreas, hasReportConfig } from '../configs';

interface AreaSelectorProps {
  value: AreaType | null;
  onChange: (area: AreaType | null) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Seletor de área terapêutica para relatórios
 * 
 * Permite selecionar a área para adaptar o relatório.
 * Só exibe áreas que possuem configuração de relatório disponível.
 */
export function AreaSelector({ value, onChange, disabled, className }: AreaSelectorProps) {
  const [open, setOpen] = useState(false);
  const { getAreaLabel } = useArea();
  
  // Apenas áreas com config de relatório
  const availableAreas = getAvailableReportAreas();

  const handleSelect = (area: AreaType) => {
    onChange(area === value ? null : area);
    setOpen(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">Área Terapêutica</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between',
              !value && 'text-muted-foreground'
            )}
          >
            {value ? getAreaLabel(value) : 'Selecione a área...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar área..." />
            <CommandEmpty>Nenhuma área encontrada.</CommandEmpty>
            <CommandGroup>
              {availableAreas.map((area) => (
                <CommandItem
                  key={area}
                  value={area}
                  onSelect={() => handleSelect(area)}
                  disabled={!hasReportConfig(area)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === area ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {AREA_LABELS[area]}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <p className="text-xs text-muted-foreground">
          Relatório configurado para {getAreaLabel(value)}
        </p>
      )}
    </div>
  );
}
