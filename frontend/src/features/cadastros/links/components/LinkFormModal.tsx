import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, User, Users, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/ui/combobox';
import type { CreateLinkInput, UpdateLinkInput, LinkFormModalProps } from '../types';
import type { Paciente, Terapeuta } from '../../types/cadastros.types';
import { searchPatientsByName, searchTherapistsByName } from '../mocks/links.mock';
import { isSupervisorRole } from '../../constants/access-levels';

type ComboboxOption = { value: string; label: string };

function buildActuationOptions(therapist: Terapeuta | null | undefined): ComboboxOption[] {
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

/**
 * Calcula o role baseado no cargo do terapeuta
 */
function calculateRoleFromTherapist(therapist: Terapeuta | null | undefined): 'responsible' | 'co' {
    if (!therapist?.dadosProfissionais?.length) {
        return 'co';
    }

    // Pega o primeiro cargo (principal) do terapeuta
    const primaryCargo = therapist.dadosProfissionais[0]?.cargo;
    
    if (!primaryCargo) {
        return 'co';
    }

    // Retorna 'responsible' se for supervisor (nível >= 3), senão 'co'
    return isSupervisorRole(primaryCargo) ? 'responsible' : 'co';
}

export default function LinkFormModal({
    open,
    onClose,
    onSubmit,
    initialData = null,
    patients,
    therapists,
    loading = false,
}: LinkFormModalProps) {
    // Estados do formulário
    const [patientId, setPatientId] = useState<string>('');
    const [therapistId, setTherapistId] = useState<string>('');
    const [actuationArea, setActuationArea] = useState<string>('');
    const [actuationOptions, setActuationOptions] = useState<ComboboxOption[]>([]);
    const [startDate, setStartDate] = useState<Date>();
    const [notes, setNotes] = useState('');

    // Estados para busca de pacientes/terapeutas
    const [patientSearch, setPatientSearch] = useState('');
    const [therapistSearch, setTherapistSearch] = useState('');
    const [patientResults, setPatientResults] = useState<Paciente[]>([]);
    const [therapistResults, setTherapistResults] = useState<Terapeuta[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<Terapeuta | null>(null);
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const [showTherapistSearch, setShowTherapistSearch] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Determinar se é edição ou criação de novo terapeuta
    const isEdit = !!initialData && !!(initialData as any)?.id;
    const isNewTherapistCreation = !!initialData && !!(initialData as any)?._isNewTherapistCreation;

    // Efeito para carregar dados iniciais no modo edição
    useEffect(() => {
        if (open && initialData && isEdit) {
            setPatientId(initialData.patientId);
            setTherapistId(initialData.therapistId);
            setActuationArea(initialData.actuationArea || '');
            setStartDate(new Date(initialData.startDate));
            setNotes(initialData.notes || '');

            // Buscar dados completos do paciente e terapeuta
            const patient = patients.find((p) => p.id === initialData.patientId);
            const therapist = therapists.find((t) => t.id === initialData.therapistId);

            if (patient) {
                setSelectedPatient(patient);
                setPatientSearch(patient.nome);
            }
            if (therapist) {
                setSelectedTherapist(therapist);
                setTherapistSearch(therapist.nome);
            }
        } else if (open && initialData && isNewTherapistCreation) {
            // Modo criação de novo terapeuta - pré-preencher paciente
            setPatientId(initialData.patientId);
            setTherapistId('');
            setActuationArea('');
            setStartDate(undefined);
            setNotes('');
            setSelectedTherapist(null);
            setTherapistSearch('');
            setErrors({});

            // Buscar e pré-preencher dados do paciente
            const patient = patients.find((p) => p.id === initialData.patientId);
            if (patient) {
                setSelectedPatient(patient);
                setPatientSearch(patient.nome);
            }
        } else if (open && (!initialData || (!isEdit && !isNewTherapistCreation))) {
            // Limpar formulário para criação normal
            setPatientId('');
            setTherapistId('');
            setActuationArea('');
            setStartDate(undefined);
            setNotes('');
            setSelectedPatient(null);
            setSelectedTherapist(null);
            setPatientSearch('');
            setTherapistSearch('');
            setErrors({});
        }
    }, [open, initialData, isEdit, isNewTherapistCreation, patients, therapists]);

    // Efeito para resetar busca de paciente quando modal abre
    useEffect(() => {
        if (showPatientSearch && !selectedPatient) {
            setPatientSearch('');
        }
    }, [showPatientSearch, selectedPatient]);

    // Efeito para resetar busca de terapeuta quando modal abre
    useEffect(() => {
        if (showTherapistSearch && !selectedTherapist) {
            setTherapistSearch('');
        }
    }, [showTherapistSearch, selectedTherapist]);

    useEffect(() => {
        const options = buildActuationOptions(selectedTherapist);
        setActuationOptions(options);

        setActuationArea((current) => {
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
    }, [selectedTherapist]);

    useEffect(() => {
        if (!actuationArea) {
            return;
        }

        setErrors((prev) => {
            if (!prev.actuationArea) {
                return prev;
            }

            const nextErrors = { ...prev };
            delete nextErrors.actuationArea;
            return nextErrors;
        });
    }, [actuationArea]);

    // Efeito para busca de pacientes
    useEffect(() => {
        const searchPatients = async () => {
            if (patientSearch.length >= 2) {
                const results = searchPatientsByName(patients, patientSearch);
                setPatientResults(results.slice(0, 10)); // Limitar a 10 resultados
            } else if (patientSearch.length === 0) {
                // Mostrar todos os pacientes quando não há busca
                setPatientResults(patients.slice(0, 10));
            } else {
                setPatientResults([]);
            }
        };

        const timeoutId = setTimeout(searchPatients, 300);
        return () => clearTimeout(timeoutId);
    }, [patientSearch, patients]);

    // Efeito para busca de terapeutas
    useEffect(() => {
        const searchTherapists = async () => {
            if (therapistSearch.length >= 2) {
                const results = searchTherapistsByName(therapists, therapistSearch);
                setTherapistResults(results.slice(0, 10)); // Limitar a 10 resultados
            } else if (therapistSearch.length === 0) {
                // Mostrar todos os terapeutas quando não há busca
                setTherapistResults(therapists.slice(0, 10));
            } else {
                setTherapistResults([]);
            }
        };

        const timeoutId = setTimeout(searchTherapists, 300);
        return () => clearTimeout(timeoutId);
    }, [therapistSearch, therapists]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!patientId) {
            newErrors.patient = 'Selecione um cliente';
        }

        if (!therapistId) {
            newErrors.therapist = 'Selecione um terapeuta';
        }

        if (!actuationArea) {
            newErrors.actuationArea = 'Selecione a área de atuação do terapeuta';
        }

        if (!startDate) {
            newErrors.startDate = 'Selecione a data de início';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Calcular role baseado no cargo do terapeuta selecionado
        const role = calculateRoleFromTherapist(selectedTherapist);

        if (!isEdit) {
            const createData: CreateLinkInput = {
                patientId: patientId,
                therapistId: therapistId,
                role,
                startDate: startDate!.toISOString(),
                notes: notes.trim() || undefined,
                actuationArea: actuationArea,
            };
            onSubmit(createData);
        } else {
            const updateData: UpdateLinkInput = {
                id: initialData!.id,
                role,
                startDate: startDate!.toISOString(),
                notes: notes.trim() || undefined,
                actuationArea: actuationArea,
            };
            onSubmit(updateData);
        }
    };

    const handlePatientSelect = (patient: Paciente) => {
        setSelectedPatient(patient);
        setPatientId(patient.id || '');
        setPatientSearch(patient.nome);
        setShowPatientSearch(false);

        // Limpar erro se existir
        if (errors.patient) {
            setErrors((prev) => ({ ...prev, patient: '' }));
        }
    };

    const handleTherapistSelect = (therapist: Terapeuta) => {
        setSelectedTherapist(therapist);
        setTherapistId(therapist.id || '');
        setTherapistSearch(therapist.nome);
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

    const title = isEdit
        ? 'Editar Vínculo'
        : isNewTherapistCreation
          ? 'Adicionar Terapeuta'
          : 'Novo Vínculo';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-auto rounded-[5px]">
                <DialogHeader>
                    <DialogTitle
                        style={{ fontFamily: 'Sora, sans-serif' }}
                        className="text-lg sm:text-xl font-semibold"
                    >
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                    {/* Seleção de Paciente */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Cliente *</Label>
                        <div className="relative">
                            <div
                                className={cn(
                                    'flex items-center gap-3 p-3 border rounded-[5px] cursor-pointer',
                                    'hover:bg-muted/50 transition-colors',
                                    errors.patient ? 'border-destructive' : 'border-input',
                                    isEdit && 'opacity-60 cursor-not-allowed',
                                )}
                                onClick={() => !isEdit && setShowPatientSearch(true)}
                            >
                                {selectedPatient ? (
                                    <>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(selectedPatient.nome)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {selectedPatient.nome}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Selecione um cliente
                                        </span>
                                    </>
                                )}
                                {!isEdit && <Search className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            {errors.patient && (
                                <p className="text-sm text-destructive mt-1">{errors.patient}</p>
                            )}
                        </div>
                    </div>

                    {/* Seleção de Terapeuta */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Terapeuta *</Label>
                        <div className="relative">
                            <div
                                className={cn(
                                    'flex items-center gap-3 p-3 border rounded-[5px] cursor-pointer',
                                    'hover:bg-muted/50 transition-colors',
                                    errors.therapist ? 'border-destructive' : 'border-input',
                                    isEdit && 'opacity-60 cursor-not-allowed',
                                )}
                                onClick={() => !isEdit && setShowTherapistSearch(true)}
                            >
                                {selectedTherapist ? (
                                    <>
                                        <Avatar className="h-8 w-8">
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
                                            Selecione um terapeuta
                                        </span>
                                    </>
                                )}
                                {!isEdit && <Search className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            {errors.therapist && (
                                <p className="text-sm text-destructive mt-1">{errors.therapist}</p>
                            )}
                        </div>
                    </div>

                    {/* Cargo do Terapeuta (read-only, calculado automaticamente) */}
                    {selectedTherapist && selectedTherapist.dadosProfissionais?.[0]?.cargo && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Cargo</Label>
                            <div className={cn(
                                'flex items-center gap-2 p-3 border rounded-[5px]',
                                isSupervisorRole(selectedTherapist.dadosProfissionais[0].cargo)
                                    ? 'bg-primary/10 border-primary/20'
                                    : 'bg-muted/30 border-input'
                            )}>
                                <span className="text-sm font-medium">
                                    {selectedTherapist.dadosProfissionais[0].cargo}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {isSupervisorRole(selectedTherapist.dadosProfissionais[0].cargo)
                                        ? '• Supervisor'
                                        : '• Terapeuta'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Campo de Atuação do Terapeuta */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Área de Atuação *</Label>
                        <Combobox
                            options={actuationOptions}
                            value={actuationArea}
                            onValueChange={(value) => setActuationArea(value)}
                            placeholder={selectedTherapist ? 'Selecione a área de atuação' : 'Selecione um terapeuta primeiro'}
                            searchPlaceholder="Buscar atuação..."
                            emptyMessage={selectedTherapist
                                ? 'Nenhuma atuação encontrada.'
                                : 'Selecione um terapeuta para visualizar as áreas disponíveis.'}
                            disabled={!selectedTherapist || actuationOptions.length === 0}
                            error={!!errors.actuationArea}
                        />
                        {errors.actuationArea && (
                            <p className="text-sm text-destructive">
                                {errors.actuationArea}
                            </p>
                        )}
                    </div>

                    {/* Data de Início */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Data de Início *</Label>
                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !startDate && 'text-muted-foreground',
                                        errors.startDate && 'border-destructive',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate
                                        ? format(startDate, "dd 'de' MMMM 'de' yyyy", {
                                              locale: ptBR,
                                          })
                                        : 'Selecione uma data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setShowCalendar(false);

                                        // Limpar erro se existir
                                        if (errors.startDate) {
                                            setErrors((prev) => ({ ...prev, startDate: '' }));
                                        }
                                    }}
                                    locale={ptBR}
                                    toDate={new Date(new Date().getFullYear() + 10, 11, 31)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && (
                            <p className="text-sm text-destructive">{errors.startDate}</p>
                        )}
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Observações</Label>
                        <textarea
                            className="w-full p-3 border border-input rounded-[5px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            placeholder="Observações sobre o vínculo (opcional)"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {notes.length}/500
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-auto gap-2 order-1 sm:order-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span className="sm:hidden">
                            {isEdit ? 'Salvar' : isNewTherapistCreation ? 'Adicionar' : 'Criar'}
                        </span>
                        <span className="hidden sm:inline">
                            {isEdit
                                ? 'Salvar Alterações'
                                : isNewTherapistCreation
                                  ? 'Adicionar Terapeuta'
                                  : 'Criar Vínculo'}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Modal de busca de pacientes */}
            {showPatientSearch && (
                <Dialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                Selecionar cliente
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar cliente..."
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {patientResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {patientResults.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-[5px]"
                                                onClick={() => handlePatientSelect(patient)}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(patient.nome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {patient.nome}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : patientSearch.length > 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum cliente encontrado
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum cliente disponível
                                    </p>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal de busca de terapeutas */}
            {showTherapistSearch && (
                <Dialog open={showTherapistSearch} onOpenChange={setShowTherapistSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                Selecionar Terapeuta
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
                                        {therapistResults.map((therapist) => (
                                            <div
                                                key={therapist.id}
                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-[5px]"
                                                onClick={() => handleTherapistSelect(therapist)}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(therapist.nome)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {therapist.nome}
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
        </Dialog>
    );
}
