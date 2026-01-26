/**
 * DetalheLancamentoPage
 * 
 * Página para visualizar detalhes de um lançamento específico.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Clock, 
    Calendar, 
    User, 
    DollarSign, 
    FileText,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';

import type { Lancamento } from '../types';
import { 
    STATUS_LANCAMENTO_LABELS, 
    TIPO_ATIVIDADE_LABELS,
    STATUS_LANCAMENTO,
} from '../types';
import { getLancamento } from '../services/faturamento.service';

// ============================================
// HELPERS
// ============================================

function formatarData(data: string): string {
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
}

function formatarHorario(inicio: string, fim: string): string {
    return `${inicio} - ${fim}`;
}

function formatarDuracao(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m} minutos`;
    if (m === 0) return `${h} hora${h > 1 ? 's' : ''}`;
    return `${h}h ${m}min`;
}

function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================
// COMPONENTES
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        </div>
    );
}

function StatusIcon({ status }: { status: string }) {
    if (status === STATUS_LANCAMENTO.APROVADO) {
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    }
    if (status === STATUS_LANCAMENTO.PENDENTE) {
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
    if (status === STATUS_LANCAMENTO.REJEITADO) {
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />;
}

function DetailRow({ 
    icon, 
    label, 
    value 
}: { 
    icon: React.ReactNode; 
    label: string; 
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export function DetalheLancamentoPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();

    const [lancamento, setLancamento] = useState<Lancamento | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPageTitle('Detalhes do Lançamento');
    }, [setPageTitle]);

    const loadLancamento = useCallback(async () => {
        if (!id) {
            setError('ID do lançamento não informado');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getLancamento(id);
            setLancamento(data);
        } catch (err) {
            console.error('Erro ao carregar lançamento:', err);
            setError('Não foi possível carregar o lançamento');
            toast.error('Erro ao carregar lançamento');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadLancamento();
    }, [loadLancamento]);

    const handleVoltar = () => {
        navigate(-1);
    };

    const handleEditar = () => {
        if (lancamento) {
            navigate(`/app/faturamento/registrar-lancamento?editar=${lancamento.id}`);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <LoadingSkeleton />
            </div>
        );
    }

    if (error || !lancamento) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Lançamento não encontrado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {error || 'O lançamento solicitado não existe ou foi removido.'}
                    </p>
                    <Button variant="outline" onClick={handleVoltar}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    const statusLabel = STATUS_LANCAMENTO_LABELS[lancamento.status];
    const tipoLabel = TIPO_ATIVIDADE_LABELS[lancamento.tipoAtividade];

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleVoltar}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>
                            {tipoLabel}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatarData(lancamento.data)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            lancamento.status === 'aprovado' ? 'default' :
                            lancamento.status === 'pendente' ? 'secondary' :
                            'destructive'
                        }
                        className="gap-1"
                    >
                        <StatusIcon status={lancamento.status} />
                        {statusLabel}
                    </Badge>
                </div>
            </div>

            {/* Card de Informações */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Informações do Lançamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <DetailRow
                        icon={<User className="h-4 w-4" />}
                        label="Cliente"
                        value={lancamento.clienteNome}
                    />
                    <Separator />
                    <DetailRow
                        icon={<User className="h-4 w-4" />}
                        label="Terapeuta"
                        value={lancamento.terapeutaNome}
                    />
                    <Separator />
                    <DetailRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Data"
                        value={formatarData(lancamento.data)}
                    />
                    <Separator />
                    <DetailRow
                        icon={<Clock className="h-4 w-4" />}
                        label="Horário"
                        value={formatarHorario(lancamento.horarioInicio, lancamento.horarioFim)}
                    />
                    <Separator />
                    <DetailRow
                        icon={<Clock className="h-4 w-4" />}
                        label="Duração"
                        value={formatarDuracao(lancamento.duracaoMinutos)}
                    />
                    <Separator />
                    <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Valor por Hora"
                        value={formatarMoeda(lancamento.valorHora)}
                    />
                    <Separator />
                    <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Valor Total"
                        value={
                            <span className="text-lg font-semibold text-primary">
                                {formatarMoeda(lancamento.valorTotal)}
                            </span>
                        }
                    />
                </CardContent>
            </Card>

            {/* Observações */}
            {lancamento.observacoes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {lancamento.observacoes}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Motivo de Rejeição */}
            {lancamento.status === 'rejeitado' && lancamento.motivoRejeicao && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="text-base text-red-700 dark:text-red-400">
                            Motivo da Rejeição
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {lancamento.motivoRejeicao}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Ações */}
            {lancamento.status === 'pendente' && (
                <div className="flex items-center gap-3">
                    <Button onClick={handleEditar} variant="outline" className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar Lançamento
                    </Button>
                </div>
            )}
        </div>
    );
}

export default DetalheLancamentoPage;
