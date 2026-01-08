/**
 * Página de visualização de Ata de Reunião
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    FileText,
    Calendar,
    Clock,
    Video,
    MapPin,
    Users,
    Pencil,
    Sparkles,
    Loader2,
    User,
    Building2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import {
    type AtaReuniao,
    FINALIDADE_LABELS,
    MODALIDADE_LABELS,
    TIPO_PARTICIPANTE,
} from '../types';
import { getAtaById, generateSummary, finalizarAta } from '../services/atas.service';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

export function VisualizarAtaPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setPageTitle, setHeaderActions, setShowBackButton, setOnBackClick } = usePageTitle();

    const [loading, setLoading] = useState(true);
    const [ata, setAta] = useState<AtaReuniao | null>(null);
    const [notFound, setNotFound] = useState(false);

    // Estados para IA
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [generatingSummary, setGeneratingSummary] = useState(false);

    // Estado para finalizar
    const [finalizando, setFinalizando] = useState(false);

    // Handlers
    const handleGenerateSummary = useCallback(async () => {
        if (!ata) return;

        setGeneratingSummary(true);
        try {
            const summary = await generateSummary(ata.id);
            setAta((prev) => (prev ? { ...prev, resumoIA: summary } : null));
            toast.success('Resumo gerado com sucesso!');
            setSummaryDialogOpen(false);
        } catch (error) {
            console.error('Erro ao gerar resumo:', error);
            toast.error('Erro ao gerar resumo');
        } finally {
            setGeneratingSummary(false);
        }
    }, [ata]);

    const handleFinalizar = useCallback(async () => {
        if (!ata) return;

        setFinalizando(true);
        try {
            const updated = await finalizarAta(ata.id);
            if (updated) {
                setAta(updated);
                toast.success('Ata finalizada com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao finalizar ata:', error);
            toast.error('Erro ao finalizar ata');
        } finally {
            setFinalizando(false);
        }
    }, [ata]);

    // Carregar ata
    useEffect(() => {
        async function loadAta() {
            if (!id) return;

            setLoading(true);
            try {
                const data = await getAtaById(id);
                if (data) {
                    setAta(data);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Erro ao carregar ata:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        loadAta();
    }, [id]);

    // Configurar título e botão de voltar
    useEffect(() => {
        setShowBackButton(true);
        setOnBackClick(() => () => navigate('/app/atas'));

        return () => {
            setShowBackButton(false);
            setOnBackClick(undefined);
        };
    }, [setShowBackButton, setOnBackClick, navigate]);

    // Configurar título dinâmico baseado na ata
    useEffect(() => {
        if (ata) {
            const finalidadeLabel = ata.finalidade === 'outros' 
                ? ata.finalidadeOutros 
                : FINALIDADE_LABELS[ata.finalidade];
            setPageTitle(finalidadeLabel || 'Ata de Reunião');
        } else {
            setPageTitle('Ata de Reunião');
        }
    }, [ata, setPageTitle]);

    // Configurar botões de ação do header
    useEffect(() => {
        if (ata) {
            setHeaderActions(
                <div className="flex items-center gap-2">
                    {ata.status === 'rascunho' && (
                        <Button 
                            variant="outline" 
                            className="h-10 rounded-full gap-2"
                            onClick={handleFinalizar} 
                            disabled={finalizando}
                        >
                            {finalizando ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            Finalizar
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        className="h-10 rounded-full gap-2"
                        onClick={() => setSummaryDialogOpen(true)}
                    >
                        <Sparkles className="h-4 w-4" />
                        Resumo IA
                    </Button>
                    <Button 
                        className="h-10 rounded-full gap-2"
                        asChild
                    >
                        <Link to={`/app/atas/${ata.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            );
        } else {
            setHeaderActions(null);
        }

        return () => setHeaderActions(null);
    }, [ata, finalizando, setHeaderActions, handleFinalizar]);

    // Loading state
    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Área principal */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <Skeleton className="h-8 w-2/3" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                {/* Sidebar */}
                <div className="w-80 border-l bg-muted/20 p-6 space-y-6">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    // Not found state
    if (notFound || !ata) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="flex flex-col items-center justify-center py-16 text-center max-w-md">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Ata não encontrada</h2>
                    <p className="text-muted-foreground mb-6">
                        A ata que você está procurando não existe ou foi removida.
                    </p>
                    <Button onClick={() => navigate('/app/atas')} className="rounded-full">
                        Voltar para lista
                    </Button>
                </div>
            </div>
        );
    }

    const dataFormatadaCurta = format(parseISO(ata.data), "dd/MM/yyyy", { locale: ptBR });

    const participantesFamilia = ata.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.FAMILIA);
    const participantesExterno = ata.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO);
    const participantesClinica = ata.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA);
    const totalParticipantes = ata.participantes.length;

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Área principal - Conteúdo */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto py-6 px-6 lg:px-8">
                    {/* Header com status e cliente */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge 
                            variant="outline"
                            className={ata.status === 'finalizada' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5' 
                                : 'bg-amber-50 text-amber-700 border-amber-200 gap-1.5'
                            }
                        >
                            {ata.status === 'finalizada' ? (
                                <>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Finalizada
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Rascunho
                                </>
                            )}
                        </Badge>
                        {ata.clienteNome && (
                            <span className="text-sm text-muted-foreground">
                                Cliente: <span className="text-foreground font-medium">{ata.clienteNome}</span>
                            </span>
                        )}
                    </div>

                    {/* Metadados em linha */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{dataFormatadaCurta}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{ata.horarioInicio} - {ata.horarioFim}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {ata.modalidade === 'online' ? (
                                <Video className="h-4 w-4" />
                            ) : (
                                <MapPin className="h-4 w-4" />
                            )}
                            <span>{MODALIDADE_LABELS[ata.modalidade]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{totalParticipantes} participante{totalParticipantes !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Conteúdo da Ata */}
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Tópicos e Condutas</h2>
                        </div>
                        <div className="bg-card rounded-xl border p-6">
                            <div
                                className="prose prose-slate max-w-none 
                                    prose-headings:font-semibold prose-headings:text-foreground 
                                    prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4
                                    prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
                                    prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-3
                                    prose-strong:text-foreground prose-strong:font-semibold
                                    prose-ul:my-3 prose-ul:pl-5
                                    prose-li:text-foreground/90 prose-li:my-1 prose-li:marker:text-primary"
                                dangerouslySetInnerHTML={{ __html: ata.conteudo }}
                            />
                        </div>
                    </section>

                    {/* Resumo IA */}
                    {ata.resumoIA && (
                        <section className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Resumo Gerado por IA</h2>
                            </div>
                            <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6">
                                <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                                    {ata.resumoIA}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Sidebar fixa à direita */}
            <aside className="w-80 border-l bg-muted/20 shrink-0 overflow-y-auto">
                <div className="p-5 space-y-6">
                    {/* Profissional Responsável */}
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Responsável
                        </h3>
                        <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <p className="font-medium text-sm">{ata.cabecalho.terapeutaNome}</p>
                                {ata.cabecalho.profissao && (
                                    <p className="text-xs text-muted-foreground">{ata.cabecalho.profissao}</p>
                                )}
                                {ata.cabecalho.conselhoNumero && (
                                    <p className="text-xs text-muted-foreground">
                                        {ata.cabecalho.conselhoTipo} {ata.cabecalho.conselhoNumero}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Divisor */}
                    <div className="border-t" />

                    {/* Participantes */}
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Participantes
                        </h3>
                        <div className="space-y-4">
                            {/* Família */}
                            {participantesFamilia.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        Família/Responsáveis
                                    </p>
                                    <div className="space-y-1.5">
                                        {participantesFamilia.map((p) => (
                                            <div key={p.id} className="text-sm">
                                                <span className="font-medium">{p.nome}</span>
                                                {p.descricao && (
                                                    <span className="text-muted-foreground text-xs ml-1.5">
                                                        • {p.descricao}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Profissionais da Clínica */}
                            {participantesClinica.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        Profissionais da Clínica
                                    </p>
                                    <div className="space-y-1.5">
                                        {participantesClinica.map((p) => (
                                            <div key={p.id} className="text-sm">
                                                <span className="font-medium">{p.nome}</span>
                                                {p.especialidade && (
                                                    <span className="text-muted-foreground text-xs ml-1.5">
                                                        • {p.especialidade}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Profissionais Externos */}
                            {participantesExterno.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Profissionais Externos
                                    </p>
                                    <div className="space-y-1.5">
                                        {participantesExterno.map((p) => (
                                            <div key={p.id} className="text-sm">
                                                <span className="font-medium">{p.nome}</span>
                                                {p.descricao && (
                                                    <span className="text-muted-foreground text-xs ml-1.5">
                                                        • {p.descricao}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {totalParticipantes === 0 && (
                                <p className="text-sm text-muted-foreground italic">
                                    Nenhum participante registrado
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Divisor */}
                    <div className="border-t" />

                    {/* Histórico */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Criado em</span>
                            <span className="font-medium">{format(parseISO(ata.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Atualizado em</span>
                            <span className="font-medium">{format(parseISO(ata.atualizadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Dialog de resumo IA */}
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Gerar Resumo com IA
                        </DialogTitle>
                        <DialogDescription>
                            Gere um resumo automático dos principais pontos discutidos na reunião.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {ata.resumoIA ? (
                            <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                                {ata.resumoIA}
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
                                    {ata.resumoIA ? 'Gerar Novamente' : 'Gerar Resumo'}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default VisualizarAtaPage;
