import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    Video,
    MapPin,
    Loader2,
    Plus,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    LayoutList,
    CheckCircle2,
    FileEdit,
    MessageCircle,
    Copy,
    Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/layout/CloseButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { FiltersPopover } from '@/components/ui/filters-popover';
import type { DateRangeValue } from '@/ui/date-range-picker-field';

import {
    type AtaReuniao,
    type AtaListFilters,
    type TerapeutaOption,
    FINALIDADE_LABELS,
    MODALIDADE_LABELS,
    TIPO_PARTICIPANTE_LABELS,
} from '../types';

import {
    listAtas,
    listTerapeutas,
    deleteAta,
    generateSummary,
    generateWhatsAppSummary,
} from '../services/atas.service';

import { cn } from '@/lib/utils';
import { calcularTotaisHoras, formatarHorasFaturadas, calcularDuracaoMinutos } from '../utils/calcularHorasFaturadas';
import { formatYmdToPtBr } from '@/lib/api';

// Tipo estendido para filtros internos
type InternalFilters = Partial<AtaListFilters> & { 
    dateFrom?: string;
    dateTo?: string;
    terapeutaId?: string;
};

function getDuracaoMinutos(ata: AtaReuniao): number {
    return ata.duracaoMinutos ?? calcularDuracaoMinutos(ata.horarioInicio, ata.horarioFim);
}

function formatarHoras(minutosTotais: number): string {
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;
    
    if (horas === 0) {
        return `${minutos}min`;
    }
    if (minutos === 0) {
        return `${horas}h`;
    }
    return `${horas}h ${minutos}min`;
}

// ============================================
// COMPONENTES DE ESTATÍSTICAS - LAYOUT PROFISSIONAL
// ============================================

interface StatsCardPrimaryProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    isActive?: boolean;
    onClick?: () => void;
}

/** Card primário destacado (fundo escuro) */
function StatsCardPrimary({ icon, label, value, isActive, onClick }: StatsCardPrimaryProps) {
    return (
        <div 
            className={cn(
                "bg-primary rounded-xl p-5 cursor-pointer transition-all hover:bg-primary/90",
                isActive && "ring-2 ring-primary-foreground ring-offset-2 ring-offset-background"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-primary-foreground/10 rounded-lg text-primary-foreground">
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-xs text-primary-foreground/70 mb-1">{label}</p>
                <p className="text-2xl font-normal text-primary-foreground">{value}</p>
            </div>
        </div>
    );
}

interface StatsCardSecondaryProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    badge?: {
        value: string;
        variant: 'success' | 'warning' | 'default';
    };
    isActive?: boolean;
    onClick?: () => void;
}

/** Card secundário (fundo claro) com ícone */
function StatsCardSecondary({ icon, label, value, badge, isActive, onClick }: StatsCardSecondaryProps) {
    return (
        <div 
            className={cn(
                "bg-card border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/20",
                isActive && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                    {icon}
                </div>
                <span className="text-muted-foreground">•••</span>
            </div>
            <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-3">
                    <p className="text-2xl font-normal">{value}</p>
                    {badge && (
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            badge.variant === 'success' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                            badge.variant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            badge.variant === 'default' && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                        )}>
                            {badge.value}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// SKELETON LOADING
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-normal mb-2">
                {hasFilters ? 'Nenhuma ata encontrada' : 'Nenhuma ata registrada'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {hasFilters
                    ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                    : 'Comece registrando sua primeira ata de reunião para organizar suas documentações.'}
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
// PAINEL DE DETALHES
// ============================================

interface DetailPanelProps {
    ata: AtaReuniao | null;
    open: boolean;
    onClose: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onGenerateSummary: () => void;
    currentIndex: number;
    totalCount: number;
    onPrevious: () => void;
    onNext: () => void;
}

function DetailPanel({ 
    ata, 
    open, 
    onClose, 
    onView, 
    onEdit, 
    onDelete, 
    onGenerateSummary,
    currentIndex,
    totalCount,
    onPrevious,
    onNext,
}: DetailPanelProps) {
    if (!ata) return null;

    const dataFormatada = formatYmdToPtBr(ata.data);
    
    const finalidadeLabel = ata.finalidade === 'outros'
        ? ata.finalidadeOutros
        : FINALIDADE_LABELS[ata.finalidade];

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                {/* Header com navegação */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={onPrevious} disabled={currentIndex === 0}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNext} disabled={currentIndex === totalCount - 1}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {String(currentIndex + 1).padStart(2, '0')} de {String(totalCount).padStart(2, '0')}
                        </span>
                    </div>
                    <CloseButton onClick={onClose} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 pt-2 space-y-6">
                        {/* Título e Status */}
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-xl leading-tight font-sora font-light">
                                {finalidadeLabel}
                            </h2>
                            <Badge 
                                variant={ata.status === 'finalizada' ? 'default' : 'secondary'}
                                className="shrink-0"
                            >
                                {ata.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
                            </Badge>
                        </div>

                        {/* Informações Principais - Grid de propriedades */}
                        <div className="space-y-5">
                            <DetailRow 
                                icon={<Users className="h-4 w-4" />} 
                                label="Responsável"
                                value={ata.cabecalho.terapeutaNome}
                                subtitle={[
                                    ata.cabecalho.profissao,
                                    ata.cabecalho.conselhoNumero && `${ata.cabecalho.conselhoTipo || 'CRP'} ${ata.cabecalho.conselhoNumero}`
                                ].filter(Boolean).join(' • ') || undefined}
                            />
                            <DetailRow 
                                icon={<Calendar className="h-4 w-4" />} 
                                label="Data"
                                value={dataFormatada}
                            />
                            <DetailRow 
                                icon={<Clock className="h-4 w-4" />} 
                                label="Horário"
                                value={`${ata.horarioInicio} - ${ata.horarioFim}`}
                            />
                            <DetailRow 
                                icon={ata.modalidade === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />} 
                                label="Modalidade"
                                value={MODALIDADE_LABELS[ata.modalidade]}
                            />
                            {ata.clienteNome && (
                                <DetailRow 
                                    icon={<FileText className="h-4 w-4" />} 
                                    label="Paciente"
                                    value={ata.clienteNome}
                                />
                            )}
                        </div>

                        <Separator />

                        {/* Participantes */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center justify-center w-5 h-5 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-medium">Participantes</h3>
                                <span className="ml-auto flex items-center justify-center w-6 h-6 text-xs font-medium border rounded-md bg-background">
                                    {ata.participantes.length}
                                </span>
                            </div>
                            <div className="space-y-2 pl-[28px]">
                                {ata.participantes.map((p) => (
                                    <div 
                                        key={p.id ?? p.localId}
                                        className="py-2.5 border-b border-border/50 last:border-b-0"
                                    >
                                        <p className="text-sm font-medium leading-tight">{p.nome}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {TIPO_PARTICIPANTE_LABELS[p.tipo]}
                                            {p.descricao && ` • ${p.descricao}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview do conteúdo */}
                        {ata.conteudo && (
                            <>
                                <Separator />
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center justify-center w-5 h-5 text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-medium">Prévia do Conteúdo</h3>
                                    </div>
                                    <div 
                                        className="text-sm text-muted-foreground line-clamp-6 prose prose-sm max-w-none pl-[28px]"
                                        dangerouslySetInnerHTML={{ 
                                            __html: ata.conteudo.substring(0, 500) + (ata.conteudo.length > 500 ? '...' : '')
                                        }}
                                    />
                                    <Button 
                                        variant="link" 
                                        className="px-0 h-auto mt-2 text-primary ml-[28px]"
                                        onClick={onView}
                                    >
                                        Ver conteúdo completo →
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Resumo IA */}
                        {ata.resumoIA && (
                            <>
                                <Separator />
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center justify-center w-5 h-5 text-primary">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-medium">Resumo IA</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10 ml-[28px]">
                                        {ata.resumoIA}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Ações */}
                <div className="p-4 border-t bg-muted/30 space-y-3">
                    <div className="flex gap-2">
                        <Button className="flex-1" onClick={onView}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={onEdit}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={onGenerateSummary}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Resumo IA
                        </Button>
                        <Button 
                            variant="outline" 
                            className="text-destructive hover:bg-destructive hover:text-white"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DetailRow({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle?: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-5 h-5 mt-0.5 text-muted-foreground shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs text-muted-foreground leading-none">{label}</p>
                <p className="text-sm font-medium leading-tight">{value}</p>
                {subtitle && (
                    <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE PRINCIPAL - INÍCIO
// ============================================
// ============================================
// COMPONENTE PRINCIPAL - INÍCIO
// ============================================

export function AtaTable() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Estados
    const [atas, setAtas] = useState<AtaReuniao[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');
    const [selectedAta, setSelectedAta] = useState<AtaReuniao | null>(null);
    const [detailPanelOpen, setDetailPanelOpen] = useState(false);

    // Estados dos dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ataToDelete, setAtaToDelete] = useState<AtaReuniao | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [ataForSummary, setAtaForSummary] = useState<AtaReuniao | null>(null);
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState('');
    
    // Estados para WhatsApp
    const [whatsappSummary, setWhatsappSummary] = useState<string | null>(null);
    const [generatingWhatsapp, setGeneratingWhatsapp] = useState(false);
    const [copied, setCopied] = useState(false);

    // Filtro de status
    const [statusFilter, setStatusFilter] = useState<'all' | 'finalizada' | 'rascunho'>('all');

    // Lista de terapeutas para filtro
    const [terapeutas, setTerapeutas] = useState<TerapeutaOption[]>([]);
    const [loadingTerapeutas, setLoadingTerapeutas] = useState(true);

    // Filtros atuais
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;
    const terapeutaIdFilter = searchParams.get('terapeutaId') ?? undefined;
    const clienteIdFilter = searchParams.get('clienteId') ?? undefined;
    const orderBy = (searchParams.get('orderBy') as 'recent' | 'oldest') ?? 'recent';
    
    const filters: AtaListFilters = {
        q: searchParams.get('q') ?? undefined,
        dataInicio: dateFrom,
        dataFim: dateTo,
        terapeutaId: terapeutaIdFilter,
        orderBy,
        page: Number(searchParams.get('page')) || 1,
        pageSize: 100,
    };

    const dateRangeValue: DateRangeValue | undefined = (dateFrom || dateTo) 
        ? { from: dateFrom, to: dateTo } 
        : undefined;

    const hasFilters = !!(filters.q || dateFrom || dateTo || terapeutaIdFilter || statusFilter !== 'all');

    // Verificar se estamos visualizando um cliente específico
    const isViewingClient = !!clienteIdFilter;

    // Estatísticas - Filtradas por cliente quando selecionado
    const stats = useMemo(() => {
        // Usar atas filtradas por cliente se um cliente específico estiver selecionado
        const atasParaStats = clienteIdFilter 
            ? atas.filter(a => (a.clienteId || 'sem-cliente') === clienteIdFilter)
            : atas;
        
        const finalizadas = atasParaStats.filter(a => a.status === 'finalizada').length;
        const rascunhos = atasParaStats.filter(a => a.status === 'rascunho').length;
        
        // Calcular horas usando a lógica de faturamento
        const { minutosRealizados, horasFaturadas } = calcularTotaisHoras(atasParaStats);
        
        return { 
            finalizadas, 
            rascunhos, 
            total: atasParaStats.length,
            horasRealizadas: formatarHoras(minutosRealizados),
            horasFaturadas: formatarHorasFaturadas(horasFaturadas),
        };
    }, [atas, clienteIdFilter]);

    // Lista filtrada por status, terapeuta e cliente
    const filteredAtas = useMemo(() => {
        let result = atas;
        
        // Filtrar por status
        if (statusFilter !== 'all') {
            result = result.filter(a => a.status === statusFilter);
        }
        
        // Filtrar por terapeuta
        if (terapeutaIdFilter) {
            result = result.filter(a => a.cabecalho.terapeutaId === terapeutaIdFilter);
        }
        
        // Filtrar por cliente (quando navegou para um cliente específico)
        if (clienteIdFilter) {
            result = result.filter(a => {
                const ataClienteId = a.clienteId || 'sem-cliente';
                return ataClienteId === clienteIdFilter;
            });
        }
        
        return result;
    }, [atas, statusFilter, terapeutaIdFilter, clienteIdFilter]);

    // Agrupa atas por cliente (usado apenas na listagem de clientes)
    const groupedByClient = useMemo(() => {
        // Filtrar atas antes de agrupar (exceto clienteId que é para drill-down)
        let atasParaAgrupar = atas;
        
        if (statusFilter !== 'all') {
            atasParaAgrupar = atasParaAgrupar.filter(a => a.status === statusFilter);
        }
        
        if (terapeutaIdFilter) {
            atasParaAgrupar = atasParaAgrupar.filter(a => a.cabecalho.terapeutaId === terapeutaIdFilter);
        }
        
        const grouped: Record<string, { clienteNome: string; clienteId: string; clienteAvatarUrl?: string; atas: AtaReuniao[] }> = {};
        
        atasParaAgrupar.forEach(ata => {
            const clienteId = ata.clienteId || 'sem-cliente';
            const clienteNome = ata.clienteNome || 'Sem cliente vinculado';
            const clienteAvatarUrl = ata.clienteAvatarUrl;
            
            if (!grouped[clienteId]) {
                grouped[clienteId] = { clienteId, clienteNome, clienteAvatarUrl, atas: [] };
            }
            grouped[clienteId].atas.push(ata);
        });
        
        // Converte para array e ordena por nome do cliente
        return Object.values(grouped).sort((a, b) => a.clienteNome.localeCompare(b.clienteNome));
    }, [atas, statusFilter, terapeutaIdFilter]);

    // Informações do cliente selecionado (para o header quando visualizando cliente)
    const selectedClientInfo = useMemo(() => {
        if (!clienteIdFilter) return null;
        return groupedByClient.find(c => c.clienteId === clienteIdFilter) || null;
    }, [clienteIdFilter, groupedByClient]);

    // Função para navegar para um cliente
    const navigateToClient = useCallback((clienteId: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('clienteId', clienteId);
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Função para voltar à lista de clientes
    const navigateBackToClients = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('clienteId');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Função para obter iniciais do nome
    const getInitials = (nome: string) => {
        return nome
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Índice atual no painel de detalhes
    const currentIndex = selectedAta 
        ? filteredAtas.findIndex(a => a.id === selectedAta.id) 
        : -1;

    // ============================================
    // CARREGAR DADOS
    // ============================================

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await listAtas(filters);
            setAtas(response.items);
        } catch (error) {
            console.error('Erro ao carregar atas:', error);
            toast.error('Erro ao carregar atas de reunião');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.q, filters.finalidade, filters.dataInicio, filters.dataFim, filters.orderBy, filters.terapeutaId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Carregar lista de terapeutas
    useEffect(() => {
        const loadTerapeutas = async () => {
            try {
                const data = await listTerapeutas();
                setTerapeutas(data);
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
            } finally {
                setLoadingTerapeutas(false);
            }
        };
        loadTerapeutas();
    }, []);

    // ============================================
    // HANDLERS - FILTROS
    // ============================================

    const updateFilters = useCallback((updates: InternalFilters) => {
        const newParams = new URLSearchParams(searchParams);
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                newParams.set(key, String(value));
            } else {
                newParams.delete(key);
            }
        });

        newParams.delete('page');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleDateRangeChange = useCallback((range: DateRangeValue | undefined) => {
        updateFilters({ dateFrom: range?.from, dateTo: range?.to });
    }, [updateFilters]);

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams());
        setSearchValue('');
        setStatusFilter('all');
    }, [setSearchParams]);

    // Debounce para busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.q ?? '')) {
                updateFilters({ q: searchValue || undefined });
            }
        }, 300);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    // ============================================
    // HANDLERS - NAVEGAÇÃO
    // ============================================

    const handleSelectAta = useCallback((ata: AtaReuniao) => {
        setSelectedAta(ata);
        setDetailPanelOpen(true);
    }, []);

    const handleClosePanel = useCallback(() => {
        setDetailPanelOpen(false);
    }, []);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setSelectedAta(filteredAtas[currentIndex - 1]);
        }
    }, [currentIndex, filteredAtas]);

    const handleNext = useCallback(() => {
        if (currentIndex < filteredAtas.length - 1) {
            setSelectedAta(filteredAtas[currentIndex + 1]);
        }
    }, [currentIndex, filteredAtas]);

    // ============================================
    // HANDLERS - AÇÕES
    // ============================================

    const handleView = useCallback(() => {
        if (selectedAta) {
            navigate(`/app/atas/${selectedAta.id}`);
        }
    }, [selectedAta, navigate]);

    const handleEdit = useCallback(() => {
        if (selectedAta) {
            navigate(`/app/atas/${selectedAta.id}/editar`);
        }
    }, [selectedAta, navigate]);

    const handleDeleteClick = useCallback(() => {
        if (selectedAta) {
            setAtaToDelete(selectedAta);
            setDeleteDialogOpen(true);
        }
    }, [selectedAta]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!ataToDelete) return;

        setDeleting(true);
        try {
            await deleteAta(ataToDelete.id);
            toast.success('Ata excluída com sucesso');
            setDetailPanelOpen(false);
            setSelectedAta(null);
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

    const handleGenerateSummaryClick = useCallback(() => {
        if (selectedAta) {
            setAtaForSummary(selectedAta);
            setGeneratedSummary(selectedAta.resumoIA ?? '');
            setWhatsappSummary(null);
            setCopied(false);
            setSummaryDialogOpen(true);
        }
    }, [selectedAta]);

    const handleGenerateSummary = useCallback(async () => {
        if (!ataForSummary) return;

        setGeneratingSummary(true);
        try {
            const summary = await generateSummary(ataForSummary);
            setGeneratedSummary(summary);
            toast.success('Resumo gerado com sucesso!');
            loadData();
        } catch (error) {
            console.error('Erro ao gerar resumo:', error);
            const msg = error instanceof Error ? error.message : '';
            if (msg.includes('429') || msg.includes('quota')) {
                toast.error('Limite de requisições atingido. Aguarde alguns minutos.');
            } else if (msg.includes('timeout')) {
                toast.error('Tempo esgotado. Tente novamente.');
            } else {
                toast.error('Erro ao gerar resumo. Tente novamente.');
            }
        } finally {
            setGeneratingSummary(false);
        }
    }, [ataForSummary, loadData]);

    const handleGenerateWhatsAppSummary = useCallback(async () => {
        if (!ataForSummary) return;

        setGeneratingWhatsapp(true);
        try {
            const summary = await generateWhatsAppSummary(ataForSummary);
            setWhatsappSummary(summary);
            toast.success('Mensagem para WhatsApp gerada!');
        } catch (error) {
            console.error('Erro ao gerar resumo WhatsApp:', error);
            const msg = error instanceof Error ? error.message : '';
            if (msg.includes('429') || msg.includes('quota')) {
                toast.error('Limite de requisições atingido. Aguarde alguns minutos.');
            } else if (msg.includes('timeout')) {
                toast.error('Tempo esgotado. Tente novamente.');
            } else {
                toast.error('Erro ao gerar mensagem para WhatsApp.');
            }
        } finally {
            setGeneratingWhatsapp(false);
        }
    }, [ataForSummary]);

    const handleCopyWhatsApp = useCallback(async () => {
        if (!whatsappSummary) return;
        
        try {
            await navigator.clipboard.writeText(whatsappSummary);
            setCopied(true);
            toast.success('Copiado para a área de transferência!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Erro ao copiar');
        }
    }, [whatsappSummary]);

    // ============================================
    // RENDERIZAÇÃO
    // ============================================

    return (
        <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Card Primário - Horas Realizadas */}
                <StatsCardPrimary
                    icon={<Clock className="h-5 w-5" />}
                    label="Horas Realizadas"
                    value={stats.horasRealizadas}
                />
                
                {/* Card Secundário - Horas Faturadas */}
                <StatsCardSecondary
                    icon={<Clock className="h-5 w-5" />}
                    label="Horas Faturadas"
                    value={stats.horasFaturadas}
                />
                
                {/* Cards Secundários */}
                <StatsCardSecondary
                    icon={<LayoutList className="h-5 w-5" />}
                    label="Total de Atas"
                    value={stats.total}
                    isActive={statusFilter === 'all'}
                    onClick={() => setStatusFilter('all')}
                />
                <StatsCardSecondary
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    label="Finalizadas"
                    value={stats.finalizadas}
                    badge={stats.total > 0 ? {
                        value: `${Math.round((stats.finalizadas / stats.total) * 100)}%`,
                        variant: 'success'
                    } : undefined}
                    isActive={statusFilter === 'finalizada'}
                    onClick={() => setStatusFilter(statusFilter === 'finalizada' ? 'all' : 'finalizada')}
                />
                <StatsCardSecondary
                    icon={<FileEdit className="h-5 w-5" />}
                    label="Rascunhos"
                    value={stats.rascunhos}
                    badge={stats.rascunhos > 0 ? {
                        value: `${stats.rascunhos} pendente${stats.rascunhos > 1 ? 's' : ''}`,
                        variant: 'warning'
                    } : undefined}
                    isActive={statusFilter === 'rascunho'}
                    onClick={() => setStatusFilter(statusFilter === 'rascunho' ? 'all' : 'rascunho')}
                />
            </div>

            {/* Barra de Ferramentas */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Busca - Lado Esquerdo */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente, participante, finalidade..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9 pr-9 h-9 rounded-3xl w-[400px]"
                    />
                    {searchValue && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchValue('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Filtros - Lado Direito */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap ml-auto">
                    <FiltersPopover
                        filters={[
                            {
                                type: 'select',
                                key: 'terapeutaId',
                                label: 'Terapeuta',
                                placeholder: 'Todos os terapeutas',
                                loading: loadingTerapeutas,
                                options: [
                                    { value: 'all', label: 'Todos os terapeutas' },
                                    ...terapeutas.map(t => ({ value: t.id, label: t.nome }))
                                ],
                            },
                            {
                                type: 'date-range',
                                key: 'periodo',
                                label: 'Período',
                                placeholder: 'Selecione o período',
                            },
                            {
                                type: 'select',
                                key: 'orderBy',
                                label: 'Ordenar por',
                                options: [
                                    { value: 'recent', label: 'Mais recente' },
                                    { value: 'oldest', label: 'Mais antigo' },
                                ],
                            },
                        ]}
                        values={{
                            terapeutaId: terapeutaIdFilter ?? 'all',
                            periodo: dateRangeValue,
                            orderBy: orderBy,
                        }}
                        onChange={(key, value) => {
                            if (key === 'terapeutaId') {
                                updateFilters({ terapeutaId: value === 'all' ? undefined : value as string });
                            } else if (key === 'periodo') {
                                handleDateRangeChange(value as DateRangeValue);
                            } else if (key === 'orderBy') {
                                updateFilters({ orderBy: value as 'recent' | 'oldest' });
                            }
                        }}
                        onClear={() => {
                            updateFilters({ 
                                terapeutaId: undefined, 
                                orderBy: 'recent',
                                dateFrom: undefined,
                                dateTo: undefined,
                            });
                        }}
                        buttonText="Filtros"
                        showBadge={true}
                    />

                    <Button onClick={() => navigate('/app/atas/nova')} className="gap-2 shrink-0 h-9 ">
                        <Plus className="h-4 w-4" />
                        Nova ATA
                    </Button>
                </div>
            </div>

            {/* Conteúdo Principal */}
            {loading ? (
                <LoadingSkeleton />
            ) : isViewingClient ? (
                /* ========================================
                   VISUALIZAÇÃO DE ATAS DO CLIENTE
                   ======================================== */
                <div className="space-y-4">
                    {/* Header do Cliente com botão de voltar */}
                    <div 
                        className="flex items-center gap-4 p-4"
                        style={{ 
                            backgroundColor: 'var(--hub-card-background)',
                            borderRadius: 'var(--radius)'
                        }}
                    >
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={navigateBackToClients}
                            className="shrink-0"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        <Avatar className="h-12 w-12 shrink-0">
                            <AvatarImage 
                                src={selectedClientInfo?.clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${selectedClientInfo.clienteAvatarUrl}` : ''} 
                                alt={selectedClientInfo?.clienteNome || ''} 
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-regular">
                                {getInitials(selectedClientInfo?.clienteNome || 'SC')}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                                {selectedClientInfo?.clienteNome || 'Cliente'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {filteredAtas.length} {filteredAtas.length === 1 ? 'ata' : 'atas'} • {formatarHoras(
                                    filteredAtas.reduce((acc, ata) => {
                                        const duracao = getDuracaoMinutos(ata);
                                        return acc + (duracao > 0 ? duracao : 0);
                                    }, 0)
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Lista de Atas do Cliente */}
                    {filteredAtas.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                            {filteredAtas.map((ata) => {
                                const dataFormatada = formatYmdToPtBr(ata.data);
                                const finalidadeLabel = ata.finalidade === 'outros'
                                    ? ata.finalidadeOutros
                                    : FINALIDADE_LABELS[ata.finalidade];
                                
                                return (
                                    <div
                                        key={ata.id}
                                        className={cn(
                                            "p-4 border rounded-xl cursor-pointer transition-all",
                                            "hover:bg-accent/50 hover:border-accent hover:shadow-sm",
                                            selectedAta?.id === ata.id && detailPanelOpen && "bg-accent border-primary"
                                        )}
                                        onClick={() => handleSelectAta(ata)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Icon - Centered and aligned */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                ata.modalidade === 'online' 
                                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800" 
                                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800"
                                            )}>
                                                {ata.modalidade === 'online' ? (
                                                    <Video className="h-4 w-4" />
                                                ) : (
                                                    <MapPin className="h-4 w-4" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-medium text-sm truncate leading-tight">
                                                        {finalidadeLabel}
                                                    </h4>
                                                    <Badge 
                                                        variant={ata.status === 'finalizada' ? 'default' : 'secondary'}
                                                        className="shrink-0 text-xs h-5"
                                                    >
                                                        {ata.status === 'finalizada' ? 'Finalizada' : 'Rascunho'}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                    <span>{dataFormatada}</span>
                                                    <span className="text-muted-foreground/50">•</span>
                                                    <span>{ata.horarioInicio} - {ata.horarioFim}</span>
                                                </div>
                                                
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {ata.cabecalho.terapeutaNome}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : groupedByClient.length === 0 ? (
                <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
            ) : (
                /* ========================================
                   LISTA DE CLIENTES (CARDS CLICÁVEIS)
                   ======================================== */
                <div className="space-y-3">
                    {groupedByClient.map(({ clienteId, clienteNome, clienteAvatarUrl, atas: clientAtas }) => {
                        const totalClientAtas = clientAtas.length;
                        
                        const minutosCliente = clientAtas.reduce((acc, ata) => {
                            const duracao = getDuracaoMinutos(ata);
                            return acc + (duracao > 0 ? duracao : 0);
                        }, 0);
                        
                        return (
                            <div
                                key={clienteId}
                                className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                style={{ 
                                    backgroundColor: 'var(--hub-card-background)',
                                    borderRadius: 'var(--radius)'
                                }}
                                onClick={() => navigateToClient(clienteId)}
                            >
                                <div className="shrink-0">
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                
                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarImage 
                                        src={clienteAvatarUrl ? `${import.meta.env.VITE_API_BASE ?? ''}${clienteAvatarUrl}` : ''} 
                                        alt={clienteNome} 
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary font-regular">
                                        {getInitials(clienteNome)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 text-left min-w-0">
                                    <h3 className="text-base font-regular truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                                        {clienteNome}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {formatarHoras(minutosCliente)} em atas
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm text-muted-foreground">
                                        {totalClientAtas} {totalClientAtas === 1 ? 'ata' : 'atas'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Painel de Detalhes */}
            <DetailPanel
                ata={selectedAta}
                open={detailPanelOpen}
                onClose={handleClosePanel}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onGenerateSummary={handleGenerateSummaryClick}
                currentIndex={currentIndex}
                totalCount={filteredAtas.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
            />

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
                            className="bg-destructive text-white hover:bg-destructive/90"
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
            <Dialog open={summaryDialogOpen} onOpenChange={(open) => {
                setSummaryDialogOpen(open);
                if (!open) {
                    setWhatsappSummary(null);
                    setCopied(false);
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Resumo com IA
                        </DialogTitle>
                        <DialogDescription>
                            Gere resumos automáticos da reunião.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="whatsapp" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="completo" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Resumo Completo
                            </TabsTrigger>
                            <TabsTrigger value="whatsapp" className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                            </TabsTrigger>
                        </TabsList>

                        {/* Aba: Resumo Completo */}
                        <TabsContent value="completo" className="mt-4">
                            <div className="space-y-4">
                                {generatedSummary ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Você pode editar o texto abaixo:</p>
                                        <textarea
                                            value={generatedSummary}
                                            onChange={(e) => setGeneratedSummary(e.target.value)}
                                            className="w-full p-4 bg-muted/50 rounded-lg text-sm min-h-[200px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                        <p>Clique no botão abaixo para gerar um resumo automático.</p>
                                    </div>
                                )}

                                <div className="flex justify-end">
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
                            </div>
                        </TabsContent>

                        {/* Aba: WhatsApp */}
                        <TabsContent value="whatsapp" className="mt-4">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Gere uma mensagem estruturada para enviar aos pais via WhatsApp.
                                </p>

                                {whatsappSummary ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Você pode editar o texto abaixo antes de copiar:</p>
                                        <textarea
                                            value={whatsappSummary}
                                            onChange={(e) => setWhatsappSummary(e.target.value)}
                                            className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm min-h-[280px] resize-y focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                        <p>Clique no botão abaixo para gerar.</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    {whatsappSummary && (
                                        <Button variant="outline" onClick={handleCopyWhatsApp}>
                                            {copied ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2 text-emerald-600" />
                                                    Copiado!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copiar Mensagem
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <Button onClick={handleGenerateWhatsAppSummary} disabled={generatingWhatsapp}>
                                        {generatingWhatsapp ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Gerando...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                {whatsappSummary ? 'Gerar Novamente' : 'Gerar para WhatsApp'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AtaTable;
