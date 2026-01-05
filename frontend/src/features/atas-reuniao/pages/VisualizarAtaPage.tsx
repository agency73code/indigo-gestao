/**
 * Página de visualização de Ata de Reunião
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ArrowLeft,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

export function VisualizarAtaPage() {
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [ata, setAta] = useState<AtaReuniao | null>(null);
    const [notFound, setNotFound] = useState(false);

    // Estados para IA
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [generatingSummary, setGeneratingSummary] = useState(false);

    // Estado para finalizar
    const [finalizando, setFinalizando] = useState(false);

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

    // Handlers
    const handleGenerateSummary = async () => {
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
    };

    const handleFinalizar = async () => {
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
    };

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-48 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (notFound || !ata) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Ata não encontrada</h2>
                    <p className="text-muted-foreground mb-6">
                        A ata que você está procurando não existe ou foi removida.
                    </p>
                    <Button asChild>
                        <Link to="/app/atas">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar para lista
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const dataFormatada = format(parseISO(ata.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const finalidadeLabel = ata.finalidade === 'outros' ? ata.finalidadeOutros : FINALIDADE_LABELS[ata.finalidade];

    const participantesFamilia = ata.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.FAMILIA);
    const participantesExterno = ata.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO);
    const participantesClinica = ata.participantes.filter((p) => p.tipo === TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA);

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
                        <Link to="/app/atas">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-semibold tracking-tight">{finalidadeLabel}</h1>
                            <Badge variant={ata.status === 'finalizada' ? 'default' : 'secondary'}>
                                {ata.status === 'finalizada' ? (
                                    <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Finalizada
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Rascunho
                                    </>
                                )}
                            </Badge>
                        </div>
                        {ata.clienteNome && (
                            <p className="text-muted-foreground">
                                Cliente: <span className="text-foreground font-medium">{ata.clienteNome}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 sm:shrink-0">
                    {ata.status === 'rascunho' && (
                        <Button variant="outline" onClick={handleFinalizar} disabled={finalizando}>
                            {finalizando ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Finalizar
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setSummaryDialogOpen(true)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Resumo IA
                    </Button>
                    <Button asChild>
                        <Link to={`/app/atas/${ata.id}/editar`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detalhes da reunião */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Detalhes da Reunião</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Data</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {dataFormatada}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Horário</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        {ata.horario}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Modalidade</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        {ata.modalidade === 'online' ? (
                                            <Video className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        {MODALIDADE_LABELS[ata.modalidade]}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Participantes</p>
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        {ata.participantes.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conteúdo da ata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tópicos e Condutas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: ata.conteudo }}
                            />
                        </CardContent>
                    </Card>

                    {/* Resumo IA */}
                    {ata.resumoIA && (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Resumo Gerado por IA
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="whitespace-pre-wrap text-sm">{ata.resumoIA}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profissional responsável */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Profissional Responsável</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Nome</p>
                                <p className="text-sm font-medium">{ata.cabecalho.terapeutaNome}</p>
                            </div>
                            {ata.cabecalho.conselhoNumero && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Conselho</p>
                                    <p className="text-sm font-medium">
                                        {ata.cabecalho.conselhoTipo} {ata.cabecalho.conselhoNumero}
                                    </p>
                                </div>
                            )}
                            {ata.cabecalho.profissao && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Profissão</p>
                                    <p className="text-sm font-medium">{ata.cabecalho.profissao}</p>
                                </div>
                            )}
                            {ata.cabecalho.cargo && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Cargo</p>
                                    <p className="text-sm font-medium">{ata.cabecalho.cargo}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Participantes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Participantes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Família */}
                            {participantesFamilia.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Família/Responsáveis
                                    </p>
                                    <ul className="space-y-2">
                                        {participantesFamilia.map((p) => (
                                            <li key={p.id} className="text-sm">
                                                <span className="font-medium">{p.nome}</span>
                                                {p.descricao && (
                                                    <span className="text-muted-foreground"> ({p.descricao})</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Profissionais externos */}
                            {participantesExterno.length > 0 && (
                                <>
                                    {participantesFamilia.length > 0 && <Separator />}
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            Profissionais Externos
                                        </p>
                                        <ul className="space-y-2">
                                            {participantesExterno.map((p) => (
                                                <li key={p.id} className="text-sm">
                                                    <span className="font-medium">{p.nome}</span>
                                                    {p.descricao && (
                                                        <span className="text-muted-foreground"> - {p.descricao}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}

                            {/* Profissionais da clínica */}
                            {participantesClinica.length > 0 && (
                                <>
                                    {(participantesFamilia.length > 0 || participantesExterno.length > 0) && (
                                        <Separator />
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Profissionais da Clínica
                                        </p>
                                        <ul className="space-y-2">
                                            {participantesClinica.map((p) => (
                                                <li key={p.id} className="text-sm">
                                                    <span className="font-medium">{p.nome}</span>
                                                    {(p.especialidade || p.cargo) && (
                                                        <span className="text-muted-foreground">
                                                            {' '}
                                                            - {p.especialidade}
                                                            {p.cargo && ` (${p.cargo})`}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadados */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Criado em:{' '}
                                    {format(parseISO(ata.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                                <p>
                                    Atualizado em:{' '}
                                    {format(parseISO(ata.atualizadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

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
