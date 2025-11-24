import { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CloseButton } from '@/components/layout/CloseButton';
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
    autoOpenIfEmpty = false,
}: PatientSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

    // Função para gerar iniciais do nome
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Função para calcular idade a partir da data de nascimento
    const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
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
                console.error('Erro ao buscar cliente:', error);
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

    return (
        <>
            <Card className="rounded-lg px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <h3 className="text-base flex items-center gap-2 font-normal" style={{fontFamily: "Sora"}}>
                        <User className="h-4 w-4" />
                        Cliente
                    </h3>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    {/* Conteúdo */}
                    {selected ? (
                        <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-lg">
                            {/* Avatar do cliente selecionado */}
                            <Avatar className="h-12 w-12 !rounded-full" style={{ borderRadius: '50%' }}>
                                {imageLoading[`selected-${selected.id}`] !== false && selected.photoUrl && (
                                    <Skeleton className="h-12 w-12 rounded-full absolute inset-0" />
                                )}
                                <AvatarImage 
                                    src={selected.photoUrl 
                                        ? (selected.photoUrl.startsWith('/api')
                                            ? `${import.meta.env.VITE_API_BASE ?? ''}${selected.photoUrl}`
                                            : selected.photoUrl)
                                        : undefined
                                    } 
                                    alt={selected.name} 
                                    style={{ borderRadius: '50%' }}
                                    onLoad={() => setImageLoading(prev => ({ ...prev, [`selected-${selected.id}`]: false }))}
                                    className={imageLoading[`selected-${selected.id}`] !== false ? 'opacity-0' : 'opacity-100 transition-opacity'}
                                />
                                <AvatarFallback className="!rounded-full bg-purple-100 text-purple-600" style={{ borderRadius: '50%' }}>
                                    {getInitials(selected.name)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Informações do paciente */}
                            <div className="flex-1 min-w-0">
                                <p className="font-regular text-base">{selected.name}</p>
                                {selected.guardianName && (
                                    <p className="text-xs text-muted-foreground">
                                        Responsável: {selected.guardianName}
                                    </p>
                                )}
                                {selected.birthDate && (
                                    <p className="text-xs text-muted-foreground">
                                        {calculateAge(selected.birthDate)} anos
                                    </p>
                                )}
                            </div>

                            {/* Botões de ação */}
                            <div className="flex gap-2 flex-shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsOpen(true)}
                                    className="text-xs h-8 rounded-md no-print"
                                >
                                    Trocar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            className="w-full h-12" 
                            size="lg" 
                            onClick={() => setIsOpen(true)}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Selecionar cliente
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Seleção de Paciente */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center no-print"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div className="bg-background w-full max-w-2xl h-[85vh] md:h-[80vh] rounded-t-lg md:rounded-lg shadow-lg animate-in slide-in-from-bottom md:fade-in duration-300 flex flex-col">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                            <h2 className="text-lg font-regular" style={{fontFamily: "sora"}}>Selecionar Cliente</h2>
                            <CloseButton onClick={() => setIsOpen(false)} />
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
                                                <Card
                                                    padding="none"
                                                    key={i}
                                                    className="rounded-lg"
                                                >
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
                                                className="cursor-pointer hover:shadow-md transition-shadow rounded-lg"
                                                onClick={() => handleSelectPatient(patient)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar do paciente */}
                                                        <Avatar className="h-8 w-8 !rounded-full" style={{ borderRadius: '50%' }}>
                                                            {imageLoading[`patient-${patient.id}`] !== false && patient.photoUrl && (
                                                                <Skeleton className="h-8 w-8 rounded-full absolute inset-0" />
                                                            )}
                                                            <AvatarImage 
                                                                src={patient.photoUrl 
                                                                    ? (patient.photoUrl.startsWith('/api')
                                                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${patient.photoUrl}`
                                                                        : patient.photoUrl)
                                                                    : undefined
                                                                } 
                                                                alt={patient.name} 
                                                                style={{ borderRadius: '50%' }}
                                                                onLoad={() => setImageLoading(prev => ({ ...prev, [`patient-${patient.id}`]: false }))}
                                                                className={imageLoading[`patient-${patient.id}`] !== false ? 'opacity-0' : 'opacity-100 transition-opacity'}
                                                            />
                                                            <AvatarFallback className="!rounded-full bg-purple-100 text-purple-600 text-xs" style={{ borderRadius: '50%' }}>
                                                                {getInitials(patient.name)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        {/* Informações do paciente */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-regular truncate">
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
