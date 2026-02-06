import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Users, Search, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/ui/combobox';
import { SlidePanel } from '@/components/layout/SlidePanel';
import type { TerapeutaAvatar, TransferResponsibleDialogProps, TransferResponsibleInput } from '../types';
import { searchTherapists } from '../services/links.service';

type ComboboxOption = { value: string; label: string };

function buildActuationOptions(therapist: TerapeutaAvatar | null | undefined): ComboboxOption[] {
    if (!therapist?.dadosProfissionais?.length) {
        return [];
    }

    const uniqueAreas = new Map<string, string>();

    therapist.dadosProfissionais.forEach((professionalData) => {
        const area = professionalData.areaAtuacao?.trim();

        if (!area) return;

        const key = area.toLowerCase();

        if (!uniqueAreas.has(key)) {
            uniqueAreas.set(key, area);
        }
    });

    return Array.from(uniqueAreas.values()).map((area) => ({ value: area, label: area }));
}

export default function TransferResponsibleDialog({
    open,
    onClose,
    onConfirm,
    link,
    patient,
    therapist,
    loading = false,
}: TransferResponsibleDialogProps) {
    // Estados do formulário
    const [toTherapistId, setToTherapistId] = useState<string>('');
    const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
    const [oldResponsibleActuation, setOldResponsibleActuation] = useState<string>('');
    const [newResponsibleActuation, setNewResponsibleActuation] = useState<string>('');

    // Estados para busca de terapeutas
    const [therapistSearch, setTherapistSearch] = useState('');
    const [therapistResults, setTherapistResults] = useState<TerapeutaAvatar[]>([]);
    const [selectedTherapist, setSelectedTherapist] = useState<TerapeutaAvatar | null>(null);
    const [showTherapistSearch, setShowTherapistSearch] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const [oldActuationOptions, setOldActuationOptions] = useState<ComboboxOption[]>([]);
    const [newActuationOptions, setNewActuationOptions] = useState<ComboboxOption[]>([]);

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Efeito para limpar formulário quando abrir
    useEffect(() => {
        if (open) {
            setToTherapistId('');
            setEffectiveDate(new Date());
            setOldResponsibleActuation('');
            setNewResponsibleActuation('');
            setTherapistSearch('');
            setSelectedTherapist(null);
            setNewActuationOptions([]);
            setErrors({});
        }
    }, [open]);

    // Efeito para resetar busca quando modal abre
    useEffect(() => {
        if (showTherapistSearch && !selectedTherapist) {
            setTherapistSearch('');
        }
    }, [showTherapistSearch, selectedTherapist]);

    useEffect(() => {
        const options = buildActuationOptions(therapist ?? null);
        setOldActuationOptions(options);

        setOldResponsibleActuation((current) => {
            if (options.length === 0) {
                return '';
            }

            if (current) {
                const match = options.find(
                    (option) => option.value.toLowerCase() === current.trim().toLowerCase(),
                );

                if (match) {
                    return match.value;
                }
            }

            if (options.length === 1) {
                return options[0].value;
            }

            return '';
        });
    }, [therapist]);

    useEffect(() => {
        const options = buildActuationOptions(selectedTherapist);
        setNewActuationOptions(options);

        setNewResponsibleActuation((current) => {
            if (options.length === 0) {
                return ''
            }

            if (current) {
                const match = options.find(
                    (option) => option.value.toLowerCase() === current.trim().toLowerCase(),
                );

                if (match) {
                    return match.value;
                }
            }

            if (options.length === 1) {
                return options[0].value;
            }

            return '';
        });
    }, [selectedTherapist]);

    useEffect(() => {
        if (!oldResponsibleActuation) {
            return;
        }

        setErrors((prev) => {
            if (!prev.oldResponsibleActuation) {
                return prev;
            }

            const nextErrors = { ...prev };
            delete nextErrors.oldResponsibleAction;
            return nextErrors;
        });
    }, [oldResponsibleActuation]);

    useEffect(() => {
        if (!newResponsibleActuation) {
            return;
        }

        setErrors((prev) => {
            if (!prev.newResponsibleActuation) {
                return prev;
            }

            const nextErrors = { ...prev };
            delete nextErrors.newResponsibleActuation;
            return nextErrors;
        });
    }, [newResponsibleActuation]);

    // Efeito de busca de terapeuta (real API)
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (showTherapistSearch) {
                const results = await searchTherapists('clinico', therapistSearch);
                setTherapistResults(results);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [therapistSearch, showTherapistSearch]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!toTherapistId) {
            newErrors.therapist = 'Selecione o novo terapeuta responsável';
        }

        if (toTherapistId === link?.therapistId) {
            newErrors.therapist = 'Selecione um terapeuta diferente do atual';
        }

        if (!oldResponsibleActuation) {
            newErrors.oldResponsibleActuation = 'Selecione a atuação para o antigo responsável';
        }

        if (!newResponsibleActuation) {
            newErrors.newResponsibleActuation = 'Selecione a atuação para o novo responsável';
        }

        if (!effectiveDate) {
            newErrors.effectiveDate = 'Selecione a data de transferência';
        } else if (link?.startDate && effectiveDate < new Date(link.startDate)) {
            newErrors.effectiveDate = 'A data deve ser posterior ao início do vínculo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm() || !link) return;

        const transferData: TransferResponsibleInput = {
            patientId: link.patientId,
            fromTherapistId: link.therapistId,
            toTherapistId: toTherapistId,
            effectiveDate: effectiveDate.toISOString(),
            oldResponsibleActuation: oldResponsibleActuation,
            newResponsibleActuation: newResponsibleActuation,
        };

        onConfirm(transferData);
    };

    const handleTherapistSelect = (newTherapist: TerapeutaAvatar) => {
        setSelectedTherapist(newTherapist);
        setToTherapistId(newTherapist.id || '');
        setTherapistSearch(newTherapist.nome);
        setShowTherapistSearch(false);

        // Limpar erro se existir
        if (errors.therapist) {
            setErrors((prev) => ({ ...prev, therapist: '' }));
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    if (!link) return null;

    const subtitle = patient && therapist
        ? `${patient.nome} • ${therapist.nome}`
        : patient
          ? patient.nome
          : undefined;

    const headerActions = (
        <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Transferir
        </Button>
    );

    return (
        <>
            <SlidePanel
                isOpen={open}
                onClose={onClose}
                title="Transferir Responsabilidade"
                subtitle={subtitle}
                headerActions={headerActions}
                width="md"
            >
                <div className="space-y-6">
                    {/* Informações do vínculo atual */}
                    {patient && therapist && (
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                Vínculo Atual
                            </p>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={therapist.avatarUrl || undefined}
                                        alt={therapist.nome}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(therapist.nome)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{therapist.nome}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        Responsável por {patient.nome}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seleção do Novo Terapeuta */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Novo Terapeuta Responsável *
                        </Label>
                        <div className="relative">
                            <div
                                className={cn(
                                    'flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-background',
                                    'hover:bg-muted/50 transition-colors',
                                    errors.therapist ? 'border-destructive' : 'border-input',
                                )}
                                onClick={() => setShowTherapistSearch(true)}
                            >
                                {selectedTherapist ? (
                                    <>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={selectedTherapist.avatarUrl || undefined}
                                                alt={selectedTherapist.nome}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(selectedTherapist.nome)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {selectedTherapist.nome}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Selecione o novo responsável
                                        </span>
                                    </>
                                )}
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            {errors.therapist && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.therapist}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Atuação do Novo Responsável */}
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                            Atuação do Novo Responsável *
                        </Label>
                        <Combobox
                            options={newActuationOptions}
                            value={newResponsibleActuation}
                            onValueChange={setNewResponsibleActuation}
                            placeholder={selectedTherapist
                                ? 'Selecione a área de atuação do novo responsável'
                                : 'Selecione um terapeuta para listar as áreas disponíveis'}
                            searchPlaceholder='Buscar atuação...'
                            emptyMessage={selectedTherapist
                                ? 'Nenhuma atuação encontrada.'
                                : 'Selecione um terapeuta para visualizar as áreas disponíveis.'}
                            disabled={!selectedTherapist || newActuationOptions.length === 0}
                            error={!!errors.newResponsibleActuation}
                        />
                        {errors.newResponsibleActuation && (
                            <p className='text-sm text-destructive'>
                                {errors.newResponsibleActuation}
                            </p>
                        )}
                        <p className='text-xs text-muted-foreground'>
                            As áreas exibidas são baseadas nos registros profissionais do terapeuta selecionado.
                        </p>
                    </div>

                    {/* Atuação do Antigo Responsável (após transferência) */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Atuação do Antigo Responsável *
                        </Label>
                        <Combobox
                            options={oldActuationOptions}
                            value={oldResponsibleActuation}
                            onValueChange={setOldResponsibleActuation}
                            placeholder="Selecione a área de atuação"
                            searchPlaceholder="Buscar atuação..."
                            emptyMessage={therapist
                                ? 'Nenhuma atuação encontrada.'
                                : 'Sem dados profissionais disponíveis.'}
                            disabled={oldActuationOptions.length === 0}
                            error={!!errors.oldResponsibleActuation}
                        />
                        {errors.oldResponsibleActuation && (
                            <p className="text-sm text-destructive">
                                {errors.oldResponsibleActuation}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            O terapeuta atual continuará vinculado com esta área de atuação específica.
                        </p>
                    </div>

                    {/* Data Efetiva da Transferência */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Data de Transferência *</Label>
                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal bg-background',
                                        !effectiveDate && 'text-muted-foreground',
                                        errors.effectiveDate && 'border-destructive',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {effectiveDate
                                        ? format(effectiveDate, "dd 'de' MMMM 'de' yyyy", {
                                              locale: ptBR,
                                          })
                                        : 'Selecione uma data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={effectiveDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setEffectiveDate(date);
                                            setShowCalendar(false);

                                            // Limpar erro se existir
                                            if (errors.effectiveDate) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    effectiveDate: '',
                                                }));
                                            }
                                        }
                                    }}
                                    locale={ptBR}
                                    fromDate={new Date(link.startDate)}
                                    toDate={new Date(new Date().getFullYear() + 10, 11, 31)}
                                    disabled={(date) => date < new Date(link.startDate)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.effectiveDate && (
                            <p className="text-sm text-destructive">{errors.effectiveDate}</p>
                        )}
                    </div>

                    {/* Informações importantes */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">Atenção</h3>
                                <div className="mt-2 text-sm text-amber-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Esta ação não pode ser desfeita automaticamente</li>
                                        <li>
                                            O novo terapeuta assumirá todas as responsabilidades
                                        </li>
                                        <li>Todas as sessões futuras serão transferidas</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SlidePanel>

            {/* Modal de busca de terapeutas */}
            {showTherapistSearch && (
                <Dialog open={showTherapistSearch} onOpenChange={setShowTherapistSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-auto rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                Selecionar Novo Responsável
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar terapeuta..."
                                    value={therapistSearch}
                                    onChange={(e) => setTherapistSearch(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {therapistResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {therapistResults.map((newTherapist) => (
                                            <div
                                                key={newTherapist.id}
                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg"
                                                onClick={() => handleTherapistSelect(newTherapist)}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={newTherapist.avatarUrl || undefined}
                                                        alt={newTherapist.nome}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(newTherapist.nome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {newTherapist.nome}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : therapistSearch.length > 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum terapeuta encontrado
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum terapeuta disponível
                                    </p>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
