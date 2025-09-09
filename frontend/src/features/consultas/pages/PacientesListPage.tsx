import { useState, useEffect, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ToolbarConsulta from '../components/ToolbarConsulta';
import PatientTable from '../components/PatientTable';
import PatientProfileDrawer from '../components/PatientProfileDrawer';
import { getPatients } from '../mocks/patients.mock';
import type { Patient, SortState, PaginationState } from '../types/consultas.types';

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function PacientesListPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Estados para ordenação e paginação
    const [sortState, setSortState] = useState<SortState>({
        field: 'nome',
        direction: 'asc',
    });

    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    // Debounce para busca
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Carregar dados
    useEffect(() => {
        const loadPatients = async () => {
            setLoading(true);
            try {
                // TODO: integrar API - substituir por service real
                const data = await getPatients();
                setPatients(data);
            } catch (error) {
                console.error('Erro ao carregar pacientes:', error);
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, []);

    // Filtrar e ordenar dados
    const filteredAndSortedPatients = useMemo(() => {
        let filtered = patients;

        // Aplicar filtro de busca
        if (debouncedSearchTerm) {
            const search = debouncedSearchTerm.toLowerCase();
            filtered = patients.filter(
                (patient) =>
                    patient.nome.toLowerCase().includes(search) ||
                    patient.email?.toLowerCase().includes(search) ||
                    patient.telefone?.includes(search) ||
                    patient.responsavel?.toLowerCase().includes(search),
            );
        }

        // Aplicar ordenação
        filtered.sort((a, b) => {
            const aValue = a[sortState.field as keyof Patient] as string;
            const bValue = b[sortState.field as keyof Patient] as string;

            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;

            const comparison = aValue.localeCompare(bValue, 'pt-BR');
            return sortState.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [patients, debouncedSearchTerm, sortState]);

    // Aplicar paginação
    const paginatedPatients = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return filteredAndSortedPatients.slice(startIndex, endIndex);
    }, [filteredAndSortedPatients, pagination.page, pagination.pageSize]);

    // Atualizar total quando os dados filtrados mudarem
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: filteredAndSortedPatients.length,
            page: 1, // Reset para primeira página quando filtrar
        }));
    }, [filteredAndSortedPatients.length]);

    // Handlers
    const handleSort = (field: string) => {
        setSortState((prev) => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const handleViewProfile = (patient: Patient) => {
        setSelectedPatient(patient);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedPatient(null);
    };

    // Calcular páginas para paginação
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const maxVisiblePages = 5;

    let visiblePages = pages;
    if (totalPages > maxVisiblePages) {
        const start = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
        const end = Math.min(totalPages, start + maxVisiblePages - 1);
        visiblePages = pages.slice(start - 1, end);
    }

    return (
        <div className="flex flex-col top-0 left-0 w-full h-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-primary">
                        Consultar Pacientes
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Visualize e gerencie os pacientes cadastrados no sistema.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ToolbarConsulta
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Buscar por nome, e-mail, telefone ou responsável..."
                        showFilters={false}
                    />

                    <PatientTable
                        patients={paginatedPatients}
                        loading={loading}
                        onViewProfile={handleViewProfile}
                        sortState={sortState}
                        onSort={handleSort}
                    />

                    {!loading && filteredAndSortedPatients.length > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
                                {Math.min(pagination.page * pagination.pageSize, pagination.total)}{' '}
                                de {pagination.total} resultados
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(Math.max(1, pagination.page - 1))
                                        }
                                        disabled={pagination.page === 1}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Anterior
                                    </Button>

                                    <div className="flex items-center space-x-1">
                                        {visiblePages.map((page) => (
                                            <Button
                                                key={page}
                                                variant={
                                                    page === pagination.page ? 'default' : 'outline'
                                                }
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className="min-w-[40px]"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(
                                                Math.min(totalPages, pagination.page + 1),
                                            )
                                        }
                                        disabled={pagination.page === totalPages}
                                        className="flex items-center gap-2"
                                    >
                                        Próxima
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

            <PatientProfileDrawer
                patient={selectedPatient}
                open={drawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    );
}
