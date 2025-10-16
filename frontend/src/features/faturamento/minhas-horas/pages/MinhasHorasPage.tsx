import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HourEntryFilters } from '../components/HourEntryFilters';
import { HourEntryTable } from '../components/HourEntryTable';
import { hourEntryService } from '../../service/hourEntry.service';
import { fetchClients } from '../../api';
import type { ListHourEntriesQuery, HourEntryDTO } from '../../types/hourEntry.types';
import type { Patient } from '@/features/consultas/types/consultas.types';

export default function MinhasHorasPage() {
    const navigate = useNavigate();

    // Estados de dados
    const [entries, setEntries] = useState<HourEntryDTO[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Estados de filtros e paginação
    const [filters, setFilters] = useState<ListHourEntriesQuery>({});
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Carregar pacientes
    useEffect(() => {
        async function fetchPatients() {
            try {
                const data = await fetchClients();
                setPatients(data);
            } catch (error) {
                console.error('Erro ao carregar pacientes:', error);
                toast.error('Erro ao carregar lista de pacientes');
            }
        }
        fetchPatients();
    }, []);

    // Carregar lançamentos
    const loadEntries = async () => {
        setIsLoading(true);
        try {
            const result = await hourEntryService.listMine({
                ...filters,
                page,
                pageSize,
            });
            setEntries(result.items);
            setTotal(result.total);
            setPage(result.page); // Garantir sincronização
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao carregar lançamentos';
            toast.error(message);
            console.error('Erro ao carregar lançamentos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page]);

    // Opções de pacientes para o filtro
    const patientOptions = patients.map((p) => ({
        value: p.id,
        label: p.nome,
    }));

    // Handler para mudança de filtros
    const handleFilterChange = (newFilters: ListHourEntriesQuery) => {
        setFilters(newFilters);
        setPage(1); // Resetar para primeira página
    };

    // Handler para mudança de página
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calcular páginas para paginação
    const totalPages = Math.ceil(total / pageSize);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const maxVisiblePages = 5;

    let visiblePages = pages;
    if (totalPages > maxVisiblePages) {
        const start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        const end = Math.min(totalPages, start + maxVisiblePages - 1);
        visiblePages = pages.slice(start - 1, end);
    }

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                    <h1
                        className="text-2xl font-semibold text-primary"
                        style={{ fontFamily: 'Sora, sans-serif' }}
                    >
                        Minhas Horas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie seus lançamentos de horas trabalhadas.
                    </p>
                </div>

                <Button
                    onClick={() => navigate('/app/faturamento/registrar-lancamento')}
                    className="gap-2 h-10 rounded-[5px] px-4"
                >
                    <Plus className="h-4 w-4" />
                    Novo Lançamento
                </Button>
            </div>

            {/* Filtros */}
            <Card className="rounded-[5px]">
                <HourEntryFilters
                    onFilterChange={handleFilterChange}
                    patientOptions={patientOptions}
                />
            </Card>

            {/* Tabela */}
            <div className="space-y-4">
                <HourEntryTable entries={entries} isLoading={isLoading} />

                {/* Paginação completa - sempre visível quando há resultados */}
                {!isLoading && entries.length > 0 && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4">
                        <div className="text-sm text-muted-foreground sm:text-left text-center">
                            Mostrando {(page - 1) * pageSize + 1} a{' '}
                            {Math.min(page * pageSize, total)} de {total}{' '}
                            {total === 1 ? 'resultado' : 'resultados'}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Anterior</span>
                                </Button>

                                <div className="flex items-center space-x-1">
                                    {visiblePages.map((pageNum) => (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="min-w-[40px]"
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-2"
                                >
                                    <span className="hidden sm:inline">Próxima</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
