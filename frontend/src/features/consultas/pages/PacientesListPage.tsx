import { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ToolbarConsulta from '../components/ToolbarConsulta';
import PatientTable, { type ColumnFilters, type ColumnFilterOptions } from '../components/PatientTable';
import { listPatients } from '../services/patient.service';
import { getAllLinks } from '@/features/cadastros/links/services/links.service';
import type { Patient, SortState, PaginationState } from '../types/consultas.types';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import type { FilterOption } from '@/components/ui/column-header-filter';

// Lazy load do Drawer (só carrega quando necessário)
const PatientProfileDrawer = lazy(() => import('../components/PatientProfileDrawer'));

export default function PacientesListPage() {
    // ✅ Definir título da página
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    
    useEffect(() => {
        setPageTitle('Clientes');
        setNoMainContainer(true); // Desativa o container branco do AppLayout
        
        return () => {
            setNoMainContainer(false); // Restaura ao sair da página
        };
    }, [setPageTitle, setNoMainContainer]);
    
    // ✅ NOVO: URL como source of truth para filtros
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Estados para dados
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
    const idadeFilter = searchParams.get('idade') || undefined;
    
    // Parsear sort (formato: "campo_direção")
    const [sortField, sortDirection] = sortParam.split('_') as [string, 'asc' | 'desc'];
    const sortState: SortState = {
        field: sortField,
        direction: sortDirection,
    };

    // Estado para armazenar TODOS os dados (para filtragem local)
    const [allPatients, setAllPatients] = useState<Patient[]>([]);

    // ✅ NOVO: Carregar dados quando URL mudar
    useEffect(() => {
        const loadPatients = async () => {
            setLoading(true);
            setError(null);
            try {
                // Buscar TODOS os clientes (pageSize alto para cache local)
                const [response, links] = await Promise.all([
                    listPatients({
                        q: searchTerm || undefined,
                        page: 1,
                        pageSize: 9999, // Busca todos para filtrar localmente
                        sort: sortParam,
                    }),
                    // Buscar todos os vínculos ativos para obter as áreas de atendimento
                    getAllLinks({ status: 'active', viewBy: 'patient' }).catch(() => [])
                ]);

                // Criar mapa de áreas por cliente
                const areasMap = new Map<string, Set<string>>();
                for (const link of links) {
                    if (link.patientId && link.actuationArea) {
                        if (!areasMap.has(link.patientId)) {
                            areasMap.set(link.patientId, new Set());
                        }
                        areasMap.get(link.patientId)!.add(link.actuationArea);
                    }
                }

                // Merge: adicionar áreas de atendimento aos pacientes
                const patientsWithAreas = response.items.map(patient => ({
                    ...patient,
                    areasAtendimento: areasMap.has(patient.id) 
                        ? Array.from(areasMap.get(patient.id)!) 
                        : []
                }));

                // Armazenar TODOS os dados para filtragem local
                setAllPatients(patientsWithAreas);
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                setError(error instanceof Error ? error.message : 'Erro ao carregar clientes');
                setAllPatients([]);
            } finally {
                setLoading(false);
            }
        };

        loadPatients();
    }, [searchTerm, sortParam]); // Recarrega quando busca ou ordenação muda

    // ✅ Calcular idade helper
    const calculateAge = useCallback((birthDate: string | null | undefined): number | null => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }, []);

    // ✅ Aplicar filtros de coluna LOCALMENTE
    const filteredPatients = useMemo(() => {
        let result = allPatients;

        // Filtro por status
        if (statusFilter) {
            result = result.filter(p => p.status === statusFilter);
        }

        // Filtro por especialidade/área de atendimento
        if (especialidadeFilter) {
            result = result.filter(p => 
                p.areasAtendimento?.includes(especialidadeFilter)
            );
        }

        // Filtro por faixa de idade
        if (idadeFilter) {
            const [minStr, maxStr] = idadeFilter.split('-');
            const min = parseInt(minStr);
            const max = maxStr === '+' ? 200 : parseInt(maxStr);
            
            result = result.filter(p => {
                const age = calculateAge(p.pessoa?.dataNascimento);
                if (age === null) return false;
                return age >= min && age <= max;
            });
        }

        return result;
    }, [allPatients, statusFilter, especialidadeFilter, idadeFilter, calculateAge]);

    // ✅ Paginar os resultados filtrados
    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * pagination.pageSize;
        return filteredPatients.slice(startIndex, startIndex + pagination.pageSize);
    }, [filteredPatients, currentPage, pagination.pageSize]);

    // ✅ Atualizar dados exibidos e paginação
    useEffect(() => {
        setPatients(paginatedPatients);
        setPagination(prev => ({
            ...prev,
            total: filteredPatients.length,
            page: currentPage,
        }));
    }, [paginatedPatients, filteredPatients.length, currentPage]);

    // ✅ Gerar opções de filtros baseadas nos dados
    const statusOptions = useMemo((): FilterOption[] => {
        const countMap = new Map<string, number>();
        for (const patient of allPatients) {
            const status = patient.status || 'ATIVO';
            countMap.set(status, (countMap.get(status) || 0) + 1);
        }
        return Array.from(countMap.entries())
            .map(([value, count]) => ({ 
                value, 
                label: value === 'ATIVO' ? 'Ativo' : 'Inativo', 
                count 
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allPatients]);

    const especialidadeOptions = useMemo((): FilterOption[] => {
        const countMap = new Map<string, number>();
        for (const patient of allPatients) {
            for (const area of patient.areasAtendimento || []) {
                countMap.set(area, (countMap.get(area) || 0) + 1);
            }
        }
        return Array.from(countMap.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [allPatients]);

    const idadeOptions = useMemo((): FilterOption[] => {
        const ranges = [
            { value: '0-5', label: '0-5 anos', min: 0, max: 5 },
            { value: '6-12', label: '6-12 anos', min: 6, max: 12 },
            { value: '13-17', label: '13-17 anos', min: 13, max: 17 },
            { value: '18-+', label: '18+ anos', min: 18, max: 200 },
        ];
        
        const countMap = new Map<string, number>();
        for (const patient of allPatients) {
            const age = calculateAge(patient.pessoa?.dataNascimento);
            if (age === null) continue;
            const range = ranges.find(r => age >= r.min && age <= r.max);
            if (range) {
                countMap.set(range.value, (countMap.get(range.value) || 0) + 1);
            }
        }

        return ranges
            .filter(r => countMap.has(r.value))
            .map(r => ({ value: r.value, label: r.label, count: countMap.get(r.value) }));
    }, [allPatients, calculateAge]);

    // ✅ Opções de filtros para a tabela
    const filterOptions: ColumnFilterOptions = useMemo(() => ({
        status: statusOptions,
        especialidade: especialidadeOptions,
        idade: idadeOptions,
    }), [statusOptions, especialidadeOptions, idadeOptions]);

    // ✅ Valores ativos dos filtros
    const columnFiltersValues: ColumnFilters = useMemo(() => ({
        status: statusFilter,
        especialidade: especialidadeFilter,
        idade: idadeFilter,
    }), [statusFilter, especialidadeFilter, idadeFilter]);

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

    const handleViewProfile = useCallback((patient: Patient) => {
        setSelectedPatient(patient);
        setDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        setSelectedPatient(null);
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
                            placeholder="Buscar por nome, telefone ou responsável..."
                            showFilters={false}
                        />
                    </div>
                    
                    {/* Botão Adicionar à direita */}
                    <div className="flex items-center">
                        <Link to="/app/cadastro/cliente">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Adicionar
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Container da tabela */}
            <div className="flex-1 overflow-hidden rounded-lg">
                <div className="h-full flex flex-col">
                    <PatientTable
                        patients={patients}
                        loading={loading}
                        onViewProfile={handleViewProfile}
                        sortState={sortState}
                        onSort={handleSort}
                        columnFilters={columnFiltersValues}
                        filterOptions={filterOptions}
                        onFilterChange={handleColumnFilterChange}
                        totalCount={allPatients.length}
                    />

                    {!loading && error && (
                        <div className='text-sm text-red-600 text-center py-4'>{error}</div>
                    )}
                </div>
            </div>

            
            {/* Footer com paginação - caixa separada */}
            {!loading && pagination.total > 0 && (
                <div className="flex-none mt-2">
                    <div className="rounded-[40px] px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--header-bg)' }}>
                        {/* Contador de registros */}
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" style={{ color: 'var(--table-text-secondary)' }} />
                            <span className="text-sm" style={{ color: 'var(--table-text)' }}>
                                <span className="font-normal">{patients.length}</span>
                                <span className="text-muted-foreground mx-1">de</span>
                                <span className="font-normal">{allPatients.length}</span>
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
                    <PatientProfileDrawer
                        patient={selectedPatient}
                        open={drawerOpen}
                        onClose={handleCloseDrawer}
                    />
                </Suspense>
            )}
        </div>
        
    );
}
