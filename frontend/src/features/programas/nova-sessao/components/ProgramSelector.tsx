import { useState, useEffect } from 'react';
import { Search, FolderOpen, X, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listProgramsForSession } from '../services';
import type { Patient, ProgramListItem } from '../types';

interface ProgramSelectorProps {
    patient: Patient | null;
    selected?: ProgramListItem | null;
    onSelect: (program: ProgramListItem) => void;
    onClear?: () => void;
    autoOpenIfEmpty?: boolean;
}

export default function ProgramSelector({
    patient,
    selected,
    onSelect,
    onClear,
    autoOpenIfEmpty = false,
}: ProgramSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [programs, setPrograms] = useState<ProgramListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Função para formatar data
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return 'Data não informada';
        }
    };

    // Buscar programas com debounce
    useEffect(() => {
        if (!isOpen || !patient) return;

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const result = await listProgramsForSession({
                    patientId: patient.id,
                    q: searchQuery || undefined,
                    status: 'active', // Apenas programas ativos para sessões
                    sort: 'recent',
                });
                setPrograms(result);
            } catch (error) {
                console.error('Erro ao buscar programas:', error);
                setPrograms([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen, patient]);

    // Auto abrir se não houver programa selecionado
    useEffect(() => {
        if (autoOpenIfEmpty && patient && !selected) {
            setIsOpen(true);
        }
    }, [autoOpenIfEmpty, patient, selected]);

    const handleSelectProgram = (program: ProgramListItem) => {
        onSelect(program);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClearProgram = () => {
        onClear?.();
    };

    if (!patient) {
        return null; // Não exibir se não há paciente selecionado
    }

    return (
        <>
            <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Programa / Objetivo
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    {selected ? (
                        <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-[5px]">
                            {/* Status do programa */}
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>

                            {/* Informações do programa */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                    {selected.title || 'Programa sem título'}
                                </p>
                                {selected.objective && (
                                    <p className="text-sm text-muted-foreground truncate">
                                        {selected.objective}
                                    </p>
                                )}
                                {selected.lastSession && (
                                    <p className="text-xs text-muted-foreground">
                                        Última sessão: {formatDate(selected.lastSession)}
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
                                    onClick={handleClearProgram}
                                    className="text-xs sm:text-sm"
                                >
                                    Limpar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button className="w-full h-12" size="lg" onClick={() => setIsOpen(true)}>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Selecionar programa para {patient.name}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Seleção de Programa */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div className="bg-background w-full max-w-4xl h-[85vh] md:h-[70vh] rounded-t-lg md:rounded-lg shadow-lg animate-in slide-in-from-bottom md:fade-in duration-300 flex flex-col">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                            <h2 className="text-lg font-semibold">Selecionar Programa / Objetivo</h2>
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
                                        placeholder="Buscar programa por nome ou objetivo..."
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
                                                    <CardContent className="p-4">
                                                        <div className="animate-pulse space-y-2">
                                                            <div className="h-4 bg-muted rounded w-3/4"></div>
                                                            <div className="h-3 bg-muted rounded w-1/2"></div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : programs.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>
                                                {searchQuery
                                                    ? 'Nenhum programa encontrado para a busca'
                                                    : `Nenhum programa ativo encontrado para ${patient.name}`}
                                            </p>
                                        </div>
                                    ) : (
                                        programs.map((program) => (
                                            <Card
                                                padding="none"
                                                key={program.id}
                                                className="cursor-pointer hover:shadow-md transition-shadow rounded-[5px]"
                                                onClick={() => handleSelectProgram(program)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        {/* Status do programa */}
                                                        <div className="flex-shrink-0 mt-1">
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        </div>

                                                        {/* Informações do programa */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium">
                                                                {program.title ||
                                                                    'Programa sem título'}
                                                            </p>
                                                            {program.objective && (
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {program.objective}
                                                                </p>
                                                            )}
                                                            {program.lastSession && (
                                                                <p className="text-xs text-muted-foreground mt-2">
                                                                    Última sessão:{' '}
                                                                    {formatDate(
                                                                        program.lastSession,
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
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
