import { useState, useEffect, useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolbarConsulta from '../components/ToolbarConsulta';
import TherapistTable from '../components/TherapistTable';
import TherapistProfileDrawer from '../components/TherapistProfileDrawer';
import type { Therapist, SortState, PaginationState } from '../types/consultas.types';
import { listarTerapeutas } from '@/lib/api';

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

export default function TerapeutasListPage() {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
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
        const loadTherapists = async () => {
            setLoading(true);
            setError(null);
            try {
                const therapistList = await listarTerapeutas();
                setTherapists(therapistList);
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                setError(error instanceof Error ? error.message : 'Erro ao carregar terapeutas');
                setTherapists([]);
            } finally {
                setLoading(false);
            }
        };

        loadTherapists();
    }, []);

    // Filtrar e ordenar dados
    const filteredAndSortedTherapists = useMemo(() => {
        let filtered = therapists;

        // Aplicar filtro de busca
        if (debouncedSearchTerm) {
            const search = debouncedSearchTerm.toLowerCase();
            filtered = therapists.filter(
                (therapist) =>
                    therapist.nome.toLowerCase().includes(search) ||
                    therapist.email?.toLowerCase().includes(search) ||
                    therapist.telefone?.includes(search) ||
                    therapist.registroConselho?.toLowerCase().includes(search) ||
                    therapist.especialidade?.toLowerCase().includes(search),
            );
        }

        // Aplicar ordenação
        filtered.sort((a, b) => {
            const aValue = a[sortState.field as keyof Therapist] as string;
            const bValue = b[sortState.field as keyof Therapist] as string;

            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;

            const comparison = aValue.localeCompare(bValue, 'pt-BR');
            return sortState.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [therapists, debouncedSearchTerm, sortState]);

    // Aplicar paginação
    const paginatedTherapists = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return filteredAndSortedTherapists.slice(startIndex, endIndex);
    }, [filteredAndSortedTherapists, pagination.page, pagination.pageSize]);

    // Atualizar total quando os dados filtrados mudarem
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: filteredAndSortedTherapists.length,
            page: 1, // Reset para primeira página quando filtrar
        }));
    }, [filteredAndSortedTherapists.length]);

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

    const handleViewProfile = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedTherapist(null);
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
        <div className="flex flex-col top-0 left-0 w-full h-full sm:p-6">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl font-semibold text-primary">
                    Consultar Terapeutas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Visualize e gerencie os terapeutas cadastrados no sistema.
                </p>
            </CardHeader>
            <CardContent className="space-y-1 px-0">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <ToolbarConsulta
                            searchValue={searchTerm}
                            onSearchChange={setSearchTerm}
                            placeholder="Buscar por nome, e-mail..."
                            showFilters={false}
                        />
                    </div>
                    <Link to="/app/cadastro/terapeuta">
                        <Button className="h-12 gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar
                        </Button>
                    </Link>
                </div>

                {error && (
                    <p className='text-sm text-red-500'>{error}</p>
                )}

                <TherapistTable
                    therapists={paginatedTherapists}
                    loading={loading}
                    onViewProfile={handleViewProfile}
                    sortState={sortState}
                    onSort={handleSort}
                />

                {!loading && filteredAndSortedTherapists.length > 0 && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground sm:text-left text-center">
                            Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
                            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
                            {pagination.total} resultados
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(Math.max(1, pagination.page - 1))
                                    }
                                    disabled={pagination.page === 1}
                                    className="sm:flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Anterior</span>
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
                                        handlePageChange(Math.min(totalPages, pagination.page + 1))
                                    }
                                    disabled={pagination.page === totalPages}
                                    className="sm:flex items-center gap-2"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="hidden sm:inline">Próxima</span>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <TherapistProfileDrawer
                therapist={selectedTherapist}
                open={drawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    );
}
