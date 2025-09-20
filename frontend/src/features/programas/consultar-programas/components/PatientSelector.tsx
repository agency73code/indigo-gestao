import { useState, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchPatients } from '../services';
import type { Patient } from '../types';

interface PatientSelectorProps {
    selected?: Patient | null;
    onSelect: (patient: Patient) => void;
    onClear?: () => void;
    autoOpenIfEmpty?: boolean;
}

export default function PatientSelector({
    selected,
    onSelect,
    onClear,
    autoOpenIfEmpty = false,
}: PatientSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Função para gerar iniciais do nome
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Buscar pacientes com debounce
    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchPatients(searchQuery);
                setPatients(results);
            } catch (error) {
                console.error('Erro ao buscar pacientes:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen]);

    // Auto abrir se não houver paciente selecionado
    useEffect(() => {
        if (autoOpenIfEmpty && !selected) {
            setIsOpen(true);
        }
    }, [autoOpenIfEmpty, selected]);

    const handleSelectPatient = (patient: Patient) => {
        onSelect(patient);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClearPatient = () => {
        onClear?.();
    };

    return (
        <>
            <Card padding="none" className="rounded-[5px] p-1 sm:p-0">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Paciente
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    {selected ? (
                        <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-[5px]">
                            {/* Avatar do paciente selecionado */}
                            <div className="flex-shrink-0">
                                {selected.photoUrl ? (
                                    <img
                                        src={selected.photoUrl}
                                        alt={`Foto de ${selected.name}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                        width={48}
                                        height={48}
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                                        {getInitials(selected.name)}
                                    </div>
                                )}
                            </div>

                            {/* Informações do paciente */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">{selected.name}</p>
                                {selected.guardianName && (
                                    <p className="text-sm text-muted-foreground">
                                        Responsável: {selected.guardianName}
                                    </p>
                                )}
                            </div>

                            {/* Botões de ação */}
                            <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsOpen(true)}
                                    className="text-xs sm:text-sm"
                                >
                                    Trocar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearPatient}
                                    className="text-xs sm:text-sm"
                                >
                                    Limpar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button className="w-full h-12" size="lg" onClick={() => setIsOpen(true)}>
                            <User className="h-4 w-4 mr-2" />
                            Selecionar paciente
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Seleção de Paciente */}
            {isOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-30 flex items-end justify-center md:items-center"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div className="bg-background w-full max-w-4xl h-[85vh] md:h-[70vh] rounded-t-lg md:rounded-lg shadow-lg animate-in slide-in-from-bottom md:fade-in duration-300 flex flex-col">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                            <h2 className="text-lg font-semibold">Selecionar Paciente</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-4 sm:p-6 flex-1 overflow-auto">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nome ou responsável..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {isLoading ? (
                                        <div className="space-y-2">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <Card padding="none" key={i} className="rounded-[5px]">
                                                    <CardContent className="p-4">
                                                        <div className="animate-pulse space-y-2">
                                                            <div className="h-4 bg-muted rounded w-3/4"></div>
                                                            <div className="h-3 bg-muted rounded w-1/2"></div> 
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        patients.map((patient) => (
                                            <Card
                                                padding="none"
                                                key={patient.id}
                                                className="cursor-pointer hover:shadow-md transition-shadow rounded-[5px]"
                                                onClick={() => handleSelectPatient(patient)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar do paciente */}
                                                        <div className="flex-shrink-0">
                                                            {patient.photoUrl ? (
                                                                <img
                                                                    src={patient.photoUrl}
                                                                    alt={`Foto de ${patient.name}`}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                    width={32}
                                                                    height={32}
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                                                                    {getInitials(patient.name)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Informações do paciente */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">
                                                                {patient.name}
                                                            </p>
                                                            {patient.guardianName && (
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    Responsável:{' '}
                                                                    {patient.guardianName}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Idade */}
                                                        {patient.age && (
                                                            <div className="flex-shrink-0 text-sm text-muted-foreground">
                                                                {patient.age} anos
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
            )}
        </>
    );
}
