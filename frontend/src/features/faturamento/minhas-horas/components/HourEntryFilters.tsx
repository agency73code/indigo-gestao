import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/ui/combobox';
import { DateField } from '@/common/components/layout/DateField';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ListHourEntriesQuery, HourEntryStatus } from '../../types/hourEntry.types';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/hourEntry.types';

interface FilterChip {
    label: string;
    value: string;
    type: 'period' | 'patient' | 'status';
}

interface HourEntryFiltersProps {
    onFilterChange: (filters: ListHourEntriesQuery) => void;
    patientOptions: Array<{ value: string; label: string }>;
}

// Presets de período
const PERIOD_PRESETS = [
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Últimos 90 dias', days: 90 },
    { label: 'Mês Atual', days: 'current-month' as const },
];

// Opções de status
const STATUS_OPTIONS: Array<{ value: HourEntryStatus; label: string }> = [
    { value: 'submitted', label: STATUS_LABELS.submitted },
    { value: 'approved', label: STATUS_LABELS.approved },
    { value: 'rejected', label: STATUS_LABELS.rejected },
    { value: 'paid', label: STATUS_LABELS.paid },
];

export function HourEntryFilters({ onFilterChange, patientOptions }: HourEntryFiltersProps) {
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedStatuses, setSelectedStatuses] = useState<HourEntryStatus[]>([]);
    const [activeChips, setActiveChips] = useState<FilterChip[]>([]);

    // Aplicar filtros
    const handleApply = () => {
        // Buscar nome do paciente selecionado (para filtro no mock)
        const selectedPatient = patientOptions.find((p) => p.value === selectedPatientId);

        const filters: ListHourEntriesQuery = {
            from: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
            to: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
            patientId: selectedPatientId || undefined,
            patientName: selectedPatient?.label, // Passa o nome para o mock funcionar
            status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
        };

        // Atualizar chips
        const chips: FilterChip[] = [];

        if (fromDate && toDate) {
            chips.push({
                label: `${format(fromDate, 'dd/MM/yy', { locale: ptBR })} - ${format(toDate, 'dd/MM/yy', { locale: ptBR })}`,
                value: 'period',
                type: 'period',
            });
        }

        if (selectedPatientId) {
            const patient = patientOptions.find((p) => p.value === selectedPatientId);
            if (patient) {
                chips.push({
                    label: patient.label,
                    value: selectedPatientId,
                    type: 'patient',
                });
            }
        }

        selectedStatuses.forEach((status) => {
            chips.push({
                label: STATUS_LABELS[status],
                value: status,
                type: 'status',
            });
        });

        setActiveChips(chips);
        onFilterChange(filters);
    };

    // Limpar filtros
    const handleClear = () => {
        setFromDate(undefined);
        setToDate(undefined);
        setSelectedPatientId('');
        setSelectedStatuses([]);
        setActiveChips([]);
        onFilterChange({});
    };

    // Aplicar preset de período
    const handlePresetClick = (days: number | 'current-month') => {
        const to = new Date();
        let from = new Date();

        if (days === 'current-month') {
            // Pega o primeiro dia do mês atual
            from = new Date(to.getFullYear(), to.getMonth(), 1);
        } else {
            // Subtrai os dias
            from.setDate(from.getDate() - days);
        }

        setFromDate(from);
        setToDate(to);
    };

    // Toggle status
    const handleStatusToggle = (status: HourEntryStatus) => {
        setSelectedStatuses((prev) => {
            if (prev.includes(status)) {
                return prev.filter((s) => s !== status);
            }
            return [...prev, status];
        });
    };

    // Remover chip individual
    const handleRemoveChip = (chip: FilterChip) => {
        if (chip.type === 'period') {
            setFromDate(undefined);
            setToDate(undefined);
        } else if (chip.type === 'patient') {
            setSelectedPatientId('');
        } else if (chip.type === 'status') {
            setSelectedStatuses((prev) => prev.filter((s) => s !== chip.value));
        }

        setActiveChips((prev) => prev.filter((c) => c !== chip));

        // Reaplicar filtros
        setTimeout(handleApply, 0);
    };

    return (
        <div className="p-0">
            <div className="space-y-6 p-0">
                {/* Grid de Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Paciente - PRIMEIRO */}
                    <div className="space-y-2">
                        <Label htmlFor="patient-select">Paciente</Label>
                        <Combobox
                            options={patientOptions}
                            value={selectedPatientId}
                            onValueChange={setSelectedPatientId}
                            placeholder="Todos os pacientes"
                            searchPlaceholder="Buscar paciente..."
                            emptyMessage="Nenhum paciente encontrado."
                        />
                    </div>

                    {/* Período - Data Inicial */}
                    <div className="space-y-2">
                        <Label htmlFor="from-date">Data Inicial</Label>
                        <DateField
                            value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
                            onChange={(isoDate) => {
                                if (isoDate) {
                                    setFromDate(new Date(isoDate));
                                } else {
                                    setFromDate(undefined);
                                }
                            }}
                            placeholder="Selecione a data inicial"
                            maxDate={new Date()}
                            inputClassName="h-9 rounded-[5px] px-4 py-5"
                        />
                    </div>

                    {/* Período - Data Final */}
                    <div className="space-y-2">
                        <Label htmlFor="to-date">Data Final</Label>
                        <DateField
                            value={toDate ? format(toDate, 'yyyy-MM-dd') : ''}
                            onChange={(isoDate) => {
                                if (isoDate) {
                                    setToDate(new Date(isoDate));
                                } else {
                                    setToDate(undefined);
                                }
                            }}
                            placeholder="Selecione a data final"
                            maxDate={new Date()}
                            disabled={fromDate ? (date) => date < fromDate : undefined}
                            inputClassName="h-9 rounded-[5px] px-4 py-5"
                        />
                    </div>

                    {/* Status - ÚLTIMO */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex flex-col gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal h-9 rounded-[5px] px-4 py-5"
                                    >
                                        {selectedStatuses.length === 0 ? (
                                            <span className="text-muted-foreground">
                                                Todos os status
                                            </span>
                                        ) : selectedStatuses.length === 1 ? (
                                            STATUS_LABELS[selectedStatuses[0]]
                                        ) : (
                                            `${selectedStatuses.length} selecionados`
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3" align="start">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium mb-3">
                                            Selecione os status
                                        </p>
                                        <div className="space-y-2">
                                            {STATUS_OPTIONS.map((option) => (
                                                <div
                                                    key={option.value}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-md p-2 transition-colors"
                                                    onClick={() => handleStatusToggle(option.value)}
                                                >
                                                    <div
                                                        className={cn(
                                                            'h-4 w-4 border rounded flex items-center justify-center',
                                                            selectedStatuses.includes(option.value)
                                                                ? 'bg-primary border-primary'
                                                                : 'border-input',
                                                        )}
                                                    >
                                                        {selectedStatuses.includes(
                                                            option.value,
                                                        ) && (
                                                            <svg
                                                                className="h-3 w-3 text-primary-foreground"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={3}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            'text-xs',
                                                            STATUS_COLORS[option.value],
                                                        )}
                                                    >
                                                        {option.label}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Linha com Atalhos de Período (esquerda) e Botões de Ação (direita) */}
                <div className="flex items-center justify-between gap-4">
                    {/* Atalhos de Período - Esquerda */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Período:
                        </span>
                        <div className="flex gap-2">
                            {PERIOD_PRESETS.map((preset) => (
                                <Button
                                    key={preset.days}
                                    variant="outline"
                                    onClick={() => handlePresetClick(preset.days)}
                                    className="h-9 rounded-[5px] px-4 text-sm"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Botões de Ação - Direita */}
                    <div className="flex items-center gap-2">
                        <Button onClick={handleApply} className="gap-2 h-9 rounded-[5px] px-4">
                            <Filter className="h-4 w-4" />
                            Aplicar filtros
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            className="h-9 rounded-[5px] px-4"
                        >
                            Limpar
                        </Button>
                    </div>
                </div>

                {/* Chips de filtros ativos */}
                {activeChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                        <span className="text-sm font-medium text-muted-foreground">
                            Filtros ativos:
                        </span>
                        {activeChips.map((chip, index) => (
                            <Badge key={index} variant="secondary" className="gap-1 pl-2 pr-1">
                                {chip.label}
                                <button
                                    onClick={() => handleRemoveChip(chip)}
                                    className="ml-1 rounded-sm hover:bg-muted p-0.5 transition-colors"
                                    aria-label={`Remover filtro ${chip.label}`}
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
