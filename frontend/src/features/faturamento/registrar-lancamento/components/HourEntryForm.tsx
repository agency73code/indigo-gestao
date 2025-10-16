import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Combobox } from '@/ui/combobox';
import { DateField } from '@/common/components/layout/DateField';
import { TimeField } from '@/common/components/layout/TimeField';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fetchClients } from '../../api';
import type { Patient } from '@/features/consultas/types/consultas.types';
import type { CreateHourEntryInput } from '../../types/hourEntry.types';
import { DURATION_OPTIONS } from '../../types/hourEntry.types';

type HourEntryFormMode = 'create' | 'edit';

interface HourEntryFormProps {
    mode: HourEntryFormMode;
    initialValues?: Partial<CreateHourEntryInput>;
    onCancel: () => void;
    onSubmit: (data: CreateHourEntryInput) => void | Promise<void>;
    isSubmitting?: boolean;
    canEdit?: boolean; // Permite editar campos se for rascunho
}

export function HourEntryForm({
    mode,
    initialValues,
    onCancel,
    onSubmit,
    isSubmitting = false,
    canEdit = true,
}: HourEntryFormProps) {
    // Estados do formulário
    const [patientId, setPatientId] = useState(initialValues?.patientId ?? '');
    const [date, setDate] = useState<Date | undefined>(
        initialValues?.date ? new Date(initialValues.date) : new Date(),
    );
    const [startTime, setStartTime] = useState(initialValues?.startTime ?? '');
    const [durationMinutes, setDurationMinutes] = useState<string>(
        initialValues?.durationMinutes?.toString() ?? '60',
    );
    const [notes, setNotes] = useState(initialValues?.notes ?? '');

    // Estados para pacientes
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);

    // Validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Carregar pacientes
    useEffect(() => {
        async function fetchPatients() {
            setIsLoadingPatients(true);
            try {
                const data = await fetchClients();
                setPatients(data);
            } catch (error) {
                console.error('Erro ao carregar pacientes:', error);
            } finally {
                setIsLoadingPatients(false);
            }
        }
        fetchPatients();
    }, []);

    // Opções de pacientes para o Combobox
    const patientOptions = patients.map((p) => ({
        value: p.id,
        label: p.nome,
    }));

    // Validação do formulário
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!patientId) {
            newErrors.patientId = 'Selecione um paciente';
        }

        if (!date) {
            newErrors.date = 'Selecione uma data';
        } else {
            // Normalizar as datas para comparação (apenas dia/mês/ano, ignorando horas)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);

            // Permite o dia atual, bloqueia apenas dias futuros
            if (selectedDate > today) {
                newErrors.date = 'Não é permitido selecionar datas futuras';
            }
        }

        if (!durationMinutes) {
            newErrors.durationMinutes = 'Selecione a duração';
        }

        if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) {
            newErrors.startTime = 'Formato inválido (HH:mm)';
        }

        if (notes && notes.length > 500) {
            newErrors.notes = 'Observação deve ter no máximo 500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler para enviar
    const handleSubmit = async () => {
        if (!validate()) return;

        const selectedPatient = patients.find((p) => p.id === patientId);
        const data: CreateHourEntryInput = {
            patientId,
            patientName: selectedPatient?.nome || 'Paciente',
            date: date ? format(date, 'yyyy-MM-dd') : '',
            startTime: startTime || undefined,
            durationMinutes: parseInt(durationMinutes) as 30 | 60 | 90 | 120,
            hasTravel: false,
            notes: notes || undefined,
        };

        console.log('📤 [Form] Enviando lançamento:', data);
        await onSubmit(data);
    };

    const isDisabled = isSubmitting || !canEdit;

    return (
        <div className="space-y-6">
            {/* Grid do formulário */}
            <div className="grid grid-cols-1 gap-6">
                {/* Linha 1: Paciente, Data e Horário */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Paciente */}
                    <div className="space-y-2">
                        <Label htmlFor="patient" className="required">
                            Paciente
                        </Label>
                        <Combobox
                            options={patientOptions}
                            value={patientId}
                            onValueChange={setPatientId}
                            placeholder="Selecione um paciente..."
                            searchPlaceholder="Buscar paciente..."
                            emptyMessage="Nenhum paciente encontrado."
                            disabled={
                                isDisabled || isLoadingPatients || (mode === 'edit' && !canEdit)
                            }
                            error={!!errors.patientId}
                            aria-label="Paciente"
                            aria-required="true"
                        />
                        {errors.patientId && (
                            <p className="text-xs text-destructive">{errors.patientId}</p>
                        )}
                    </div>

                    {/* Data */}
                    <div className="space-y-2">
                        <Label htmlFor="date" className="required">
                            Data do Atendimento
                        </Label>
                        {isDisabled || (mode === 'edit' && !canEdit) ? (
                            <Input
                                value={date ? format(date, 'dd/MM/yyyy') : ''}
                                disabled
                                className="h-9 rounded-[5px] px-4 py-5"
                            />
                        ) : (
                            <DateField
                                value={date ? format(date, 'yyyy-MM-dd') : ''}
                                onChange={(isoDate) => {
                                    if (isoDate) {
                                        setDate(new Date(isoDate));
                                    } else {
                                        setDate(undefined);
                                    }
                                }}
                                placeholder="Selecione a data"
                                error={errors.date}
                                maxDate={new Date()}
                                minDate={new Date('1900-01-01')}
                                inputClassName="h-9 rounded-[5px] px-4 py-5"
                            />
                        )}
                    </div>

                    {/* Horário de início */}
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Horário de Início (opcional)</Label>
                        <TimeField
                            value={startTime}
                            onChange={setStartTime}
                            placeholder="Selecione o horário"
                            error={errors.startTime}
                            disabled={isDisabled}
                            inputClassName="h-9 rounded-[5px] px-4 py-5"
                        />
                    </div>
                </div>

                {/* Duração - ToggleGroup (chips) */}
                <div className="space-y-2">
                    <Label className="required">Duração</Label>
                    <ToggleGroup
                        type="single"
                        value={durationMinutes}
                        onValueChange={(value) => value && setDurationMinutes(value)}
                        disabled={isDisabled}
                        className="justify-start gap-2"
                    >
                        {DURATION_OPTIONS.map((option) => (
                            <ToggleGroupItem
                                key={option.value}
                                value={option.value.toString()}
                                aria-label={option.label}
                                className={cn(
                                    'h-9 px-4 rounded-[5px] border',
                                    durationMinutes === option.value.toString() &&
                                        'bg-primary text-primary-foreground',
                                )}
                            >
                                {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    {errors.durationMinutes && (
                        <p className="text-xs text-destructive">{errors.durationMinutes}</p>
                    )}
                </div>
            </div>

            {/* Observação */}
            <div className="space-y-2">
                <Label htmlFor="notes">Observação (opcional)</Label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNotes(e.target.value)
                    }
                    placeholder="Adicione observações sobre o atendimento..."
                    rows={4}
                    disabled={isDisabled}
                    maxLength={500}
                    className={cn(
                        'flex min-h-[60px] w-full rounded-[5px] border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        errors.notes && 'border-destructive',
                    )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{notes.length}/500 caracteres</span>
                    {errors.notes && <span className="text-destructive">{errors.notes}</span>}
                </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="h-10 rounded-[5px] px-4"
                >
                    Cancelar
                </Button>

                <div className="flex-1 flex gap-3">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 h-10 rounded-[5px] px-4"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar para Aprovação'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
