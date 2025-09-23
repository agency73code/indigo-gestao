import { useState, useEffect } from 'react';
import { Calendar, User, UserCheck, X, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateField } from '@/common/components/layout/DateField';
import type { Patient, Therapist } from '../types';
import { searchPatients, searchTherapists } from '../services';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';

interface HeaderInfoProps {
    patient: Patient | null;
    therapist: Therapist | null;
    programName: string;
    createdAt: string;
    prazoInicio: string;
    prazoFim: string;
    onPatientSelect: (patient: Patient | null) => void;
    onTherapistSelect: (therapist: Therapist | null) => void;
    onProgramNameChange: (name: string) => void;
    onPrazoInicioChange: (prazo: string) => void;
    onPrazoFimChange: (prazo: string) => void;
}

interface SelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: Patient | Therapist) => void;
    title: string;
    searchPlaceholder: string;
    type: 'patient' | 'therapist';
}

function SelectorModal({
    isOpen,
    onClose,
    onSelect,
    title,
    searchPlaceholder,
    type,
}: SelectorModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<(Patient | Therapist)[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Função para gerar iniciais
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Buscar itens com debounce
    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results =
                    type === 'patient'
                        ? await searchPatients(searchQuery)
                        : await searchTherapists(searchQuery);
                setItems(results);
            } catch (error) {
                console.error(`Erro ao buscar ${type}s:`, error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen, type]);

    const handleSelect = (item: Patient | Therapist) => {
        onSelect(item);
        onClose();
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-background w-full max-w-4xl h-[85vh] md:h-[70vh] rounded-t-lg md:rounded-lg shadow-lg animate-in slide-in-from-bottom md:fade-in duration-300 flex flex-col">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 sm:p-6 flex-1 overflow-auto">
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Card key={i} className="rounded-[5px]">
                                            <CardContent className="p-2 sm:p-4">
                                                <div className="animate-pulse space-y-2">
                                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                items.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow rounded-[5px]"
                                        onClick={() => handleSelect(item)}
                                    >
                                        <CardContent className="p-2 sm:p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    {item.photoUrl ? (
                                                        <img
                                                            src={item.photoUrl}
                                                            alt={`Foto de ${item.name}`}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                            width={32}
                                                            height={32}
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                                                            {getInitials(item.name)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">
                                                        {item.name}
                                                    </p>
                                                    {type === 'patient' &&
                                                        (item as Patient).guardianName && (
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                Responsável:{' '}
                                                                {(item as Patient).guardianName}
                                                            </p>
                                                        )}
                                                </div>

                                                {type === 'patient' && (item as Patient).age && (
                                                    <div className="flex-shrink-0 text-sm text-muted-foreground">
                                                        {(item as Patient).age} anos
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HeaderInfo({
    patient,
    therapist,
    programName,
    createdAt,
    prazoInicio,
    prazoFim,
    onPatientSelect,
    onTherapistSelect,
    onProgramNameChange,
    onPrazoInicioChange,
    onPrazoFimChange,
}: HeaderInfoProps) {
    const [showPatientSelector, setShowPatientSelector] = useState(false);
    const [showTherapistSelector, setShowTherapistSelector] = useState(false);

    // Função para gerar iniciais
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <div className="space-y-4">
                {/* Paciente */}
                <Card  className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
                    <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className=" pb-3 sm:pb-6">
                        {patient ? (
                            <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-[5px]">
                                <div className="flex-shrink-0">
                                    {patient.photoUrl ? (
                                        <img
                                            src={patient.photoUrl}
                                            alt={`Foto de ${patient.name}`}
                                            className="w-12 h-12 rounded-full object-cover"
                                            width={48}
                                            height={48}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                                            {getInitials(patient.name)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{patient.name}</p>
                                    {patient.guardianName && (
                                        <p className="text-sm text-muted-foreground">
                                            Responsável: {patient.guardianName}
                                        </p>
                                    )}
                                    {patient.age && (
                                        <p className="text-xs text-muted-foreground">
                                            {patient.age} anos
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPatientSelector(true)}
                                        className="text-xs sm:text-sm"
                                    >
                                        Trocar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPatientSelect(null)}
                                        className="text-xs sm:text-sm"
                                    >
                                        Limpar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                className="w-full h-12"
                                size="lg"
                                onClick={() => setShowPatientSelector(true)}
                            >
                                <User className="h-4 w-4 mr-2" />
                                Selecionar paciente
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Terapeuta */}
                <Card className="rounded-[5px] p-1 sm:p-4 px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
                    <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Terapeuta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-6">
                        {therapist ? (
                            <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-md">
                                <div className="flex-shrink-0">
                                    {therapist.photoUrl ? (
                                        <img
                                            src={therapist.photoUrl}
                                            alt={`Foto de ${therapist.name}`}
                                            className="w-12 h-12 rounded-full object-cover"
                                            width={48}
                                            height={48}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                            {getInitials(therapist.name)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{therapist.name}</p>
                                </div>

                                <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
                                    <RequireAbility action="manage" subject="Terapeutas">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowTherapistSelector(true)}
                                            className="text-xs sm:text-sm"
                                        >
                                            Trocar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onTherapistSelect(null)}
                                            className="text-xs sm:text-sm"
                                        >
                                            Limpar
                                        </Button>
                                    </RequireAbility>
                                </div>
                            </div>
                        ) : (
                            <Button
                                className="w-full h-12"
                                size="lg"
                                onClick={() => setShowTherapistSelector(true)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Selecionar terapeuta
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Informações do programa */}
                <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
                    <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Informações do Programa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="program-name">Nome do programa (opcional)</Label>
                            <Input
                                id="program-name"
                                placeholder="Ex: Programa de desenvolvimento da linguagem"
                                value={programName}
                                onChange={(e) => onProgramNameChange(e.target.value)}
                                maxLength={120}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="created-at">Data de criação</Label>
                            <Input
                                id="created-at"
                                value={formatDate(createdAt)}
                                readOnly
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prazo-inicio">Data de início</Label>
                                <DateField
                                    value={prazoInicio}
                                    onChange={onPrazoInicioChange}
                                    placeholder="Selecione a data de início"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prazo-fim">Data de fim</Label>
                                <DateField
                                    value={prazoFim}
                                    onChange={onPrazoFimChange}
                                    placeholder="Selecione a data de fim"
                                    minDate={prazoInicio ? new Date(prazoInicio) : undefined}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modais de seleção */}
            <SelectorModal
                isOpen={showPatientSelector}
                onClose={() => setShowPatientSelector(false)}
                onSelect={(item) => onPatientSelect(item as Patient)}
                title="Selecionar Paciente"
                searchPlaceholder="Buscar por nome ou responsável..."
                type="patient"
            />

            <SelectorModal
                isOpen={showTherapistSelector}
                onClose={() => setShowTherapistSelector(false)}
                onSelect={(item) => onTherapistSelect(item as Therapist)}
                title="Selecionar Terapeuta"
                searchPlaceholder="Buscar por nome..."
                type="therapist"
            />
        </>
    );
}
