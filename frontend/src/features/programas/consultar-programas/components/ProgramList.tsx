import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProgramListItem } from '../types';
import { listPrograms } from '../services';
import ProgramCard from './ProgramCard';
import EmptyState from './EmptyState';
import ErrorBanner from './ErrorBanner';

interface ProgramListProps {
    searchQuery: string;
    selectedFilters: string[];
    selectedPatientId: string | null;
    selectedPatientName?: string;
}

export default function ProgramList({
    searchQuery,
    selectedFilters,
    selectedPatientId,
    selectedPatientName,
}: ProgramListProps) {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState<ProgramListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simulação de busca de programas
    const loadPrograms = async () => {
        if (!selectedPatientId) {
            setPrograms([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            type typeStatus = 'active' | 'archived';
            type typeSort = 'recent' | 'alphabetic';
            const statusValues = ['active', 'archived'] as const;
            const sortValues = ['alphabetic', 'recent'] as const;

            const status: 'active' | 'archived' | 'all' =
            selectedFilters.find((f): f is 'active' | 'archived' => 
                statusValues.includes(f as typeStatus)
            ) ?? 'all';

            const sort: 'alphabetic' | 'recent' =
            selectedFilters.find((f): f is 'alphabetic' | 'recent' => 
                sortValues.includes(f as typeSort)
            ) ?? 'recent';
            
            const result = await listPrograms({
                patientId: selectedPatientId,
                q: searchQuery || undefined,
                status,
                sort,
            });
            setPrograms(result);
        } catch {
            setError('Erro ao carregar programas. Tente novamente.');
            setPrograms([]);
        } finally {
            setLoading(false);
        }
    };

    // Trigger search when dependencies change
    useEffect(() => {
        loadPrograms();
    }, [selectedPatientId, searchQuery, selectedFilters]);

    const handleOpenProgram = (programId: string) => {
        // Preservar patientId quando houver
        const patientId = selectedPatientId;
        const path = `/app/programas/${programId}`;
        const url = patientId ? `${path}?patientId=${patientId}` : path;

        console.log('Abrindo programa:', programId, 'URL:', url);
        navigate(url);
    };

    const handleNewSession = (programId: string) => {
        const patientId = selectedPatientId;
        const params = new URLSearchParams();
        params.set('programaId', programId);
        if (patientId) params.set('patientId', patientId);

        const url = `/app/programas/sessoes/nova?${params.toString()}`;
        console.log('Nova sessão para programa:', programId, 'URL:', url);
        navigate(url);
    };

    const handleRetry = () => {
        loadPrograms();
    };

    // Estados de erro
    if (error) {
        return <ErrorBanner message={error} onRetry={handleRetry} />;
    }

    // Estado sem paciente selecionado
    if (!selectedPatientId) {
        return <EmptyState variant="no-patient" />;
    }

    // Estado de carregamento
    if (loading) {
        return (
            <div className="grid gap-4 sm:gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                ))}
            </div>
        );
    }

    // Estado sem resultados
    if (programs.length === 0) {
        const hasActiveFilters = Boolean(searchQuery) || selectedFilters.length > 0;
        return (
            <EmptyState
                variant="no-programs"
                patientName={selectedPatientName}
                hasFilters={hasActiveFilters}
            />
        );
    }

    // Lista de programas
    return (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {programs.map((program) => (
                <ProgramCard
                    key={program.id}
                    program={program}
                    onOpen={handleOpenProgram}
                    onNewSession={handleNewSession}
                />
            ))}
        </div>
    );
}
