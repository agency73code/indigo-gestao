import { useState } from 'react';
import { X, Filter, Check } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Combobox } from '@/ui/combobox';
import { DateField } from '@/common/components/layout/DateField';
import type { ManagerFilters, HourEntryStatus } from '../../types/hourEntry.types';
import { STATUS_LABELS } from '../../types/hourEntry.types';
import { cn } from '@/lib/utils';

type ManagerFiltersBarProps = {
    filters: ManagerFilters;
    onChange: (filters: ManagerFilters) => void;
    therapistOptions: { value: string; label: string }[];
    patientOptions: { value: string; label: string }[];
};

// Presets de período (idêntico a Minhas Horas)
const PERIOD_PRESETS = [
    { label: 'Últimos 7 dias', value: '7d' as const },
    { label: 'Últimos 30 dias', value: '30d' as const },
    { label: 'Últimos 90 dias', value: '90d' as const },
    { label: 'Mês Atual', value: 'current-month' as const },
];

// Opções de Status
const STATUS_OPTIONS: { value: HourEntryStatus; label: string }[] = [
    { value: 'submitted', label: 'Enviado' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Reprovado' },
    { value: 'paid', label: 'Pago' },
];

type FilterChip = {
    label: string;
    value: string;
    type: 'period' | 'therapists' | 'patient' | 'status';
};

export function ManagerFiltersBar({
    filters,
    onChange,
    therapistOptions,
    patientOptions,
}: ManagerFiltersBarProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [activeChips, setActiveChips] = useState<FilterChip[]>([]);

    // Atualiza chips quando os filtros aplicados mudam
    const buildActiveChips = (appliedFilters: ManagerFilters): FilterChip[] => {
        const chips: FilterChip[] = [];

        // Período
        if (appliedFilters.from && appliedFilters.to) {
            chips.push({
                type: 'period',
                value: 'period',
                label: `Período: ${format(new Date(appliedFilters.from), 'dd/MM/yy', { locale: ptBR })} - ${format(new Date(appliedFilters.to), 'dd/MM/yy', { locale: ptBR })}`,
            });
        }

        // Terapeutas
        if (appliedFilters.therapistIds && appliedFilters.therapistIds.length > 0) {
            const names = appliedFilters.therapistIds
                .map((id) => therapistOptions.find((t) => t.value === id)?.label)
                .filter(Boolean)
                .join(', ');
            chips.push({
                type: 'therapists',
                value: 'therapists',
                label: `Terapeutas: ${names}`,
            });
        }

        // Paciente
        if (appliedFilters.patientId) {
            const patientName =
                patientOptions.find((p) => p.value === appliedFilters.patientId)?.label || '';
            chips.push({
                type: 'patient',
                value: appliedFilters.patientId,
                label: `Paciente: ${patientName}`,
            });
        }

        // Status
        if (appliedFilters.status) {
            chips.push({
                type: 'status',
                value: appliedFilters.status,
                label: `Status: ${STATUS_LABELS[appliedFilters.status]}`,
            });
        }

        return chips;
    };

    const handleApply = () => {
        onChange(localFilters);
        setActiveChips(buildActiveChips(localFilters));
    };

    const handleClear = () => {
        const cleared: ManagerFilters = {};
        setLocalFilters(cleared);
        onChange(cleared);
        setActiveChips([]);
    };

    const handlePresetClick = (preset: '7d' | '30d' | '90d' | 'current-month') => {
        const today = new Date();
        let from: Date;
        let to: Date = today;

        if (preset === '7d') {
            from = subDays(today, 7);
        } else if (preset === '30d') {
            from = subDays(today, 30);
        } else if (preset === '90d') {
            from = subDays(today, 90);
        } else {
            from = startOfMonth(today);
            to = endOfMonth(today);
        }

        const updated = {
            ...localFilters,
            from: format(from, 'yyyy-MM-dd'),
            to: format(to, 'yyyy-MM-dd'),
        };
        setLocalFilters(updated);
    };

    const handleRemoveChip = (chip: FilterChip) => {
        const updated = { ...localFilters };

        if (chip.type === 'period') {
            delete updated.from;
            delete updated.to;
        } else if (chip.type === 'therapists') {
            delete updated.therapistIds;
        } else if (chip.type === 'patient') {
            delete updated.patientId;
        } else if (chip.type === 'status') {
            delete updated.status;
        }

        setLocalFilters(updated);
        onChange(updated);
        setActiveChips(buildActiveChips(updated));
    };

    const handleStatusToggle = (status: HourEntryStatus) => {
        setLocalFilters({
            ...localFilters,
            status: localFilters.status === status ? undefined : status,
        });
    };

    return (
        <div className="p-0">
            <div className="space-y-6 p-0">
                {/* 1. Grid de Filtros - 5 colunas (Terapeutas, Paciente, Data Inicial, Data Final, Status) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Terapeutas */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Terapeutas</label>
                        <Combobox
                            options={therapistOptions}
                            value={localFilters.therapistIds?.[0] || ''}
                            onValueChange={(value: string) =>
                                setLocalFilters({
                                    ...localFilters,
                                    therapistIds: value ? [value] : undefined,
                                })
                            }
                            placeholder="Todos os terapeutas"
                            emptyMessage="Nenhum terapeuta encontrado"
                            className="h-9 rounded-[5px]"
                        />
                    </div>

                    {/* Paciente */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Paciente</label>
                        <Combobox
                            options={patientOptions}
                            value={localFilters.patientId || ''}
                            onValueChange={(value: string) =>
                                setLocalFilters({ ...localFilters, patientId: value || undefined })
                            }
                            placeholder="Todos os pacientes"
                            emptyMessage="Nenhum paciente encontrado"
                            className="h-9 rounded-[5px]"
                        />
                    </div>

                    {/* Data Inicial */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Data Inicial</label>
                        <DateField
                            value={localFilters.from || null}
                            onChange={(iso: string) =>
                                setLocalFilters({
                                    ...localFilters,
                                    from: iso || undefined,
                                })
                            }
                            placeholder="Selecione a data"
                            inputClassName="h-9 rounded-[5px] px-4 py-5"
                        />
                    </div>

                    {/* Data Final */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Data Final</label>
                        <DateField
                            value={localFilters.to || null}
                            onChange={(iso: string) =>
                                setLocalFilters({
                                    ...localFilters,
                                    to: iso || undefined,
                                })
                            }
                            placeholder="Selecione a data"
                            inputClassName="h-9 rounded-[5px] px-4 py-5"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Status</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        'h-9 w-full justify-between rounded-[5px] px-4 py-5 font-normal',
                                        !localFilters.status && 'text-muted-foreground',
                                    )}
                                >
                                    {localFilters.status
                                        ? STATUS_LABELS[localFilters.status]
                                        : 'Todos'}
                                    <X
                                        className={cn(
                                            'ml-2 h-4 w-4 shrink-0 opacity-50',
                                            !localFilters.status && 'hidden',
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLocalFilters({ ...localFilters, status: undefined });
                                        }}
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                                <div className="p-2 space-y-1">
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={cn(
                                                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                                localFilters.status === option.value &&
                                                    'bg-accent text-accent-foreground',
                                            )}
                                            onClick={() => handleStatusToggle(option.value)}
                                        >
                                            <Check
                                                className={cn(
                                                    'h-4 w-4',
                                                    localFilters.status === option.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* 2. Linha com Atalhos de Período (esquerda) e Botões de Ação (direita) */}
                <div className="flex items-center justify-between gap-4">
                    {/* Esquerda: Atalhos de Período */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Período:
                        </span>
                        <div className="flex gap-2">
                            {PERIOD_PRESETS.map((preset) => (
                                <Button
                                    key={preset.value}
                                    type="button"
                                    variant="outline"
                                    onClick={() => handlePresetClick(preset.value)}
                                    className="h-9 rounded-[5px] px-4 text-sm"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Direita: Botões de Ação */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={handleApply}
                            className="gap-2 h-9 rounded-[5px] px-4"
                        >
                            <Filter className="h-4 w-4" />
                            Aplicar filtros
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClear}
                            className="h-9 rounded-[5px] px-4"
                        >
                            Limpar
                        </Button>
                    </div>
                </div>

                {/* 3. Chips de filtros ativos */}
                {activeChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                        <span className="text-sm font-medium text-muted-foreground">
                            Filtros ativos:
                        </span>
                        {activeChips.map((chip) => (
                            <Badge
                                key={chip.value}
                                variant="secondary"
                                className="gap-1 cursor-pointer"
                            >
                                {chip.label}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveChip(chip)}
                                    className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
