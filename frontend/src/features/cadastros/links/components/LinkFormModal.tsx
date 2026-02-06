import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Users, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DateField } from '@/common/components/layout/DateField';
import { Combobox } from '@/ui/combobox';
import { maskCurrencyBR, parseCurrencyBR } from '@/common/utils/mask';
import { SlidePanel } from '@/components/layout/SlidePanel';
import type {
    CreateLinkInput,
    UpdateLinkInput,
    LinkFormModalProps,
    ClientListItem,
    ClientOption,
} from '../types';
import type { TherapistListDTO, TherapistSelectDTO } from '@/features/therapists/types';
import { isSupervisorRole } from '../../constants/access-levels';
import { searchPatients, searchTherapists } from '../services/links.service';

type ComboboxOption = { value: string; label: string };

function buildActuationOptions(therapist: TherapistListDTO | null | undefined): ComboboxOption[] {
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
function calculateRoleFromTherapist(therapist: TherapistListDTO | null | undefined): 'responsible' | 'co' {
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
    const [startDate, setStartDate] = useState<string>('');
    const [valorSessao, setValorSessao] = useState<string>('');

    // Estados para busca de pacientes/terapeutas
    const [patientSearch, setPatientSearch] = useState('');
    const [therapistSearch, setTherapistSearch] = useState('');
    const [patientResults, setPatientResults] = useState<ClientOption[]>([]);
    const [therapistResults, setTherapistResults] = useState<TherapistSelectDTO[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<ClientListItem | ClientOption | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<TherapistSelectDTO | null>(null);
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const [showTherapistSearch, setShowTherapistSearch] = useState(false);

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Determinar se é edição ou criação de novo terapeuta
    const isEdit = !!initialData && !!(initialData as any)?.id;
    const isNewTherapistCreation = !!initialData && !!(initialData as any)?._isNewTherapistCreation;
    const isNewPatientCreation = !!initialData && !!(initialData as any)?._isNewPatientCreation;

    // Efeito para carregar dados iniciais no modo edição
    useEffect(() => {
        if (open && initialData && isEdit) {
            setPatientId(initialData.patientId);
            setTherapistId(initialData.therapistId);
            setActuationArea(initialData.actuationArea || '');
            setStartDate(initialData.startDate);
            // Carregar valor da sessão se existir
            if (initialData.valorSessao) {
                setValorSessao(maskCurrencyBR(String(Math.round(initialData.valorSessao * 100))));
            } else {
                setValorSessao('');
            }

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
            setStartDate(format(new Date(), 'yyyy-MM-dd')); // Data atual como padrão
            setValorSessao('');
            setSelectedTherapist(null);
            setTherapistSearch('');
            setErrors({});

            // Buscar e pré-preencher dados do paciente
            const patient = patients.find((p) => p.id === initialData.patientId);
            if (patient) {
                setSelectedPatient(patient);
                setPatientSearch(patient.nome);
            }
        } else if (open && initialData && isNewPatientCreation) {
            // Modo criação de novo paciente - pré-preencher terapeuta
            setTherapistId(initialData.therapistId);
            setPatientId('');
            setActuationArea('');
            setStartDate(format(new Date(), 'yyyy-MM-dd')); // Data atual como padrão
            setValorSessao('');
            setSelectedPatient(null);
            setPatientSearch('');
            setErrors({});

            // Buscar e pré-preencher dados do terapeuta
            const therapist = therapists.find((t) => t.id === initialData.therapistId);
            if (therapist) {
                setSelectedTherapist(therapist);
                setTherapistSearch(therapist.nome);
            }
        } else if (open && (!initialData || (!isEdit && !isNewTherapistCreation && !isNewPatientCreation))) {
            // Limpar formulário para criação normal
            setPatientId('');
            setTherapistId('');
            setActuationArea('');
            setStartDate(format(new Date(), 'yyyy-MM-dd')); // Data atual como padrão
            setValorSessao('');
            setSelectedPatient(null);
            setSelectedTherapist(null);
            setPatientSearch('');
            setTherapistSearch('');
            setErrors({});
        }
    }, [open, initialData, isEdit, isNewTherapistCreation, isNewPatientCreation, patients, therapists]);

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

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (showTherapistSearch) {
                const results = await searchTherapists('all', therapistSearch);
                setTherapistResults(results);
            } 
        }, 400);

        return () => clearTimeout(timeout);
    }, [therapistSearch, showTherapistSearch]);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (showPatientSearch) {
                const results = await searchPatients(patientSearch);
                setPatientResults(results);
            } 
        }, 400);

        return () => clearTimeout(timeout);
    }, [patientSearch, showPatientSearch]);

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

        // Converter valor da sessão para número
        const valorSessaoNumerico = valorSessao ? parseCurrencyBR(valorSessao) : null;

        if (!isEdit) {
            const createData: CreateLinkInput = {
                patientId: patientId,
                therapistId: therapistId,
                role,
                startDate: startDate,
                actuationArea: actuationArea,
                valorSessao: valorSessaoNumerico,
            };
            onSubmit(createData);
        } else {
            const updateData: UpdateLinkInput = {
                id: initialData!.id,
                role,
                startDate: startDate,
                actuationArea: actuationArea,
                valorSessao: valorSessaoNumerico,
            };
            onSubmit(updateData);
        }
    };

    const handlePatientSelect = (patient: ClientListItem | ClientOption) => {
        setSelectedPatient(patient);
        setPatientId(patient.id || '');
        setPatientSearch(patient.nome);
        setShowPatientSearch(false);

        // Limpar erro se existir
        if (errors.patient) {
            setErrors((prev) => ({ ...prev, patient: '' }));
        }
    };

    const handleTherapistSelect = (therapist: TherapistSelectDTO) => {
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
          : isNewPatientCreation
            ? 'Adicionar Cliente'
            : 'Novo Vínculo';

    const subtitle = selectedPatient && selectedTherapist
        ? `${selectedPatient.nome} • ${selectedTherapist.nome}`
        : selectedPatient
          ? selectedPatient.nome
          : selectedTherapist
            ? selectedTherapist.nome
            : undefined;

    const headerActions = (
        <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit
                ? 'Salvar'
                : isNewTherapistCreation
                  ? 'Adicionar'
                  : isNewPatientCreation
                    ? 'Adicionar'
                    : 'Criar Vínculo'}
        </Button>
    );

    return (
        <>
            <SlidePanel
                isOpen={open}
                onClose={onClose}
                title={title}
                subtitle={subtitle}
                headerActions={headerActions}
                width="md"
            >
                <div className="space-y-6">
                    {/* Seleção de Paciente */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Cliente *</Label>
                        <Popover open={showPatientSearch} onOpenChange={setShowPatientSearch}>
                            <PopoverTrigger asChild disabled={isEdit || isNewTherapistCreation}>
                                <div
                                    className={cn(
                                        'flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-background',
                                        'hover:bg-muted/50 transition-colors',
                                        errors.patient ? 'border-destructive' : 'border-input',
                                        (isEdit || isNewTherapistCreation) && 'opacity-60 cursor-not-allowed',
                                    )}
                                >
                                    {selectedPatient ? (
                                        <>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage 
                                                    src={(selectedPatient as any).avatarUrl || undefined}
                                                    alt={selectedPatient.nome}
                                                />
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
                                    {!(isEdit || isNewTherapistCreation) && <Search className="h-4 w-4 text-muted-foreground" />}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-(--radix-popover-trigger-width) p-0" 
                                align="start"
                                sideOffset={4}
                            >
                                <div className="p-3 border-b">
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
                                </div>
                                <div className="max-h-60 overflow-y-auto p-1">
                                    {patientResults.length > 0 ? (
                                        <div className="space-y-1">
                                            {patientResults.map((patient) => {
                                                const patientAny = patient as any;
                                                const avatarUrl = patientAny.avatarUrl
                                                    ? (patientAny.avatarUrl.startsWith('/api')
                                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${patientAny.avatarUrl}`
                                                        : patientAny.avatarUrl)
                                                    : undefined;
                                                
                                                return (
                                                    <div
                                                        key={patient.id}
                                                        className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer rounded-md"
                                                        onClick={() => handlePatientSelect(patient)}
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage 
                                                                src={avatarUrl} 
                                                                alt={patient.nome}
                                                            />
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
                                                );
                                            })}
                                        </div>
                                    ) : patientSearch.length > 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            Nenhum cliente encontrado
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            Digite para buscar clientes
                                        </p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {errors.patient && (
                            <p className="text-sm text-destructive mt-1">{errors.patient}</p>
                        )}
                    </div>

                    {/* Seleção de Terapeuta */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Terapeuta *</Label>
                        <Popover open={showTherapistSearch} onOpenChange={setShowTherapistSearch}>
                            <PopoverTrigger asChild disabled={isEdit || isNewPatientCreation}>
                                <div
                                    className={cn(
                                        'flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-background',
                                        'hover:bg-muted/50 transition-colors',
                                        errors.therapist ? 'border-destructive' : 'border-input',
                                        (isEdit || isNewPatientCreation) && 'opacity-60 cursor-not-allowed',
                                    )}
                                >
                                    {selectedTherapist ? (
                                        <>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage 
                                                    src={(selectedTherapist as any).avatarUrl || undefined}
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
                                                Selecione um terapeuta
                                            </span>
                                        </>
                                    )}
                                    {!(isEdit || isNewPatientCreation) && <Search className="h-4 w-4 text-muted-foreground" />}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-(--radix-popover-trigger-width) p-0" 
                                align="start"
                                sideOffset={4}
                            >
                                <div className="p-3 border-b">
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
                                </div>
                                <div className="max-h-60 overflow-y-auto p-1">
                                    {therapistResults.length > 0 ? (
                                        <div className="space-y-1">
                                            {therapistResults.map((therapist) => {
                                                const therapistAny = therapist as any;
                                                const avatarUrl = therapistAny.avatarUrl
                                                    ? (therapistAny.avatarUrl.startsWith('/api')
                                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${therapistAny.avatarUrl}`
                                                        : therapistAny.avatarUrl)
                                                    : undefined;
                                                
                                                return (
                                                    <div
                                                        key={therapist.id}
                                                        className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer rounded-md"
                                                        onClick={() => handleTherapistSelect(therapist)}
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage 
                                                                src={avatarUrl} 
                                                                alt={therapist.nome}
                                                            />
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
                                                );
                                            })}
                                        </div>
                                    ) : therapistSearch.length > 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            Nenhum terapeuta encontrado
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            Digite para buscar terapeutas
                                        </p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {errors.therapist && (
                            <p className="text-sm text-destructive mt-1">{errors.therapist}</p>
                        )}
                    </div>

                    {/* Cargo do Terapeuta (read-only, calculado automaticamente) */}
                    {selectedTherapist && selectedTherapist.dadosProfissionais?.[0]?.cargo && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Cargo</Label>
                            <div className={cn(
                                'flex items-center gap-2 p-3 border rounded-lg bg-background',
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

                    {/* Valor da Sessão */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Valor da Sessão</Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            value={valorSessao}
                            onChange={(e) => setValorSessao(maskCurrencyBR(e.target.value))}
                            className="rounded-lg bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                            Valor cobrado do cliente para sessões desta especialidade
                        </p>
                    </div>

                    {/* Data de Início */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Data de Início *</Label>
                        <DateField
                            value={startDate}
                            onChange={(iso) => {
                                setStartDate(iso);
                                if (errors.startDate) {
                                    setErrors((prev) => ({ ...prev, startDate: '' }));
                                }
                            }}
                            placeholder="Selecione uma data"
                            error={errors.startDate}
                            maxDate={new Date(new Date().getFullYear() + 10, 11, 31)}
                        />
                    </div>
                </div>
            </SlidePanel>
        </>
    );
}
