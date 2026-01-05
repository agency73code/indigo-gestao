/**
 * Tabela de Atas de Reunião
 * 
 * Features:
 * - Listagem com cards
 * - Filtros por busca, finalidade e data
 * - Skeleton loading
 * - Empty state
 * - Ações: visualizar, editar, deletar, gerar resumo IA
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    FileText,
    Calendar,
    Clock,
    Users,
    Eye,
    Pencil,
    Trash2,
    Sparkles,
    MoreHorizontal,
    Video,
    MapPin,
    Loader2,
    Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import ToolbarConsulta from '@/features/consultas/components/ToolbarConsulta';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    type AtaReuniao,
    type AtaListFilters,
    FINALIDADE_LABELS,
    MODALIDADE_LABELS,
} from '../types';

// Tipo estendido para filtros internos
type InternalFilters = Partial<AtaListFilters> & { 
    dateFrom?: string;
    dateTo?: string;
};

import {
    listAtas,
    deleteAta,
    generateSummary,
} from '../services/atas.service';

import { DateRangePickerField, type DateRangeValue } from '@/ui/date-range-picker-field';

// Opções de ordenação
const SORT_OPTIONS = [
    { value: 'recent', label: 'Mais recente' },
    { value: 'oldest', label: 'Mais antigo' },
];

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
                {hasFilters ? 'Nenhuma ata encontrada' : 'Nenhuma ata registrada'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
                {hasFilters
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece registrando sua primeira ata de reunião.'}
            </p>
            {hasFilters && (
                <Button variant="outline" onClick={onClearFilters}>
                    Limpar filtros
                </Button>
            )}
        </div>
    );
}

// ============================================
// COMPONENTE DE CARD DA ATA
// ============================================

interface AtaCardProps {
    ata: AtaReuniao;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onGenerateSummary: () => void;
}

function AtaCard({ ata, onView, onEdit, onDelete, onGenerateSummary }: AtaCardProps) {
    const dataFormatada = format(parseISO(ata.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    
    const finalidadeLabel = ata.finalidade === 'outros'
        ? ata.finalidadeOutros
        : FINALIDADE_LABELS[ata.finalidade];

    return (
        <Card 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={onView}
            padding="none"
        >
            <CardContent className="px-6 py-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={ata.status === 'finalizada' ? 'default' : 'secondary'}>
                                {ata.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                {ata.modalidade === 'online' ? (
                                    <Video className="h-3 w-3" />
                                ) : (
                                    <MapPin className="h-3 w-3" />
                                )}
                                {MODALIDADE_LABELS[ata.modalidade]}
                            </Badge>
                        </div>

                        {/* Título - Finalidade */}
                        <h3 className="text-base font-normal text-foreground mb-1 truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                            {finalidadeLabel}
                        </h3>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {dataFormatada}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {ata.horario}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {ata.participantes.length} participante{ata.participantes.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Participantes resumo */}
                        {ata.participantes.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium text-foreground">Participantes: </span>
                                {ata.participantes
                                    .slice(0, 3)
                                    .map((p) => p.nome)
                                    .join(', ')}
                                {ata.participantes.length > 3 && ` +${ata.participantes.length - 3} mais`}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Ações</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onView}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizar
                                </DropdownMenuItem>
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onGenerateSummary}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Gerar Resumo com IA
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AtaTable() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Estados
    const [atas, setAtas] = useState<AtaReuniao[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    void total; // Será usado na paginação futura
    const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');

    // Estados dos dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ataToDelete, setAtaToDelete] = useState<AtaReuniao | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [ataForSummary, setAtaForSummary] = useState<AtaReuniao | null>(null);
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState('');

    // Filtros atuais
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const orderBy = (searchParams.get('orderBy') as 'recent' | 'oldest') ?? 'recent';
    
    const filters: AtaListFilters = {
        q: searchParams.get('q') ?? undefined,
        dataInicio: dateFrom,
        dataFim: dateTo,
        orderBy,
        page: Number(searchParams.get('page')) || 1,
        pageSize: 50,
    };

    // Valor do date range picker
    const dateRangeValue: DateRangeValue | undefined = (dateFrom || dateTo) 
        ? { from: dateFrom, to: dateTo } 
        : undefined;

    const hasFilters = !!(filters.q || dateFrom || dateTo || orderBy !== 'recent');

    // ============================================
    // CARREGAR DADOS
    // ============================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listAtas(filters);
            setAtas(response.items);
            setTotal(response.total);
        } catch (error) {
            console.error('Erro ao carregar atas:', error);
            toast.error('Erro ao carregar atas de reunião');
        } finally {
            setLoading(false);
        }
    }, [searchParams.toString()]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================================
    // HANDLERS - FILTROS
    // ============================================

    const updateFilters = useCallback((updates: InternalFilters) => {
        const newParams = new URLSearchParams(searchParams);
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                newParams.set(key, String(value));
            } else if (key === 'orderBy' && value === 'recent') {
                newParams.delete(key); // 'recent' é o default
            } else {
                newParams.delete(key);
            }
        });

        // Reset page when filters change
        if (!updates.page) {
            newParams.delete('page');
        }

        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Handler para mudança do date range picker
    const handleDateRangeChange = useCallback((range: DateRangeValue | undefined) => {
        updateFilters({ 
            dateFrom: range?.from, 
            dateTo: range?.to 
        });
    }, [updateFilters]);

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams());
        setSearchValue('');
    }, [setSearchParams]);

    // Debounce para busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.q ?? '')) {
                updateFilters({ q: searchValue || undefined });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue]);

    // ============================================
    // HANDLERS - AÇÕES
    // ============================================

    const handleView = useCallback((ata: AtaReuniao) => {
        navigate(`/app/atas/${ata.id}`);
    }, [navigate]);

    const handleEdit = useCallback((ata: AtaReuniao) => {
        navigate(`/app/atas/${ata.id}/editar`);
    }, [navigate]);

    const handleDeleteClick = useCallback((ata: AtaReuniao) => {
        setAtaToDelete(ata);
        setDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!ataToDelete) return;

        setDeleting(true);
        try {
            await deleteAta(ataToDelete.id);
            toast.success('Ata excluída com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao excluir ata:', error);
            toast.error('Erro ao excluir ata');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setAtaToDelete(null);
        }
    }, [ataToDelete, loadData]);

    const handleGenerateSummaryClick = useCallback((ata: AtaReuniao) => {
        setAtaForSummary(ata);
        setGeneratedSummary(ata.resumoIA ?? '');
        setSummaryDialogOpen(true);
    }, []);

    const handleGenerateSummary = useCallback(async () => {
        if (!ataForSummary) return;

        setGeneratingSummary(true);
        try {
            const summary = await generateSummary(ataForSummary.id);
            setGeneratedSummary(summary);
            toast.success('Resumo gerado com sucesso!');
            // Atualizar a lista para refletir o novo resumo
            loadData();
        } catch (error) {
            console.error('Erro ao gerar resumo:', error);
            toast.error('Erro ao gerar resumo');
        } finally {
            setGeneratingSummary(false);
        }
    }, [ataForSummary, loadData]);

    // ============================================
    // RENDERIZAÇÃO
    // ============================================

    return (
        <div className="space-y-4">
            {/* Linha com Busca à esquerda, Filtros e Botão à direita */}
            <div className="flex items-center justify-between gap-4">
                {/* Busca - lado esquerdo */}
                <div className="flex-1 max-w-[400px]">
                    <ToolbarConsulta
                        searchValue={searchValue}
                        onSearchChange={(value) => setSearchValue(value)}
                        placeholder="Buscar por cliente, participante..."
                        showFilters={false}
                    />
                </div>

                {/* Filtros e Botão - lado direito */}
                <div className="flex items-center gap-3">
                    {/* Filtro de Período (Date Range Picker) */}
                    <DateRangePickerField
                        value={dateRangeValue}
                        onChange={handleDateRangeChange}
                        placeholder="Período"
                        triggerClassName="w-[260px]"
                        showClear={true}
                    />

                    {/* Filtro de Ordenação */}
                    <Select
                        value={orderBy}
                        onValueChange={(value) => updateFilters({ orderBy: value as 'recent' | 'oldest' })}
                    >
                        <SelectTrigger className="w-[140px]" aria-label="Ordenar por">
                            <SelectValue placeholder="Ordenar" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Botão Nova Ata */}
                    <Button
                        onClick={() => navigate('/app/atas/nova')}
                        className="gap-2"
                        variant="default"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Ata
                    </Button>
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <LoadingSkeleton />
            ) : atas.length === 0 ? (
                <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {atas.map((ata) => (
                        <AtaCard
                            key={ata.id}
                            ata={ata}
                            onView={() => handleView(ata)}
                            onEdit={() => handleEdit(ata)}
                            onDelete={() => handleDeleteClick(ata)}
                            onGenerateSummary={() => handleGenerateSummaryClick(ata)}
                        />
                    ))}
                </div>
            )}

            {/* Dialog de confirmação de exclusão */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir ata de reunião</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta ata? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de resumo IA */}
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Resumo com IA
                        </DialogTitle>
                        <DialogDescription>
                            Gere um resumo automático dos principais pontos discutidos na reunião.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {generatedSummary ? (
                            <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                                {generatedSummary}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p>Clique no botão abaixo para gerar um resumo automático.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>
                            Fechar
                        </Button>
                        <Button onClick={handleGenerateSummary} disabled={generatingSummary}>
                            {generatingSummary ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {generatedSummary ? 'Gerar Novamente' : 'Gerar Resumo'}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AtaTable;
