import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ToolbarConsulta from '@/features/consultas/components/ToolbarConsulta';
import AnamneseTable from '../components/AnamneseTable';
import { listAnamneses } from '../services/anamnese-table.service';
import type { AnamneseListItem, SortState, PaginationState } from '../types/anamnese-table.types';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

// Lazy load do Drawer (só carrega quando necessário)
const AnamneseProfileDrawer = lazy(() => import('../../Consulta/components/AnamneseProfileDrawer'));

export default function AnamneseListPage() {
    // ✅ Definir título da página
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    
    useEffect(() => {
        setPageTitle('Anamnese');
        setNoMainContainer(true); // Desativa o container branco do AppLayout
        
        return () => {
            setNoMainContainer(false); // Restaura ao sair da página
        };
    }, [setPageTitle, setNoMainContainer]);
    
    // ✅ URL como source of truth para filtros
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Estados para dados
    const [anamneses, setAnamneses] = useState<AnamneseListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnamnese, setSelectedAnamnese] = useState<AnamneseListItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // ✅ Estados para paginação (vem do backend agora)
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    // ✅ Ler filtros da URL
    const searchTerm = searchParams.get('q') || '';
    const currentPage = Number(searchParams.get('page')) || 1;
    const sortParam = searchParams.get('sort') || 'clienteNome_asc';
    
    // Parsear sort (formato: "campo_direção")
    const [sortField, sortDirection] = sortParam.split('_') as [string, 'asc' | 'desc'];
    const sortState: SortState = {
        field: sortField,
        direction: sortDirection,
    };

    // ✅ Carregar dados quando URL mudar
    useEffect(() => {
        const loadAnamneses = async () => {
            setLoading(true);
            setError(null);
            try {
                // Chamar API com filtros da URL
                const response = await listAnamneses({
                    q: searchTerm || undefined,
                    page: currentPage,
                    pageSize: pagination.pageSize,
                    sort: sortParam,
                });

                // Atualizar estado com dados do backend
                setAnamneses(response.items);
                setPagination({
                    page: response.page,
                    pageSize: response.pageSize,
                    total: response.total,
                });
            } catch (error) {
                console.error('Erro ao carregar anamneses:', error);
                setError(error instanceof Error ? error.message : 'Erro ao carregar anamneses');
                setAnamneses([]);
            } finally {
                setLoading(false);
            }
        };

        loadAnamneses();
    }, [searchParams]); // ✅ Reage a mudanças na URL

    // ✅ Atualizar URL quando buscar
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

    // ✅ Atualizar URL quando ordenar
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

    // ✅ Atualizar URL quando mudar página
    const handlePageChange = useCallback((page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleViewProfile = useCallback((anamnese: AnamneseListItem) => {
        setSelectedAnamnese(anamnese);
        setDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        setSelectedAnamnese(null);
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
        <div className="flex flex-col h-full overflow-hidden p-1">
            {/* Header com busca e botão */}
            <div className="flex-none pb-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Barra de busca à esquerda */}
                    <div className="flex-1 max-w-[480px] flex items-center">
                        <ToolbarConsulta
                            searchValue={searchTerm}
                            onSearchChange={handleSearchChange}
                            placeholder="Buscar por cliente ou responsável..."
                            showFilters={false}
                        />
                    </div>
                    
                    {/* Botão Adicionar à direita */}
                    <div className="flex items-center">
                        <Link to="/app/anamnese/cadastro">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Adicionar
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Container da tabela */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                    <AnamneseTable
                        anamneses={anamneses}
                        loading={loading}
                        onViewProfile={handleViewProfile}
                        sortState={sortState}
                        onSort={handleSort}
                    />

                    {!loading && error && (
                        <div className='text-sm text-red-600 text-center py-4'>{error}</div>
                    )}
                </div>
            </div>

            
            {/* Footer com paginação - caixa separada */}
            {!loading && pagination.total > 0 && (
                <div className="flex-none mt-2">
                    <div className="rounded-[40px] px-2 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--header-bg)' }}>
                        {/* Dropdown de itens por página */}
                        <div className="flex items-center gap-2">
                            
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                {/* Botão anterior */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handlePageChange(Math.max(1, currentPage - 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                {/* Primeira página */}
                                {visiblePages[0] > 1 && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePageChange(1)}
                                            className="h-8 min-w-8 px-2 rounded-lg"
                                            style={{ color: 'var(--table-text)' }}
                                        >
                                            1
                                        </Button>
                                        {visiblePages[0] > 2 && (
                                            <span className="px-2" style={{ color: 'var(--table-text-secondary)' }}>...</span>
                                        )}
                                    </>
                                )}

                                {/* Páginas visíveis */}
                                {visiblePages.map((page) => (
                                    <Button
                                        key={page}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                        className={`h-8 min-w-8 px-2 rounded-lg ${
                                            page === currentPage 
                                                ? 'font-medium' 
                                                : ''
                                        }`}
                                        style={{ 
                                            color: 'var(--table-text)',
                                            backgroundColor: page === currentPage ? 'var(--table-badge-bg)' : 'transparent'
                                        }}
                                    >
                                        {page}
                                    </Button>
                                ))}

                                {/* Última página */}
                                {visiblePages[visiblePages.length - 1] < totalPages && (
                                    <>
                                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                                            <span className="px-2" style={{ color: 'var(--table-text-secondary)' }}>...</span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePageChange(totalPages)}
                                            className="h-8 min-w-8 px-2 rounded-lg"
                                            style={{ color: 'var(--table-text)' }}
                                        >
                                            {totalPages}
                                        </Button>
                                    </>
                                )}

                                {/* Botão próximo */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        handlePageChange(Math.min(totalPages, currentPage + 1))
                                    }
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Ícones de visualização */}
                        <div className="flex items-center gap-1">
                           
                        </div>
                    </div>
                </div>
            )}

            {/* Lazy load do Drawer com Suspense */}
            {drawerOpen && (
                <Suspense fallback={null}>
                    <AnamneseProfileDrawer
                        anamnese={selectedAnamnese}
                        open={drawerOpen}
                        onClose={handleCloseDrawer}
                    />
                </Suspense>
            )}
        </div>
    );
}
