import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Users, Search, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/ui/combobox';
import type { TransferResponsibleDialogProps, TransferResponsibleInput } from '../types';
import type { Terapeuta } from '../../types/cadastros.types';
import { searchTherapistsByName } from '../mocks/links.mock';

// Opções de atuação para o antigo responsável que se tornará co-terapeuta
const AREAS_ATUACAO_OPTIONS = [
    { value: 'Fonoaudiologia', label: 'Fonoaudiologia' },
    { value: 'Psicomotricidade', label: 'Psicomotricidade' },
    { value: 'Fisioterapia', label: 'Fisioterapia' },
    { value: 'Terapia Ocupacional', label: 'Terapia Ocupacional' },
    { value: 'Psicopedagogia', label: 'Psicopedagogia' },
    { value: 'Educador Físico', label: 'Educador Físico' },
    { value: 'Terapia ABA', label: 'Terapia ABA' },
    { value: 'Musicoterapia', label: 'Musicoterapia' },
    { value: 'Pedagogia', label: 'Pedagogia' },
    { value: 'Neuropsicologia', label: 'Neuropsicologia' },
    { value: 'Nutrição', label: 'Nutrição' },
];

export default function TransferResponsibleDialog({
    open,
    onClose,
    onConfirm,
    link,
    patient,
    therapist,
    therapists,
    loading = false,
}: TransferResponsibleDialogProps) {
    // Estados do formulário
    const [toTherapistId, setToTherapistId] = useState<string>('');
    const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
    const [oldResponsibleActuation, setOldResponsibleActuation] = useState<string>('');

    // Estados para busca de terapeutas
    const [therapistSearch, setTherapistSearch] = useState('');
    const [therapistResults, setTherapistResults] = useState<Terapeuta[]>([]);
    const [selectedTherapist, setSelectedTherapist] = useState<Terapeuta | null>(null);
    const [showTherapistSearch, setShowTherapistSearch] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Efeito para limpar formulário quando abrir
    useEffect(() => {
        if (open) {
            setToTherapistId('');
            setEffectiveDate(new Date());
            setOldResponsibleActuation('');
            setTherapistSearch('');
            setSelectedTherapist(null);
            setErrors({});
        }
    }, [open]);

    // Efeito para busca de terapeutas (excluir o terapeuta atual)
    useEffect(() => {
        const searchTherapists = async () => {
            if (therapistSearch.length >= 2) {
                const results = searchTherapistsByName(therapists, therapistSearch);
                // Filtrar o terapeuta atual
                const filteredResults = results.filter((t) => t.id !== link?.therapistId);
                setTherapistResults(filteredResults.slice(0, 10));
            } else {
                setTherapistResults([]);
            }
        };

        const timeoutId = setTimeout(searchTherapists, 300);
        return () => clearTimeout(timeoutId);
    }, [therapistSearch, therapists, link?.therapistId]);

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
        };

        onConfirm(transferData);
    };

    const handleTherapistSelect = (newTherapist: Terapeuta) => {
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

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-auto rounded-[5px]">
                    <DialogHeader>
                        <DialogTitle
                            style={{ fontFamily: 'Sora, sans-serif' }}
                            className="text-base sm:text-lg font-semibold flex items-center gap-2"
                        >
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                            Transferir Responsabilidade
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                            {patient && (
                                <>
                                    Transferir a responsabilidade do paciente{' '}
                                    <span className="font-medium">{patient.nome}</span> de{' '}
                                    <span className="font-medium">{therapist?.nome}</span> para
                                    outro terapeuta.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Seleção do Novo Terapeuta */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Novo Terapeuta Responsável *
                            </Label>
                            <div className="relative">
                                <div
                                    className={cn(
                                        'flex items-center gap-3 p-3 border rounded-md cursor-pointer',
                                        'hover:bg-muted/50 transition-colors',
                                        errors.therapist ? 'border-destructive' : 'border-input',
                                    )}
                                    onClick={() => setShowTherapistSearch(true)}
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

                        {/* Atuação do Antigo Responsável (agora Co-terapeuta) */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Atuação do Antigo Responsável (Co-terapeuta) *
                            </Label>
                            <Combobox
                                options={AREAS_ATUACAO_OPTIONS}
                                value={oldResponsibleActuation}
                                onValueChange={setOldResponsibleActuation}
                                placeholder="Selecione a área de atuação"
                                searchPlaceholder="Buscar atuação..."
                                emptyMessage="Nenhuma atuação encontrada."
                                error={!!errors.oldResponsibleActuation}
                            />
                            {errors.oldResponsibleActuation && (
                                <p className="text-sm text-destructive">
                                    {errors.oldResponsibleActuation}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                O terapeuta atual se tornará co-terapeuta com esta atuação específica.
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
                                            'w-full justify-start text-left font-normal',
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
                                <PopoverContent className=" p-0" align="start">
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
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
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
                            <span className="sm:hidden">Transferir</span>
                            <span className="hidden sm:inline">Transferir Responsabilidade</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de busca de terapeutas */}
            {showTherapistSearch && (
                <Dialog open={showTherapistSearch} onOpenChange={setShowTherapistSearch}>
                    <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto mx-auto rounded-[5px]">
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
                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-md"
                                                onClick={() => handleTherapistSelect(newTherapist)}
                                            >
                                                <Avatar className="h-8 w-8">
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
                                ) : therapistSearch.length >= 2 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Nenhum terapeuta encontrado
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Digite pelo menos 2 caracteres para buscar
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
