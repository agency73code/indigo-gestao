import { Search, Filter, CalendarRange, Target, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SessaoFiltersState } from '../types';

interface SearchAndFiltersProps extends SessaoFiltersState {
  disabled?: boolean;
  programOptions: string[];
  therapistOptions: string[];
  onChange: (next: Partial<SessaoFiltersState>) => void;
  renderButton?: ReactNode;
}

const DATE_RANGE_OPTIONS: Array<{ value: SessaoFiltersState['dateRange']; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'last7', label: '7 dias' },
  { value: 'last30', label: '30 dias' },
  { value: 'year', label: 'Este ano' },
];

const SORT_OPTIONS: Array<{ value: SessaoFiltersState['sort']; label: string }> = [
  { value: 'date-desc', label: 'Mais recente' },
  { value: 'date-asc', label: 'Mais antiga' },
  { value: 'accuracy-desc', label: 'Maior acerto' },
  { value: 'accuracy-asc', label: 'Menor acerto' },
];

export default function SearchAndFilters({
  disabled = false,
  q,
  dateRange,
  program,
  therapist,
  sort,
  programOptions,
  therapistOptions,
  onChange,
  renderButton,
}: SearchAndFiltersProps) {
  // Função para exibir o label customizado no Select de Data
  const getDateRangeLabel = () => {
    const option = DATE_RANGE_OPTIONS.find(opt => opt.value === dateRange);
    return option?.label || 'Data';
  };

  // Função para exibir o label customizado no Select de Ordenação
  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === sort);
    return option?.label || 'Ordenar por';
  };

  return (
    <div className="space-y-4">
      {/* Linha 1: Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por programa, objetivo ou profissional"
          value={q}
          onChange={(e) => onChange({ q: e.target.value })}
          className="pl-10 h-10 rounded-full py-0 shadow-none"
          disabled={disabled}
        />
      </div>

      {/* Linha 2: Filtros à esquerda e Botão à direita */}
      <div className="flex items-center gap-3">
        <div className="flex gap-3 flex-wrap">
          {/* Data - Select Dropdown */}
          <Select
            value={dateRange}
            onValueChange={(value) => onChange({ dateRange: value as SessaoFiltersState['dateRange'] })}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 rounded-full w-auto min-w-[120px]">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                <span className="text-sm">{getDateRangeLabel()}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Programa - Select Dropdown */}
          <Select
            value={program}
            onValueChange={(value) => onChange({ program: value as SessaoFiltersState['program'] })}
            disabled={disabled || programOptions.length === 0}
          >
            <SelectTrigger className="h-10 rounded-full w-auto min-w-[180px]">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <SelectValue placeholder="Todos os programas" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os programas</SelectItem>
              {programOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Profissional - Select Dropdown */}
          <Select
            value={therapist}
            onValueChange={(value) =>
              onChange({ therapist: value as SessaoFiltersState['therapist'] })
            }
            disabled={disabled || therapistOptions.length === 0}
          >
            <SelectTrigger className="h-10 rounded-full w-auto min-w-[200px]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="Todos os profissionais" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {therapistOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ordenar por - Select Dropdown */}
          <Select
            value={sort}
            onValueChange={(value) => onChange({ sort: value as SessaoFiltersState['sort'] })}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 rounded-full w-auto min-w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm">{getSortLabel()}</span>
              </div>
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

        {/* Botão à direita */}
        {renderButton && <div className="ml-auto flex-shrink-0">{renderButton}</div>}
      </div>
    </div>
  );
}
