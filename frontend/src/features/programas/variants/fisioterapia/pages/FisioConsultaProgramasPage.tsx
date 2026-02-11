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
} from '../../../consultar-programas/components';
import { listFisioPrograms } from '../services';
import { useCurrentArea, AREA_LABELS, type AreaType } from '@/contexts/AreaContext';

// Rotas base - area é adicionada dinamicamente
const getBaseRoutes = (area: string) => {
    const areaParam = `&area=${area}`;
    return {
        create: '/app/programas/novo-fisio',
        detail: (id: string) => `/app/programas/fisioterapia/programa/${id}?area=${area}`,
        newSession: (programId: string, patientId: string) => 
            `/app/programas/sessoes-fisio/registrar?programaId=${programId}&patientId=${patientId}${areaParam}`,
    };
};

export default function ToConsultaProgramasPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();
    const contextArea = useCurrentArea('fisioterapia');
    const areaFromUrl = searchParams.get('area') as AreaType | null;
    const area = areaFromUrl || contextArea;
    const areaLabel = AREA_LABELS[area] || 'Fisioterapia';
    const baseRoutes = getBaseRoutes(area);

    useEffect(() => {
        setPageTitle(`Consultar Programas & Objetivos - ${areaLabel}`);
    }, [setPageTitle, areaLabel]);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchState, setSearchState] = useState<SearchAndFiltersState>({
        q: searchParams.get('q') || '',
        status: (searchParams.get('status') as 'active' | 'archived' | 'all') || 'all',
        sort: (searchParams.get('sort') as 'recent' | 'alphabetic') || 'recent',
    });

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
    };

    const handleSearchChange = (newState: SearchAndFiltersState) => {
        setSearchState(newState);

        const params = new URLSearchParams();
        if (areaFromUrl) params.set('area', areaFromUrl);
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

        const areaQuery = area !== 'fisioterapia' ? `&area=${area}` : '';
        navigate(`${baseRoutes.create}?patientId=${selectedPatient.id}&patientName=${encodeURIComponent(selectedPatient.name)}${areaQuery}`);
    };

    const handleOpenProgram = (programId: string) => {
        navigate(baseRoutes.detail(programId));
    };

    const handleNewSession = (programId: string) => {
        if (!selectedPatient) return;
        navigate(baseRoutes.newSession(programId, selectedPatient.id));
    };

    const selectedFilters = [
        ...(searchState.status === 'all' ? [] : [searchState.status]),
        ...(searchState.sort === 'recent' ? [] : [searchState.sort]),
    ];

    return (
        <div className="flex flex-col min-h-full w-full">
            <main className="flex-1 pb-20 sm:pb-24 px-4 pt-4">
                <div className="space-y-4 max-w-full">
                    <PatientSelector
                        selected={selectedPatient}
                        onSelect={handlePatientSelect}
                        onClear={handlePatientClear}
                    />

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
                            className="h-10 w-10 rounded-full shrink-0"
                            title="Adicionar programa de Fisio"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    <ProgramList
                        searchQuery={searchState.q}
                        selectedFilters={selectedFilters}
                        selectedPatientId={selectedPatient?.id || null}
                        selectedPatientName={selectedPatient?.name}
                        onListPrograms={listFisioPrograms}
                        onOpenProgram={handleOpenProgram}
                        onNewSession={handleNewSession}
                    />
                </div>
            </main>
        </div>
    );
}
