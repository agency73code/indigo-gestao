import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import {
    PatientSelector,
    SearchAndFilters,
    ProgramList,
    type Patient,
    type SearchAndFiltersState,
} from '../consultar-programas/components';

export default function ConsultaOcpPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Consultar Programas & Objetivos');
    }, [setPageTitle]);

    // Estados principais
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchState, setSearchState] = useState<SearchAndFiltersState>({
        q: searchParams.get('q') || '',
        status: (searchParams.get('status') as 'active' | 'archived' | 'all') || 'all',
        sort: (searchParams.get('sort') as 'recent' | 'alphabetic') || 'recent',
    });

    // Handlers
    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
    };

    const handleSearchChange = (newState: SearchAndFiltersState) => {
        setSearchState(newState);

        // Atualizar URL params
        const params = new URLSearchParams();
        if (newState.q) params.set('q', newState.q);
        if (newState.status !== 'all') params.set('status', newState.status);
        if (newState.sort !== 'recent') params.set('sort', newState.sort);

        setSearchParams(params);
    };

    const handleCreateProgram = () => {
        if (!selectedPatient) {
            alert('Por favor, selecione um cliente antes de criar um programa.');
            return;
        }

        // Navegar para página de criação passando o ID do cliente como query param
        navigate(
            `/app/programas/novo?patientId=${selectedPatient.id}&patientName=${encodeURIComponent(selectedPatient.name)}`,
        );
    }; // Transformar filtros para formato esperado pelos componentes
        const selectedFilters = [
            ...(searchState.status === 'all' ? [] : [searchState.status]),
            ...(searchState.sort === 'recent' ? [] : [searchState.sort]),
        ];

    return (
        <div className="flex flex-col min-h-full w-full">
            <main className="flex-1 pb-20 sm:pb-24 px-4 pt-4">
                <div className="space-y-4 max-w-full">
                    {/* Seleção de Paciente */}
                    <PatientSelector
                        selected={selectedPatient}
                        onSelect={handlePatientSelect}
                        onClear={handlePatientClear}
                    />

                    {/* Busca e Filtros */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <SearchAndFilters
                                q={searchState.q}
                                status={searchState.status}
                                sort={searchState.sort}
                                onChange={(changes) => handleSearchChange({ ...searchState, ...changes })}
                                disabled={!selectedPatient}
                            />
                        </div>
                        <Button
                            onClick={handleCreateProgram}
                            disabled={!selectedPatient}
                            size="icon"
                            className="h-10 w-10 rounded-full flex-shrink-0"
                            title="Adicionar programa"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Lista de Programas */}
                    <ProgramList
                        searchQuery={searchState.q}
                        selectedFilters={selectedFilters}
                        selectedPatientId={selectedPatient?.id || null}
                        selectedPatientName={selectedPatient?.name}
                    />
                </div>
            </main>
        </div>
    );
}
