import { Search, Filter, CalendarRange, Target, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
}: SearchAndFiltersProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por programa, objetivo ou profissional"
          value={q}
          onChange={(e) => onChange({ q: e.target.value })}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> Data
          </span>
          <div className="flex flex-wrap gap-2">
            {DATE_RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ dateRange: option.value })}
                disabled={disabled}
                className="h-8 text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" /> Programa
          </span>
          <Select
            value={program}
            onValueChange={(value) => onChange({ program: value as SessaoFiltersState['program'] })}
            disabled={disabled || programOptions.length === 0}
          >
            <SelectTrigger className="w-full">
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

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Profissional
          </span>
          <Select
            value={therapist}
            onValueChange={(value) =>
              onChange({ therapist: value as SessaoFiltersState['therapist'] })
            }
            disabled={disabled || therapistOptions.length === 0}
          >
            <SelectTrigger className="w-full">
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

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" /> Ordenar por
          </span>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={sort === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ sort: option.value })}
                disabled={disabled}
                className="h-8 text-xs"
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
