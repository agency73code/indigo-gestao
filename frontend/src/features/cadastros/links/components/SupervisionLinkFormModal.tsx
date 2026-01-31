import { useState, useEffect } from 'react';
import { searchTherapists } from '../services/links.service';
import { Search, User, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DateField } from '@/common/components/layout/DateField';
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
} from '@/components/ui/dialog';
import { SlidePanel } from '@/components/layout/SlidePanel';
import type {
    SupervisionLinkFormModalProps,
    CreateSupervisionLinkInput,
    UpdateSupervisionLinkInput,
    TerapeutaAvatar,
} from '../types';

export default function SupervisionLinkFormModal({
    open,
    onClose,
    onSubmit,
    initialData = null,
    therapists,
    loading = false,
    preSelectedSupervisorId,
}: SupervisionLinkFormModalProps) {
    // Estados do formulário
    const [supervisorId, setSupervisorId] = useState<string>('');
    const [supervisedTherapistId, setSupervisedTherapistId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [supervisionScope, setSupervisionScope] = useState<'direct' | 'team'>('direct');

    // Estados para busca de terapeutas
    const [supervisorSearch, setSupervisorSearch] = useState('');
    const [therapistSearch, setTherapistSearch] = useState('');
    const [selectedSupervisor, setSelectedSupervisor] = useState<TerapeutaAvatar | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<TerapeutaAvatar | null>(null);
    const [showSupervisorSearch, setShowSupervisorSearch] = useState(false);
    const [showTherapistSearch, setShowTherapistSearch] = useState(false);
    const [supervisorResults, setSupervisorResults] = useState<TerapeutaAvatar[]>([]);
    const [therapistResults, setTherapistResults] = useState<TerapeutaAvatar[]>([]);

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Determinar se é edição
    const isEdit = !!initialData && !!(initialData as any)?.id;

    // Efeito para carregar dados iniciais no modo edição
    useEffect(() => {
        if (open && initialData && isEdit) {
            setSupervisorId(initialData.supervisorId);
            setSupervisedTherapistId(initialData.supervisedTherapistId);
            setStartDate(initialData.startDate);
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
            setSupervisorId(preSelectedSupervisorId || '');
            setSupervisedTherapistId('');
            setStartDate(format(new Date(), 'yyyy-MM-dd'));
            setNotes('');
            setSupervisionScope('direct');
            setSelectedTherapist(null);
            setSupervisorSearch('');
            setTherapistSearch('');
            setErrors({});

            // Se tem supervisor pré-selecionado, carregar seus dados
            if (preSelectedSupervisorId) {
                const supervisor = therapists.find((t) => t.id === preSelectedSupervisorId);
                if (supervisor) {
                    setSelectedSupervisor(supervisor);
                    setSupervisorSearch(supervisor.nome);
                } else {
                    setSelectedSupervisor(null);
                }
            } else {
                setSelectedSupervisor(null);
            }
        }
    }, [open, initialData, isEdit, therapists, preSelectedSupervisorId]);

    // Efeito de busca de supervisor
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (showSupervisorSearch) {
                const results = await searchTherapists('supervisor', supervisorSearch);
                setSupervisorResults(results);
            }
        }, 400); // 400ms de debounce

        return () => clearTimeout(timeout);
    }, [supervisorSearch, showSupervisorSearch]);

    // Efeito de busca de terapeuta
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

        if (isEdit && initialData?.id) {
            const updateData: UpdateSupervisionLinkInput = {
                id: initialData.id,
                startDate: startDate,
                notes: notes.trim() || null,
                supervisionScope,
            };
            onSubmit(updateData);
        } else {
            const createData: CreateSupervisionLinkInput = {
                supervisorId,
                supervisedTherapistId,
                startDate: startDate,
                notes: notes.trim() || null,
                supervisionScope,
            };
            onSubmit(createData);
        }
    };

    const handleSupervisorSelect = (supervisor: TerapeutaAvatar) => {
        setSelectedSupervisor(supervisor);
        setSupervisorId(supervisor.id || '');
        setSupervisorSearch(supervisor.nome);
        setShowSupervisorSearch(false);

        // Limpar erro se existir
        if (errors.supervisor) {
            setErrors((prev) => ({ ...prev, supervisor: '' }));
        }
    };

    const handleTherapistSelect = (therapist: TerapeutaAvatar) => {
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

    const subtitle = selectedSupervisor && selectedTherapist
        ? `${selectedSupervisor.nome} → ${selectedTherapist.nome}`
        : selectedSupervisor
          ? selectedSupervisor.nome
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
            {isEdit ? 'Salvar' : 'Criar Vínculo'}
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
                    {/* Seleção de Supervisor */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Supervisor *</Label>
                        <div className="relative">
                            <div
                                className={cn(
                                    'flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-background',
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
                                                src={selectedSupervisor.avatarUrl || undefined}
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
                                    'flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-background',
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
                        <DateField
                            value={startDate}
                            onChange={(iso) => {
                                setStartDate(iso);
                                if (errors.startDate) {
                                    setErrors((prev) => ({ ...prev, startDate: '' }));
                                }
                            }}
                            placeholder="Selecione a data"
                            error={errors.startDate}
                        />
                    </div>

                    {/* Escopo de Supervisão */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Escopo de Supervisão</Label>
                        <Select value={supervisionScope} onValueChange={(value: 'direct' | 'team') => setSupervisionScope(value)}>
                            <SelectTrigger className="w-full bg-background">
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
                            className="min-h-[100px] resize-none bg-background"
                            maxLength={500}
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {notes.length}/500
                        </div>
                    </div>
                </div>
            </SlidePanel>

            {/* Modal de busca de supervisores */}
            {showSupervisorSearch && (
                <Dialog open={showSupervisorSearch} onOpenChange={setShowSupervisorSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-lg">
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
                                            return (
                                                <div
                                                    key={supervisor.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg"
                                                    onClick={() => handleSupervisorSelect(supervisor)}
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage 
                                                            src={supervisorAny.avatarUrl}
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
                    <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-lg">
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
                                            return (
                                                <div
                                                    key={therapist.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg"
                                                    onClick={() => handleTherapistSelect(therapist)}
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage 
                                                            src={therapistAny.avatarUrl} 
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
        </>
    );
}
