import { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight, Plus, Link as LinkIcon, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ToolbarConsulta from '../components/ToolbarConsulta';
import TherapistTable, { type TherapistColumnFilters, type TherapistColumnFilterOptions } from '../components/TherapistTable';
import type { Therapist, SortState, PaginationState } from '../types/consultas.types';
import { listTherapists } from '../services/therapist.service';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useAbility } from '@/features/auth/abilities/useAbility';
import type { FilterOption } from '@/components/ui/column-header-filter';

// Lazy load do Drawer (só carrega quando necessário)
const TherapistProfileDrawer = lazy(() => import('../components/TherapistProfileDrawer'));

export default function TerapeutasListPage() {
    // ✅ Definir título da página
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    const ability = useAbility();
    const canReadLinks = ability.can('read', 'Vinculos');
    const canManageAll = ability.can('manage', 'all');
    
    useEffect(() => {
        setPageTitle('Terapeutas');
        setNoMainContainer(true); // Desativa o container branco do AppLayout
        
        return () => {
            setNoMainContainer(false); // Restaura ao sair da página
        };
    }, [setPageTitle, setNoMainContainer]);
    
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
    
    // Filtros de coluna da URL
    const statusFilter = searchParams.get('status') || undefined;
    const especialidadeFilter = searchParams.get('especialidade') || undefined;
    const cargoFilter = searchParams.get('cargo') || undefined;
    
    // Parsear sort (formato: "campo_direção")
    const [sortField, sortDirection] = sortParam.split('_') as [string, 'asc' | 'desc'];
    const sortState: SortState = {
        field: sortField,
        direction: sortDirection,
    };

    // Estado para armazenar TODOS os dados (para filtragem local)
    const [allTherapists, setAllTherapists] = useState<Therapist[]>([]);

    // ✅ NOVO: Carregar dados quando URL mudar
    useEffect(() => {
        const loadTherapists = async () => {
            setLoading(true);
            setError(null);
            try {
                // Buscar TODOS os terapeutas (pageSize alto para cache local)
                const response = await listTherapists({
                    q: searchTerm || undefined,
                    page: 1,
                    pageSize: 9999, // Busca todos para filtrar localmente
                    sort: sortParam,
                });

                // Armazenar TODOS os dados para filtragem local
                setAllTherapists(response.items);
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                setError(error instanceof Error ? error.message : 'Erro ao carregar terapeutas');
                setAllTherapists([]);
            } finally {
                setLoading(false);
            }
        };

        loadTherapists();
    }, [searchTerm, sortParam]); // Recarrega quando busca ou ordenação muda

    // ✅ Aplicar filtros de coluna LOCALMENTE
    const filteredTherapists = useMemo(() => {
        let result = allTherapists;

        // Filtro por status
        if (statusFilter) {
            result = result.filter(t => t.status === statusFilter);
        }

        // Filtro por especialidade
        if (especialidadeFilter) {
            result = result.filter(t => 
                t.especialidade === especialidadeFilter ||
                t.profissional?.especialidades?.includes(especialidadeFilter)
            );
        }

        // Filtro por cargo
        if (cargoFilter) {
            result = result.filter(t => t.cargo === cargoFilter);
        }

        return result;
    }, [allTherapists, statusFilter, especialidadeFilter, cargoFilter]);

    // ✅ Paginar os resultados filtrados
    const paginatedTherapists = useMemo(() => {
        const startIndex = (currentPage - 1) * pagination.pageSize;
        return filteredTherapists.slice(startIndex, startIndex + pagination.pageSize);
    }, [filteredTherapists, currentPage, pagination.pageSize]);

    // ✅ Atualizar dados exibidos e paginação
    useEffect(() => {
        setTherapists(paginatedTherapists);
        setPagination(prev => ({
            ...prev,
            total: filteredTherapists.length,
            page: currentPage,
        }));
    }, [paginatedTherapists, filteredTherapists.length, currentPage]);

    // ✅ Gerar opções de filtros baseadas nos dados
    const statusOptions = useMemo((): FilterOption[] => {
        const countMap = new Map<string, number>();
        for (const therapist of allTherapists) {
            const status = therapist.status || 'ATIVO';
            countMap.set(status, (countMap.get(status) || 0) + 1);
        }
        return Array.from(countMap.entries())
            .map(([value, count]) => ({ 
                value, 
                label: value === 'ATIVO' ? 'Ativo' : 'Inativo', 
                count 
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allTherapists]);

    const especialidadeOptions = useMemo((): FilterOption[] => {
        const countMap = new Map<string, number>();
        for (const therapist of allTherapists) {
            // Especialidade principal
            if (therapist.especialidade) {
                countMap.set(therapist.especialidade, (countMap.get(therapist.especialidade) || 0) + 1);
            }
            // Especialidades adicionais
            for (const esp of therapist.profissional?.especialidades || []) {
                if (esp !== therapist.especialidade) {
                    countMap.set(esp, (countMap.get(esp) || 0) + 1);
                }
            }
        }
        return Array.from(countMap.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allTherapists]);

    const cargoOptions = useMemo((): FilterOption[] => {
        const countMap = new Map<string, number>();
        for (const therapist of allTherapists) {
            if (therapist.cargo) {
                countMap.set(therapist.cargo, (countMap.get(therapist.cargo) || 0) + 1);
            }
        }
        return Array.from(countMap.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allTherapists]);

    // ✅ Opções de filtros para a tabela
    const filterOptions: TherapistColumnFilterOptions = useMemo(() => ({
        status: statusOptions,
        especialidade: especialidadeOptions,
        cargo: cargoOptions,
    }), [statusOptions, especialidadeOptions, cargoOptions]);

    // ✅ Valores ativos dos filtros
    const columnFiltersValues: TherapistColumnFilters = useMemo(() => ({
        status: statusFilter,
        especialidade: especialidadeFilter,
        cargo: cargoFilter,
    }), [statusFilter, especialidadeFilter, cargoFilter]);

    // ✅ Handler para mudança de filtros de coluna
    const handleColumnFilterChange = useCallback((key: string, value: string | undefined) => {
        const newParams = new URLSearchParams(searchParams);
        
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        
        // Reset para página 1 ao filtrar
        newParams.set('page', '1');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

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
        <div className="flex flex-col h-full overflow-hidden p-1">
            {/* Header com busca e botões */}
            <div className="flex-none pb-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Barra de busca à esquerda */}
                    <div className="flex-1 max-w-[480px] flex items-center">
                        <ToolbarConsulta
                            searchValue={searchTerm}
                            onSearchChange={handleSearchChange}
                            placeholder="Buscar por nome, cargo ou telefone..."
                            showFilters={false}
                        />
                    </div>
                    
                    {/* Botões à direita */}
                    <div className="flex items-center gap-2">
                        {canReadLinks && (
                            <Link to="/app/cadastros/vinculos">
                                <Button variant="outline" className="gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Vincular
                                </Button>
                            </Link>
                        )}
                        {canManageAll && (
                            <Link to="/app/cadastro/terapeuta">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Adicionar
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Container da tabela */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                    <TherapistTable
                        therapists={therapists}
                        loading={loading}
                        onViewProfile={handleViewProfile}
                        sortState={sortState}
                        onSort={handleSort}
                        columnFilters={columnFiltersValues}
                        filterOptions={filterOptions}
                        onFilterChange={handleColumnFilterChange}
                    />

                    {!loading && error && (
                        <div className='text-sm text-red-600 text-center py-4'>{error}</div>
                    )}
                </div>
            </div>

            
            {/* Footer com paginação - caixa separada */}
            {!loading && pagination.total > 0 && (
                <div className="flex-none">
                    <div className="rounded-[40px] px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--table-border)' }}>
                        {/* Contador de resultados */}
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color: 'var(--table-text-secondary)' }} />
                            <span className="text-sm" style={{ color: 'var(--table-text)' }}>
                                <span className="font-normal">{therapists.length}</span>
                                <span className="text-muted-foreground mx-1">de</span>
                                <span className="font-normal">{allTherapists.length}</span>
                            </span>
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
