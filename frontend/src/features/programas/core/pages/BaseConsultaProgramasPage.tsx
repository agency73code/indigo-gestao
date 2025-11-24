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
} from '../../consultar-programas/components';

export interface BaseConsultaProgramasPageConfig {
    pageTitle: string;
    selectPatientLabel?: string;
    createButtonLabel?: string;
    noPatientMessage?: string;
}

export interface BaseConsultaProgramasPageProps {
    config: BaseConsultaProgramasPageConfig;
    createProgramRoute: (patientId: string, patientName: string) => string;
    onListPrograms?: (params: {
        patientId: string;
        q?: string;
        status?: 'active' | 'archived' | 'all';
        sort?: 'recent' | 'alphabetic';
        page?: number;
    }) => Promise<any[]>;
}

export function BaseConsultaProgramasPage({
    config,
    createProgramRoute,
    onListPrograms,
}: BaseConsultaProgramasPageProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle(config.pageTitle);
    }, [setPageTitle, config.pageTitle]);

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
        if (newState.q) params.set('q', newState.q);
        if (newState.status !== 'all') params.set('status', newState.status);
        if (newState.sort !== 'recent') params.set('sort', newState.sort);

        setSearchParams(params);
    };

    const handleCreateProgram = () => {
        if (!selectedPatient) {
            alert(config.noPatientMessage || 'Por favor, selecione um cliente antes de criar um programa.');
            return;
        }

        navigate(createProgramRoute(selectedPatient.id, selectedPatient.name));
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
                            className="h-10 w-10 rounded-full flex-shrink-0"
                            title={config.createButtonLabel || 'Adicionar programa'}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    <ProgramList
                        searchQuery={searchState.q}
                        selectedFilters={selectedFilters}
                        selectedPatientId={selectedPatient?.id || null}
                        selectedPatientName={selectedPatient?.name}
                        onListPrograms={onListPrograms}
                    />
                </div>
            </main>
        </div>
    );
}
