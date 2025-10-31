import { useState, useEffect } from 'react';
import { Search, User, Users, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type {
    SupervisionLinkFormModalProps,
    Terapeuta,
    CreateSupervisionLinkInput,
    UpdateSupervisionLinkInput,
} from '../types';
import { searchTherapistsByName } from '../mocks/links.mock';

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper para verificar se é cargo de supervisor
const isSupervisorRole = (cargo: string): boolean => {
    const supervisorRoles = [
        'Terapeuta Supervisor',
        'Supervisor ABA',
        'Coordenador ABA',
        'Gerente',
    ];
    return supervisorRoles.some((role) => cargo.toLowerCase().includes(role.toLowerCase()));
};

// Helper para verificar se é terapeuta clínico
const isClinicalTherapistRole = (cargo: string): boolean => {
    const clinicalRoles = [
        'Terapeuta Clínico',
        'Acompanhante Terapeutico',
        'Mediador de Conflitos',
        'Professor Uniindigo'
    ];
    return clinicalRoles.some((role) => cargo.toLowerCase().includes(role.toLowerCase()));
};

export default function SupervisionLinkFormModal({
    open,
    onClose,
    onSubmit,
    initialData = null,
    therapists,
    loading = false,
}: SupervisionLinkFormModalProps) {
    // Estados do formulário
    const [supervisorId, setSupervisorId] = useState<string>('');
    const [supervisedTherapistId, setSupervisedTherapistId] = useState<string>('');
    const [startDate, setStartDate] = useState<Date>();
    const [notes, setNotes] = useState('');
    const [supervisionScope, setSupervisionScope] = useState<'direct' | 'team'>('direct');

    // Estados para busca de terapeutas
    const [supervisorSearch, setSupervisorSearch] = useState('');
    const [therapistSearch, setTherapistSearch] = useState('');
    const [supervisorResults, setSupervisorResults] = useState<Terapeuta[]>([]);
    const [therapistResults, setTherapistResults] = useState<Terapeuta[]>([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState<Terapeuta | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<Terapeuta | null>(null);
    const [showSupervisorSearch, setShowSupervisorSearch] = useState(false);
    const [showTherapistSearch, setShowTherapistSearch] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Determinar se é edição
    const isEdit = !!initialData && !!(initialData as any)?.id;

    // Efeito para carregar dados iniciais no modo edição
    useEffect(() => {
        if (open && initialData && isEdit) {
            setSupervisorId(initialData.supervisorId);
            setSupervisedTherapistId(initialData.supervisedTherapistId);
            setStartDate(parseLocalDate(initialData.startDate));
            setNotes(initialData.notes || '');
            setSupervisionScope((initialData as any).supervisionScope || 'direct');

            // Buscar dados completos do supervisor e terapeuta
            const supervisor = therapists.find((t) => t.id === initialData.supervisorId);
            const therapist = therapists.find((t) => t.id === initialData.supervisedTherapistId);

            if (supervisor) {
                setSelectedSupervisor(supervisor);
                setSupervisorSearch(supervisor.nome);
            }
            if (therapist) {
                setSelectedTherapist(therapist);
                setTherapistSearch(therapist.nome);
            }
        } else if (open && !isEdit) {
            // Modo criação - resetar campos
            setSupervisorId('');
            setSupervisedTherapistId('');
            setStartDate(new Date());
            setNotes('');
            setSupervisionScope('direct');
            setSelectedSupervisor(null);
            setSelectedTherapist(null);
            setSupervisorSearch('');
            setTherapistSearch('');
            setErrors({});
        }
    }, [open, initialData, isEdit, therapists]);

    // Efeito para busca de supervisores
    useEffect(() => {
        const searchSupervisors = async () => {
            if (supervisorSearch.length >= 2) {
                const results = searchTherapistsByName(therapists, supervisorSearch);
                // Filtrar apenas supervisores
                const supervisorResults = results.filter((t) =>
                    t.dadosProfissionais?.[0]?.cargo &&
                    isSupervisorRole(t.dadosProfissionais[0].cargo)
                );
                setSupervisorResults(supervisorResults.slice(0, 10));
            } else if (supervisorSearch.length === 0) {
                // Mostrar todos os supervisores quando não há busca
                const allSupervisors = therapists.filter((t) =>
                    t.dadosProfissionais?.[0]?.cargo &&
                    isSupervisorRole(t.dadosProfissionais[0].cargo)
                );
                setSupervisorResults(allSupervisors.slice(0, 10));
            } else {
                setSupervisorResults([]);
            }
        };

        const timeoutId = setTimeout(searchSupervisors, 300);
        return () => clearTimeout(timeoutId);
    }, [supervisorSearch, therapists]);

    // Efeito para busca de terapeutas clínicos
    useEffect(() => {
        const searchClinicalTherapists = async () => {
            if (therapistSearch.length >= 2) {
                const results = searchTherapistsByName(therapists, therapistSearch);
                // Filtrar apenas terapeutas clínicos
                const clinicalResults = results.filter((t) =>
                    t.dadosProfissionais?.[0]?.cargo &&
                    isClinicalTherapistRole(t.dadosProfissionais[0].cargo)
                );
                setTherapistResults(clinicalResults.slice(0, 10));
            } else if (therapistSearch.length === 0) {
                // Mostrar todos os terapeutas clínicos quando não há busca
                const allClinical = therapists.filter((t) =>
                    t.dadosProfissionais?.[0]?.cargo &&
                    isClinicalTherapistRole(t.dadosProfissionais[0].cargo)
                );
                setTherapistResults(allClinical.slice(0, 10));
            } else {
                setTherapistResults([]);
            }
        };

        const timeoutId = setTimeout(searchClinicalTherapists, 300);
        return () => clearTimeout(timeoutId);
    }, [therapistSearch, therapists]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!supervisorId) {
            newErrors.supervisor = 'Selecione um supervisor';
        }

        if (!supervisedTherapistId) {
            newErrors.therapist = 'Selecione um terapeuta';
        }

        if (supervisorId === supervisedTherapistId) {
            newErrors.therapist = 'O supervisor e o terapeuta não podem ser a mesma pessoa';
        }

        if (!startDate) {
            newErrors.startDate = 'Selecione uma data de início';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const formattedStartDate = startDate
            ? format(startDate, 'yyyy-MM-dd')
            : new Date().toISOString().split('T')[0];

        if (isEdit && initialData?.id) {
            const updateData: UpdateSupervisionLinkInput = {
                id: initialData.id,
                startDate: formattedStartDate,
                notes: notes.trim() || null,
                supervisionScope,
            };
            onSubmit(updateData);
        } else {
            const createData: CreateSupervisionLinkInput = {
                supervisorId,
                supervisedTherapistId,
                startDate: formattedStartDate,
                notes: notes.trim() || null,
                supervisionScope,
            };
            onSubmit(createData);
        }
    };

    const handleSupervisorSelect = (supervisor: Terapeuta) => {
        setSelectedSupervisor(supervisor);
        setSupervisorId(supervisor.id || '');
        setSupervisorSearch(supervisor.nome);
        setShowSupervisorSearch(false);

        // Limpar erro se existir
        if (errors.supervisor) {
            setErrors((prev) => ({ ...prev, supervisor: '' }));
        }
    };

    const handleTherapistSelect = (therapist: Terapeuta) => {
        setSelectedTherapist(therapist);
        setSupervisedTherapistId(therapist.id || '');
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

    const title = isEdit ? 'Editar Vínculo de Supervisão' : 'Novo Vínculo de Supervisão';

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
                    {/* Seleção de Supervisor */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Supervisor *</Label>
                        <div className="relative">
                            <div
                                className={cn(
                                    'flex items-center gap-3 p-3 border rounded-[5px] cursor-pointer',
                                    'hover:bg-muted/50 transition-colors',
                                    errors.supervisor ? 'border-destructive' : 'border-input',
                                    isEdit && 'opacity-60 cursor-not-allowed',
                                )}
                                onClick={() => !isEdit && setShowSupervisorSearch(true)}
                            >
                                {selectedSupervisor ? (
                                    <>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage 
                                                src={(selectedSupervisor as any).avatarUrl 
                                                    ? ((selectedSupervisor as any).avatarUrl.startsWith('/api')
                                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${(selectedSupervisor as any).avatarUrl}`
                                                        : (selectedSupervisor as any).avatarUrl)
                                                    : undefined
                                                }
                                                alt={selectedSupervisor.nome}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(selectedSupervisor.nome)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {selectedSupervisor.nome}
                                            </p>
                                            {selectedSupervisor.dadosProfissionais?.[0]?.cargo && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {selectedSupervisor.dadosProfissionais[0].cargo}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Selecione um supervisor
                                        </span>
                                    </>
                                )}
                                {!isEdit && <Search className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            {errors.supervisor && (
                                <p className="text-sm text-destructive mt-1">{errors.supervisor}</p>
                            )}
                        </div>
                    </div>

                    {/* Seleção de Terapeuta Clínico */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Terapeuta Clínico *</Label>
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
                                            <AvatarImage 
                                                src={(selectedTherapist as any).avatarUrl 
                                                    ? ((selectedTherapist as any).avatarUrl.startsWith('/api')
                                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${(selectedTherapist as any).avatarUrl}`
                                                        : (selectedTherapist as any).avatarUrl)
                                                    : undefined
                                                }
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
                                            {selectedTherapist.dadosProfissionais?.[0]?.cargo && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {selectedTherapist.dadosProfissionais[0].cargo}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-muted-foreground" />
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
                                        errors.startDate && 'border-destructive'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? (
                                        format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                    ) : (
                                        <span>Selecione a data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setShowCalendar(false);
                                        if (errors.startDate) {
                                            setErrors((prev) => ({ ...prev, startDate: '' }));
                                        }
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && (
                            <p className="text-sm text-destructive">{errors.startDate}</p>
                        )}
                    </div>

                    {/* Escopo de Supervisão */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Escopo de Supervisão</Label>
                        <Select value={supervisionScope} onValueChange={(value: 'direct' | 'team') => setSupervisionScope(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o escopo" />
                            </SelectTrigger>
                            <SelectContent className="w-[400px]">
                                <SelectItem value="direct" className="flex-col items-start h-auto py-3">
                                    <span className="font-medium text-sm">Direta</span>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                        Supervisão apenas do terapeuta vinculado
                                    </span>
                                </SelectItem>
                                <SelectItem value="team" className="flex-col items-start h-auto py-3">
                                    <span className="font-medium text-sm">Equipe</span>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                        Supervisão do terapeuta e sua equipe
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {supervisionScope === 'direct' && 'O supervisor terá acesso apenas aos dados do terapeuta supervisionado.'}
                            {supervisionScope === 'team' && 'O supervisor terá acesso aos dados do terapeuta e de todos os subordinados dele.'}
                        </p>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Observações</Label>
                        <Textarea
                            placeholder="Observações sobre o vínculo de supervisão (opcional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {notes.length}/500
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-none gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span className="sm:hidden">
                            {isEdit ? 'Salvar' : 'Criar'}
                        </span>
                        <span className="hidden sm:inline">
                            {isEdit ? 'Salvar Alterações' : 'Criar Vínculo'}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Modal de busca de supervisores */}
            {showSupervisorSearch && (
                <Dialog open={showSupervisorSearch} onOpenChange={setShowSupervisorSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                Selecionar supervisor
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar supervisor..."
                                    value={supervisorSearch}
                                    onChange={(e) => setSupervisorSearch(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {supervisorResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {supervisorResults.map((supervisor) => {
                                            const supervisorAny = supervisor as any;
                                            const avatarUrl = supervisorAny.avatarUrl
                                                ? (supervisorAny.avatarUrl.startsWith('/api')
                                                    ? `${import.meta.env.VITE_API_BASE ?? ''}${supervisorAny.avatarUrl}`
                                                    : supervisorAny.avatarUrl)
                                                : undefined;
                                            
                                            return (
                                                <div
                                                    key={supervisor.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-[5px]"
                                                    onClick={() => handleSupervisorSelect(supervisor)}
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage 
                                                            src={avatarUrl} 
                                                            alt={supervisor.nome}
                                                        />
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(supervisor.nome)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {supervisor.nome}
                                                        </p>
                                                        {supervisor.dadosProfissionais?.[0]?.cargo && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {supervisor.dadosProfissionais[0].cargo}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : supervisorSearch.length > 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum supervisor encontrado
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum supervisor disponível
                                    </p>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal de busca de terapeutas clínicos */}
            {showTherapistSearch && (
                <Dialog open={showTherapistSearch} onOpenChange={setShowTherapistSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                                Selecionar terapeuta clínico
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
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-[5px]"
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
                                                        {therapist.dadosProfissionais?.[0]?.cargo && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {therapist.dadosProfissionais[0].cargo}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
