import { useMemo, useState } from 'react';
import { Brain, ChevronRight, Pause as PauseIcon, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ToActivityBlockPanel, {
    type BlockCounts,
    type ResultadoTentativa,
    type ActivitySummary,
} from './ToActivityBlockPanel';
import type { ToProgramDetail, ToSessionAttempt, ToPerformanceType } from '../types';

type BlockResumo = {
    'nao-desempenhou': number;
    'desempenhou-com-ajuda': number;
    desempenhou: number;
    total: number;
    ts: number;
};

const createEmptyCounts = (): BlockCounts => ({ 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 0, desempenhou: 0 });

interface ToActivitiesPanelProps {
    program: ToProgramDetail;
    attempts: ToSessionAttempt[];
    onAddAttempt: (attempt: ToSessionAttempt) => void;
    sessionId?: string;
}

export default function ToActivitiesPanel({
    program,
    attempts,
    onAddAttempt,
    sessionId,
}: ToActivitiesPanelProps) {
    const [ativoId, setAtivoId] = useState<string | null>(null);
    const [countsMap, setCountsMap] = useState<Record<string, BlockCounts>>({});
    const [pausedMap, setPausedMap] = useState<Record<string, boolean>>({});
    const [historico, setHistorico] = useState<Record<string, BlockResumo[]>>({});
    // Armazena tentativas temporárias do bloco ativo (não enviadas ainda)
    const [tempAttempts, setTempAttempts] = useState<Record<string, ToSessionAttempt[]>>({});

    const shortTermGoalDescription =
        program.shortTermGoalDescription ?? program.goalDescription ?? null;

    const activeActivities = useMemo(
        () => program.activities.filter((activity) => activity.active),
        [program.activities],
    );

    const activeActivity = useMemo(
        () => activeActivities.find((activity) => activity.id === ativoId) ?? null,
        [activeActivities, ativoId],
    );

    const effectiveSessionId = sessionId ?? program.id ?? 'draft-session';

    const registrarTentativa = (resultado: ResultadoTentativa) => {
        if (!ativoId || !activeActivity) {
            return;
        }

        setCountsMap((prev) => {
            const atual = prev[ativoId] ?? createEmptyCounts();
            const proximo: BlockCounts = {
                ...atual,
                [resultado]: atual[resultado] + 1,
            } as BlockCounts;
            return { ...prev, [ativoId]: proximo };
        });

        // Calcula o número da tentativa baseado nas tentativas já salvas + temporárias
        const activityAttempts = attempts.filter((attempt) => attempt.activityId === ativoId);
        const tempActivityAttempts = tempAttempts[ativoId] ?? [];
        const attemptNumber = activityAttempts.length + tempActivityAttempts.length + 1;

        const tipoSessao: ToPerformanceType =
            resultado === 'nao-desempenhou' ? 'nao-desempenhou' : resultado === 'desempenhou-com-ajuda' ? 'desempenhou-com-ajuda' : 'desempenhou';

        const novoAttempto: ToSessionAttempt = {
            id: `attempt-${Date.now()}-${Math.random()}`,
            attemptNumber,
            activityId: ativoId,
            activityLabel: activeActivity.label,
            type: tipoSessao,
            timestamp: new Date().toISOString(),
        };

        // Armazena temporariamente em vez de enviar imediatamente
        setTempAttempts((prev) => {
            const atual = prev[ativoId] ?? [];
            return { ...prev, [ativoId]: [...atual, novoAttempto] };
        });
    };

    const removerTentativa = (resultado: ResultadoTentativa) => {
        if (!ativoId || !activeActivity) {
            return;
        }

        const counts = countsMap[ativoId] ?? createEmptyCounts();
        if (counts[resultado] <= 0) {
            return; // Não pode remover se já está em 0
        }

        // Decrementa o contador
        setCountsMap((prev) => {
            const atual = prev[ativoId] ?? createEmptyCounts();
            const proximo: BlockCounts = {
                ...atual,
                [resultado]: Math.max(0, atual[resultado] - 1),
            } as BlockCounts;
            return { ...prev, [ativoId]: proximo };
        });

        // Remove a última tentativa temporária deste tipo
        setTempAttempts((prev) => {
            const tempActivityAttempts = prev[ativoId] ?? [];
            
            // Encontra o tipo correspondente
            const tipoSessao: ToPerformanceType =
                resultado === 'nao-desempenhou' ? 'nao-desempenhou' : resultado === 'desempenhou-com-ajuda' ? 'desempenhou-com-ajuda' : 'desempenhou';
            
            // Filtra para encontrar a última tentativa deste tipo
            const indiceUltimo = tempActivityAttempts
                .map((a, i) => ({ attempt: a, index: i }))
                .filter((item) => item.attempt.type === tipoSessao)
                .pop()?.index;

            if (indiceUltimo === undefined) {
                return prev;
            }

            // Remove a última tentativa deste tipo
            const novasTemp = [
                ...tempActivityAttempts.slice(0, indiceUltimo),
                ...tempActivityAttempts.slice(indiceUltimo + 1),
            ];

            return { ...prev, [ativoId]: novasTemp };
        });
    };

    const handleSelectActivity = (activityId: string) => {
        if (ativoId === activityId) {
            setAtivoId(null);
            return;
        }

        setAtivoId(activityId);
        setPausedMap((prev) => ({ ...prev, [activityId]: false }));
        setCountsMap((prev) => {
            if (prev[activityId]) {
                return prev;
            }
            return { ...prev, [activityId]: createEmptyCounts() };
        });
    };

    const pausarBloco = () => {
        if (!ativoId) {
            return;
        }

        setPausedMap((prev) => ({ ...prev, [ativoId]: true }));

        // NÃO limpa as tentativas temporárias quando pausar
        // As informações devem ser mantidas para quando retomar

        // NÃO limpa os contadores também
        // Mantém os contadores para quando retomar

        setAtivoId(null);
    };

    const finalizarBloco = () => {
        if (!ativoId) {
            return;
        }

        const counts = countsMap[ativoId] ?? createEmptyCounts();
        const resumo: BlockResumo = {
            ...counts,
            total: counts['nao-desempenhou'] + counts['desempenhou-com-ajuda'] + counts.desempenhou,
            ts: Date.now(),
        };

        setHistorico((prev) => {
            const atual = prev[ativoId] ? [...prev[ativoId]] : [];
            atual.push(resumo);
            return { ...prev, [ativoId]: atual };
        });

        // Envia todas as tentativas temporárias para o registro geral
        const tempActivityAttempts = tempAttempts[ativoId] ?? [];
        tempActivityAttempts.forEach((attempt) => {
            onAddAttempt(attempt);
        });

        // Limpa as tentativas temporárias desta atividade
        setTempAttempts((prev) => {
            const copia = { ...prev };
            delete copia[ativoId];
            return copia;
        });

        setCountsMap((prev) => {
            const copia = { ...prev };
            delete copia[ativoId];
            return copia;
        });

        setPausedMap((prev) => ({ ...prev, [ativoId]: false }));
        setAtivoId(null);
    };

    const renderResumo = (activityId: string) => {
        const resumoDaAtividade = historico[activityId];
        if (!resumoDaAtividade || resumoDaAtividade.length === 0) {
            return null;
        }

        return (
            <div className="space-y-0">
                {resumoDaAtividade.map((item, index) => (
                    <div key={item.ts}>
                        {index > 0 && <Separator />}
                        <div className="px-4 py-3 text-xs">
                            <div className="font-semibold text-sm mb-2 text-foreground">
                                Tentativa {index + 1}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline" className="p-2 rounded-[5px]">
                                    Não desempenhou: {item['nao-desempenhou']}
                                </Badge>
                                <Badge variant="outline" className="p-2 rounded-[5px]">
                                    Desempenhou com ajuda: {item['desempenhou-com-ajuda']}
                                </Badge>
                                <Badge variant="outline" className="p-2 rounded-[5px]">
                                    Desempenhou: {item.desempenhou}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="font-semibold p-2 rounded-[5px] ml-auto"
                                >
                                    Total: {item.total}
                                </Badge>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (activeActivities.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Atividades em treino
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma atividade ativa encontrada para este programa</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Objetivo Específico
                    <Badge variant="secondary" className="ml-2">
                        {activeActivities.length}
                    </Badge>
                </CardTitle>

                {shortTermGoalDescription && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">
                            Descrição Detalhada do Objetivo a Curto Prazo:
                        </Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {shortTermGoalDescription}
                            </p>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                <div className="space-y-3">
                    {activeActivities.map((activity) => {
                        const isActive = ativoId === activity.id;
                        const resumo = renderResumo(activity.id);
                        const estaPausado = pausedMap[activity.id] ?? false;
                        const counts = countsMap[activity.id] ?? createEmptyCounts();
                        const activitySummary: ActivitySummary = {
                            id: activity.id,
                            nome: activity.label,
                            indice: activity.order,
                        };

                        return (
                            <div
                                key={activity.id}
                                className="rounded-[5px] border bg-card shadow-sm"
                            >
                                <div className="px-4 py-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0 mt-0.5">
                                                {activity.order}
                                            </div>
                                            <div className="font-medium text-sm text-foreground">
                                                {activity.label}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => handleSelectActivity(activity.id)}
                                        >
                                            <Play className="h-4 w-4 mr-2" /> Iniciar
                                        </Button>
                                    </div>

                                    {activity.description && activity.description.trim().length > 0 && (
                                        <details className="mt-3 ml-11">
                                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
                                                <ChevronRight className="h-3 w-3 transition-transform [details[open]_&]:rotate-90" />
                                                Ver descrição
                                            </summary>
                                            <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground leading-relaxed">
                                                {activity.description}
                                            </div>
                                        </details>
                                    )}
                                </div>

                                <Separator />

                                {isActive && (
                                    <div className="px-4 pb-4">
                                        <div className="pt-4">
                                            <ToActivityBlockPanel
                                                sessionId={effectiveSessionId}
                                                descricaoCurtoPrazo={
                                                    program.shortTermGoalDescription ?? ''
                                                }
                                                descricaoAplicacao={
                                                    program.activitiesApplicationDescription ?? ''
                                                }
                                                activity={activitySummary}
                                                paused={estaPausado}
                                                counts={counts}
                                                onCreateAttempt={registrarTentativa}
                                                onRemoveAttempt={removerTentativa}
                                                onPause={pausarBloco}
                                                onFinalizarBloco={finalizarBloco}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isActive && estaPausado && (
                                    <div className="px-4 pb-3 pt-2">
                                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                            <PauseIcon className="h-3.5 w-3.5" />
                                            <span>Bloco pausado</span>
                                        </div>
                                    </div>
                                )}

                                {resumo}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
