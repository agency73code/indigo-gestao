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
    Pencil,
    Sparkles,
    Loader2,
    User,
    CheckCircle,
    AlertCircle,
    Download,
    Target,
    MessageCircle,
    Copy,
    Check,
    Link2,
    ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import {
    type AtaReuniao,
    FINALIDADE_LABELS,
    MODALIDADE_LABELS,
    TIPO_PARTICIPANTE,
} from '../types';
import { getAtaById, generateSummary, generateWhatsAppSummary, finalizarAta } from '../services/atas.service';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { calcularHorasFaturadas, formatarDuracao, calcularDuracaoMinutos } from '../utils/calcularHorasFaturadas';


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
    const [whatsappSummary, setWhatsappSummary] = useState<string | null>(null);
    const [generatingWhatsapp, setGeneratingWhatsapp] = useState(false);
    const [copied, setCopied] = useState(false);

    // Estado para finalizar
    const [finalizando, setFinalizando] = useState(false);

    // Handlers
    const handleGenerateSummary = useCallback(async () => {
        if (!ata) return;

        setGeneratingSummary(true);
        try {
            const summary = await generateSummary(ata);
            setAta((prev) => (prev ? { ...prev, resumoIA: summary } : null));
            toast.success('Resumo gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar resumo:', error);
            const msg = error instanceof Error ? error.message : '';
            if (msg.includes('429') || msg.includes('quota')) {
                toast.error('Limite de requisições atingido. Tente novamente em alguns minutos.');
            } else if (msg.includes('timeout')) {
                toast.error('Tempo esgotado. Tente novamente.');
            } else {
                toast.error('Erro ao gerar resumo. Tente novamente.');
            }
        } finally {
            setGeneratingSummary(false);
        }
    }, [ata]);

    const handleGenerateWhatsAppSummary = useCallback(async () => {
        if (!ata) return;

        setGeneratingWhatsapp(true);
        try {
            const summary = await generateWhatsAppSummary(ata);
            setWhatsappSummary(summary);
            toast.success('Resumo para WhatsApp gerado!');
        } catch (error) {
            console.error('Erro ao gerar resumo WhatsApp:', error);
            const msg = error instanceof Error ? error.message : '';
            if (msg.includes('429') || msg.includes('quota')) {
                toast.error('Limite de requisições atingido. Aguarde alguns minutos.');
            } else if (msg.includes('timeout')) {
                toast.error('Tempo esgotado. Tente novamente.');
            } else {
                toast.error('Erro ao gerar resumo para WhatsApp.');
            }
        } finally {
            setGeneratingWhatsapp(false);
        }
    }, [ata]);

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
                {/* Sidebar esquerda */}
                <div className="w-72 border-r bg-muted/30 p-6 space-y-6">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
                {/* Conteúdo */}
                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl" />
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

    // Usar valores do backend (fallback: cálculo local)
    const duracaoMinutos = ata.duracaoMinutos ?? calcularDuracaoMinutos(ata.horarioInicio, ata.horarioFim);
    const horasFaturadasNum = ata.horasFaturadas ?? calcularHorasFaturadas(duracaoMinutos);
    const duracaoFormatada = formatarDuracao(duracaoMinutos);
    const horasFaturadasFormatada = formatarDuracao(horasFaturadasNum * 60);

    return (
        <div className="flex h-full gap-1">
            {/* ========================================== */}
            {/* SIDEBAR ESQUERDA - Properties (como steps) */}
            {/* ========================================== */}
            <aside 
                className="w-96 shrink-0 overflow-y-auto"
                style={{ 
                    backgroundColor: 'var(--header-bg)',
                    borderRadius: '16px'
                }}
            >
                <div className="p-5 space-y-6">
                    {/* Cards de Tempo e Faturável lado a lado */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Card de Tempo - Destaque Principal */}
                        <div className="bg-primary rounded-xl p-4 text-primary-foreground">
                            <span className="text-xs font-medium opacity-90">Tempo da Reunião</span>
                            <div className="text-2xl font-normal tracking-tight mt-1">
                                {duracaoFormatada}
                            </div>
                            <p className="text-xs opacity-75 mt-1">
                                Duração realizada
                            </p>
                        </div>

                        {/* Card Horas Faturáveis */}
                        <div className="bg-card rounded-xl border p-4">
                            <span className="text-xs font-medium text-emerald-600">Faturável</span>
                            <div className="text-2xl font-normal tracking-tight text-foreground mt-1">
                                {horasFaturadasFormatada}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Horas para cobrança
                            </p>
                        </div>
                    </div>

                    {/* Divisor visual */}
                    <div className="border-t" />

                    {/* Seção: Properties */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Propriedades
                        </h3>

                        {/* Finalidade */}
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Finalidade</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-background rounded-lg border text-sm">
                                <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                    {ata.finalidade === 'outros' ? ata.finalidadeOutros : FINALIDADE_LABELS[ata.finalidade]}
                                </span>
                            </div>
                        </div>

                        {/* Data e Horário na mesma linha */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Data */}
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Data</label>
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-background rounded-lg border text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{dataFormatadaCurta}</span>
                                </div>
                            </div>

                            {/* Horário */}
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Horário</label>
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-background rounded-lg border text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{ata.horarioInicio} - {ata.horarioFim}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modalidade e Status na mesma linha */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Modalidade */}
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Modalidade</label>
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-background rounded-lg border text-sm">
                                    {ata.modalidade === 'online' ? (
                                        <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                                    ) : (
                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    )}
                                    <span>{MODALIDADE_LABELS[ata.modalidade]}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Status</label>
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${
                                    ata.status === 'finalizada' 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-amber-50 border-amber-200 text-amber-700'
                                }`}>
                                    {ata.status === 'finalizada' ? (
                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                    )}
                                    <span className="capitalize">{ata.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divisor visual */}
                    <div className="border-t" />

                    {/* Seção: Histórico */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Histórico
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Criado em</span>
                                <span className="font-medium">{format(parseISO(ata.criadoEm), "dd/MM/yy HH:mm")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Atualizado</span>
                                <span className="font-medium">{format(parseISO(ata.atualizadoEm), "dd/MM/yy HH:mm")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Seção: Links de Recomendação */}
                    {ata.links && ata.links.length > 0 && (
                        <>
                            <div className="border-t" />
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Links ({ata.links.length})
                                </h3>
                                <div className="space-y-2">
                                    {ata.links.map((link) => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border hover:bg-blue-50/50 hover:border-blue-200 transition-colors group text-sm"
                                        >
                                            <Link2 className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span className="truncate flex-1">{link.titulo}</span>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Seção: Anexos */}
                    {ata.anexos && ata.anexos.length > 0 && (
                        <>
                            <div className="border-t" />
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Anexos ({ata.anexos.length})
                                </h3>
                                <div className="space-y-2">
                                    {ata.anexos.map((anexo) => {
                                        const ext = anexo.name.split('.').pop()?.toLowerCase();
                                        const isPdf = ext === 'pdf';
                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
                                        
                                        let iconColor = 'text-gray-500';
                                        if (isPdf) iconColor = 'text-red-500';
                                        else if (isImage) iconColor = 'text-green-500';

                                        return (
                                            <div
                                                key={anexo.id}
                                                className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group text-sm"
                                                onClick={() => anexo.url && window.open(anexo.url, '_blank')}
                                            >
                                                <FileText className={`h-4 w-4 ${iconColor} shrink-0`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate text-sm">{anexo.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(anexo.size / 1024 / 1024).toFixed(1)} MB
                                                    </p>
                                                </div>
                                                <Download className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* ========================================== */}
            {/* ÁREA PRINCIPAL - Conteúdo */}
            {/* ========================================== */}
            <div 
                className="flex-1 overflow-y-auto"
                style={{ 
                    backgroundColor: 'var(--header-bg)',
                    borderRadius: '16px'
                }}
            >
                <div className="py-6 px-6">
                    {/* Header: Cliente/Responsável e Participantes */}
                    <div className="bg-card rounded-xl border p-4 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                            {/* Lado esquerdo: Cliente + Responsável empilhados */}
                            <div className="space-y-3 lg:min-w-60">
                                {/* Cliente */}
                                {ata.clienteNome && (
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-semibold text-primary">
                                                {ata.clienteNome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cliente</p>
                                            <p className="font-medium text-sm">{ata.clienteNome}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Responsável */}
                                <div className="flex items-center gap-2.5">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Responsável</p>
                                        <p className="font-medium text-sm">{ata.cabecalho.terapeutaNome}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {ata.cabecalho.profissao}
                                            {ata.cabecalho.conselhoNumero && ` • ${ata.cabecalho.conselhoTipo} ${ata.cabecalho.conselhoNumero}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider vertical */}
                            {totalParticipantes > 0 && <div className="hidden lg:block w-px bg-border self-stretch" />}

                            {/* Lado direito: Participantes */}
                            {totalParticipantes > 0 && (
                                <div className="flex-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                                        Participantes ({totalParticipantes})
                                    </p>
                                    <div className="space-y-1.5">
                                        {/* Família */}
                                        {participantesFamilia.map((p) => (
                                            <div key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 rounded-md text-xs border border-blue-100 mr-1.5">
                                                <span className="font-medium text-blue-900">{p.nome}</span>
                                                {p.descricao && <span className="text-blue-600">({p.descricao})</span>}
                                            </div>
                                        ))}
                                        {/* Externos */}
                                        {participantesExterno.map((p) => (
                                            <div key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 rounded-md text-xs border border-purple-100 mr-1.5">
                                                <span className="font-medium text-purple-900">{p.nome}</span>
                                                {p.descricao && <span className="text-purple-600">({p.descricao})</span>}
                                            </div>
                                        ))}
                                        {/* Clínica */}
                                        {participantesClinica.map((p) => (
                                            <div key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 rounded-md text-xs border border-emerald-100 mr-1.5">
                                                <div className="h-5 w-5 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-medium text-emerald-700">{p.nome.charAt(0)}</span>
                                                </div>
                                                <span className="font-medium text-emerald-900">{p.nome}</span>
                                                {(p.especialidade || p.cargo) && (
                                                    <span className="text-emerald-600">({[p.especialidade, p.cargo].filter(Boolean).join(' • ')})</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resumo IA */}
                    {ata.resumoIA && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-normal" style={{fontFamily: "Sora"}}>Resumo IA</h2>
                            </div>
                            <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6">
                                <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                                    {ata.resumoIA}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conteúdo da Ata */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">   
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-normal" style={{fontFamily: "Sora"}}>Tópicos e Condutas</h2>
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
                    </div>
                </div>
            </div>

            {/* Dialog de resumo IA */}
            <Dialog open={summaryDialogOpen} onOpenChange={(open) => {
                setSummaryDialogOpen(open);
                if (!open) {
                    setWhatsappSummary(null);
                    setCopied(false);
                }
            }}>
                <DialogContent className="max-w-2xl">
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
                                {ata.resumoIA ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Você pode editar o texto abaixo:</p>
                                        <textarea
                                            value={ata.resumoIA}
                                            onChange={(e) => setAta({ ...ata, resumoIA: e.target.value })}
                                            className="w-full p-4 bg-muted/50 rounded-lg text-sm min-h-[260px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                                                {ata.resumoIA ? 'Gerar Novamente' : 'Gerar Resumo'}
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
                                    Gere um resumo curto e acolhedor para enviar aos pais via WhatsApp.
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

export default VisualizarAtaPage;
