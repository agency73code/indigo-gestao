// Filtros para Consulta de Sessões TO
// Segue o mesmo padrão visual da sessão base (SearchAndFilters)

import { Search, Filter, CalendarRange, Target, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ToSessionsFiltersState {
  q: string;
  dateRange: 'all' | 'last7' | 'last30' | 'year';
  program: string; // 'all' ou nome do programa
  therapist: string; // 'all' ou nome do terapeuta
  sort: 'date-desc' | 'date-asc' | 'program-asc';
}

interface ToSessionsFiltersProps extends ToSessionsFiltersState {
  disabled?: boolean;
  programOptions: string[];
  therapistOptions: string[];
  onChange: (next: Partial<ToSessionsFiltersState>) => void;
}

const DATE_RANGE_OPTIONS: Array<{ value: ToSessionsFiltersState['dateRange']; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'last7', label: '7 dias' },
  { value: 'last30', label: '30 dias' },
  { value: 'year', label: 'Este ano' },
];

const SORT_OPTIONS: Array<{ value: ToSessionsFiltersState['sort']; label: string }> = [
  { value: 'date-desc', label: 'Mais recente' },
  { value: 'date-asc', label: 'Mais antiga' },
  { value: 'program-asc', label: 'Programa (A-Z)' },
];

export default function ToSessionsFilters({
  disabled = false,
  q,
  dateRange,
  program,
  therapist,
  sort,
  programOptions,
  therapistOptions,
  onChange,
}: ToSessionsFiltersProps) {
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
          className="pl-10 h-12 rounded-[5px]"
          disabled={disabled}
        />
      </div>

      {/* Linha 2: Filtros em Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Data - Select Dropdown */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> Data
          </span>
          <Select
            value={dateRange}
            onValueChange={(value) => onChange({ dateRange: value as ToSessionsFiltersState['dateRange'] })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-12 rounded-[5px]">
              <span className="text-sm">{getDateRangeLabel()}</span>
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Programa - Select Dropdown */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" /> Programa
          </span>
          <Select
            value={program}
            onValueChange={(value) => onChange({ program: value })}
            disabled={disabled || programOptions.length === 0}
          >
            <SelectTrigger className="w-full h-12 rounded-[5px]">
              <SelectValue placeholder="Todos os programas" />
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
        </div>

        {/* Profissional - Select Dropdown */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Profissional
          </span>
          <Select
            value={therapist}
            onValueChange={(value) => onChange({ therapist: value })}
            disabled={disabled || therapistOptions.length === 0}
          >
            <SelectTrigger className="w-full h-12 rounded-[5px]">
              <SelectValue placeholder="Todos os profissionais" />
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
        </div>

        {/* Ordenar por - Select Dropdown */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" /> Ordenar por
          </span>
          <Select
            value={sort}
            onValueChange={(value) => onChange({ sort: value as ToSessionsFiltersState['sort'] })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-12 rounded-[5px]">
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
    </div>
  );
}
