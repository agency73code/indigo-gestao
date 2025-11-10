import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ToolbarConsulta from '../components/ToolbarConsulta';
import TherapistTable from '../components/TherapistTable';
import type { Therapist, SortState, PaginationState } from '../types/consultas.types';
import { listTherapists } from '../services/therapist.service';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

// Lazy load do Drawer (só carrega quando necessário)
const TherapistProfileDrawer = lazy(() => import('../components/TherapistProfileDrawer'));

export default function TerapeutasListPage() {
    // ✅ Definir título da página
    const { setPageTitle } = usePageTitle();
    
    useEffect(() => {
        setPageTitle('Consultar Terapeutas');
    }, [setPageTitle]);
    
    // ✅ NOVO: URL como source of truth para filtros
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Estados para dados
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // ✅ NOVO: Estados para paginação (vem do backend agora)
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    // ✅ NOVO: Ler filtros da URL
    const searchTerm = searchParams.get('q') || '';
    const currentPage = Number(searchParams.get('page')) || 1;
    const sortParam = searchParams.get('sort') || 'nome_asc';
    
    // Parsear sort (formato: "campo_direção")
    const [sortField, sortDirection] = sortParam.split('_') as [string, 'asc' | 'desc'];
    const sortState: SortState = {
        field: sortField,
        direction: sortDirection,
    };

    // ✅ NOVO: Carregar dados quando URL mudar
    useEffect(() => {
        const loadTherapists = async () => {
            setLoading(true);
            setError(null);
            try {
                // Chamar API com filtros da URL
                const response = await listTherapists({
                    q: searchTerm || undefined,
                    page: currentPage,
                    pageSize: pagination.pageSize,
                    sort: sortParam,
                });

                // Atualizar estado com dados do backend
                setTherapists(response.items);
                setPagination({
                    page: response.page,
                    pageSize: response.pageSize,
                    total: response.total,
                });
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                setError(error instanceof Error ? error.message : 'Erro ao carregar terapeutas');
                setTherapists([]);
            } finally {
                setLoading(false);
            }
        };

        loadTherapists();
    }, [searchParams]); // ✅ Reage a mudanças na URL

    // ✅ NOVO: Atualizar URL quando buscar
    const handleSearchChange = useCallback((value: string) => {
        const newParams = new URLSearchParams(searchParams);
        
        if (value) {
            newParams.set('q', value);
        } else {
            newParams.delete('q');
        }
        
        // Reset para página 1 ao buscar
        newParams.set('page', '1');
        
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // ✅ NOVO: Atualizar URL quando ordenar
    const handleSort = useCallback((field: string) => {
        const newParams = new URLSearchParams(searchParams);
        
        // Toggle direção se for o mesmo campo
        const newDirection = 
            sortState.field === field && sortState.direction === 'asc' 
                ? 'desc' 
                : 'asc';
        
        newParams.set('sort', `${field}_${newDirection}`);
        newParams.set('page', '1'); // Reset para página 1
        
        setSearchParams(newParams);
    }, [searchParams, setSearchParams, sortState]);

    // ✅ NOVO: Atualizar URL quando mudar página
    const handlePageChange = useCallback((page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleViewProfile = useCallback((therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        setSelectedTherapist(null);
    }, []);

    // Calcular páginas para paginação
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const maxVisiblePages = 5;

    let visiblePages = pages;
    if (totalPages > maxVisiblePages) {
        const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const end = Math.min(totalPages, start + maxVisiblePages - 1);
        visiblePages = pages.slice(start - 1, end);
    }

    return (
        <div className="flex flex-col top-0 left-0 w-full h-full">
            <CardContent className="space-y-1 px-4 pt-4 pb-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <ToolbarConsulta
                            searchValue={searchTerm}
                            onSearchChange={handleSearchChange}
                            placeholder="Buscar por nome, e-mail..."
                            showFilters={false}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Link to="/app/cadastro/terapeuta">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Adicionar
                            </Button>
                        </Link>
                    </div>
                </div>

                {error && (
                    <p className='text-sm text-red-500'>{error}</p>
                )}

                <div className="">
                    <TherapistTable
                        therapists={therapists}
                        loading={loading}
                        onViewProfile={handleViewProfile}
                        sortState={sortState}
                        onSort={handleSort}
                    />
                </div>

                {!loading && pagination.total > 0 && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
                        <div className="text-sm text-muted-foreground sm:text-left text-center">
                            Mostrando {(currentPage - 1) * pagination.pageSize + 1} a{' '}
                            {Math.min(currentPage * pagination.pageSize, pagination.total)} de{' '}
                            {pagination.total} resultados
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(Math.max(1, currentPage - 1))
                                    }
                                    disabled={currentPage === 1}
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
                                                page === currentPage ? 'default' : 'outline'
                                            }
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className="min-w-10"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(Math.min(totalPages, currentPage + 1))
                                    }
                                    disabled={currentPage === totalPages}
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

            {/* Lazy load do Drawer com Suspense */}
            {drawerOpen && (
                <Suspense fallback={null}>
                    <TherapistProfileDrawer
                        therapist={selectedTherapist}
                        open={drawerOpen}
                        onClose={handleCloseDrawer}
                    />
                </Suspense>
            )}
        </div>
    );
}
