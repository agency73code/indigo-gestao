import { useMemo, useState } from 'react';
import { Music, ChevronRight, Pause as PauseIcon, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import MusiActivityBlockPanel, {
    type BlockCounts,
    type ResultadoTentativa,
    type ActivitySummary,
} from './MusiActivityBlockPanel';
import type { MusiProgramDetail, MusiSessionAttempt, MusiPerformanceType } from '../types';

type BlockResumo = {
    'nao-desempenhou': number;
    'desempenhou-com-ajuda': number;
    desempenhou: number;
    total: number;
    ts: number;
    avgParticipacao: number | null;
    avgSuporte: number | null;
};

const createEmptyCounts = (): BlockCounts => ({ 'nao-desempenhou': 0, 'desempenhou-com-ajuda': 0, desempenhou: 0 });

interface MusiActivitiesPanelProps {
    program: MusiProgramDetail;
    attempts: MusiSessionAttempt[];
    onAddAttempt: (attempt: MusiSessionAttempt) => void;
    sessionId?: string;
}

export default function MusiActivitiesPanel({
    program,
    attempts,
    onAddAttempt,
    sessionId,
}: MusiActivitiesPanelProps) {
    const [ativoId, setAtivoId] = useState<string | null>(null);
    const [countsMap, setCountsMap] = useState<Record<string, BlockCounts>>({});
    const [pausedMap, setPausedMap] = useState<Record<string, boolean>>({});
    const [historico, setHistorico] = useState<Record<string, BlockResumo[]>>({});
    const [tempAttempts, setTempAttempts] = useState<Record<string, MusiSessionAttempt[]>>({});
    
    // Estados para participação e suporte - compartilhados e aplicados ao finalizar
    const [participacao, setParticipacao] = useState<string>('');
    const [suporte, setSuporte] = useState<string>('');

    const shortTermGoalDescription = program.shortTermGoalDescription ?? null;

    const activeActivities = useMemo(
        () => program.activities.filter((activity) => activity.active),
        [program.activities],
    );

    const activeActivity = useMemo(
        () => activeActivities.find((activity) => activity.id === ativoId) ?? null,
        [activeActivities, ativoId],
    );

    const effectiveSessionId = sessionId ?? program.id ?? 'draft-session';

    const registrarTentativa = (resultado: ResultadoTentativa, durationMinutes?: number) => {
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

        const activityAttempts = attempts.filter((attempt) => attempt.activityId === ativoId);
        const tempActivityAttempts = tempAttempts[ativoId] ?? [];
        const attemptNumber = activityAttempts.length + tempActivityAttempts.length + 1;

        const tipoSessao: MusiPerformanceType =
            resultado === 'nao-desempenhou' ? 'nao-desempenhou' : resultado === 'desempenhou-com-ajuda' ? 'desempenhou-com-ajuda' : 'desempenhou';

        // NÃO salva participação/suporte aqui - será aplicado ao finalizar o bloco
        const novoAttempto: MusiSessionAttempt = {
            id: `attempt-${Date.now()}-${Math.random()}`,
            attemptNumber,
            activityId: ativoId,
            activityLabel: activeActivity.label,
            type: tipoSessao,
            timestamp: new Date().toISOString(),
            durationMinutes,
        };

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
            return;
        }

        setCountsMap((prev) => {
            const atual = prev[ativoId] ?? createEmptyCounts();
            const proximo: BlockCounts = {
                ...atual,
                [resultado]: Math.max(0, atual[resultado] - 1),
            } as BlockCounts;
            return { ...prev, [ativoId]: proximo };
        });

        setTempAttempts((prev) => {
            const tempActivityAttempts = prev[ativoId] ?? [];
            
            const tipoSessao: MusiPerformanceType =
                resultado === 'nao-desempenhou' ? 'nao-desempenhou' : resultado === 'desempenhou-com-ajuda' ? 'desempenhou-com-ajuda' : 'desempenhou';
            
            const indiceUltimo = tempActivityAttempts
                .map((a, i) => ({ attempt: a, index: i }))
                .filter((item) => item.attempt.type === tipoSessao)
                .pop()?.index;

            if (indiceUltimo === undefined) {
                return prev;
            }

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
        setAtivoId(null);
    };

    const finalizarBloco = (durationMinutes?: number) => {
        if (!ativoId) {
            return;
        }

        const counts = countsMap[ativoId] ?? createEmptyCounts();
        
        // Pegar valores atuais de participação e suporte
        const participacaoValue = participacao ? parseInt(participacao, 10) : undefined;
        const suporteValue = suporte ? parseInt(suporte, 10) : undefined;
        
        // Usar os valores atuais dos selects para o resumo
        const avgParticipacao = participacaoValue !== undefined && !isNaN(participacaoValue) ? participacaoValue : null;
        const avgSuporte = suporteValue !== undefined && !isNaN(suporteValue) ? suporteValue : null;
        
        const resumo: BlockResumo = {
            ...counts,
            total: counts['nao-desempenhou'] + counts['desempenhou-com-ajuda'] + counts.desempenhou,
            ts: Date.now(),
            avgParticipacao,
            avgSuporte,
        };

        setHistorico((prev) => {
            const atual = prev[ativoId] ? [...prev[ativoId]] : [];
            atual.push(resumo);
            return { ...prev, [ativoId]: atual };
        });

        // Aplicar participação e suporte a TODAS as tentativas ao finalizar
        const tempActivityAttempts = tempAttempts[ativoId] ?? [];
        tempActivityAttempts.forEach((attempt) => {
            onAddAttempt({
                ...attempt,
                durationMinutes: durationMinutes || attempt.durationMinutes,
                participacao: participacaoValue,
                suporte: suporteValue,
            });
        });

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
        
        // Limpar os selects para o próximo bloco/atividade
        setParticipacao('');
        setSuporte('');
        
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
                                Bloco {index + 1}
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
                                
                                {/* Badges de Participação e Suporte de Musicoterapia */}
                                {item.avgParticipacao !== null && (
                                    <Badge variant="outline" className="p-2 rounded-[5px] text-purple-700 bg-purple-50">
                                        Participação: {item.avgParticipacao.toFixed(1)}
                                    </Badge>
                                )}
                                {item.avgSuporte !== null && (
                                    <Badge variant="outline" className="p-2 rounded-[5px] text-indigo-700 bg-indigo-50">
                                        Suporte: {item.avgSuporte.toFixed(1)}
                                    </Badge>
                                )}
                                
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
                        <Music className="h-4 w-4" />
                        Atividades em treino
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                    <Music className="h-4 w-4" />
                    Objetivo Específico
                    <Badge variant="secondary" className="ml-2">
                        {activeActivities.length}
                    </Badge>
                </CardTitle>
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
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0">
                                                {activity.order}
                                            </div>
                                            <div className="font-medium text-sm text-foreground truncate flex items-center gap-2">
                                                {activity.label}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => handleSelectActivity(activity.id)}
                                            className="shrink-0"
                                        >
                                            <Play className="h-4 w-4 mr-2" /> Iniciar
                                        </Button>
                                    </div>

                                    {/* Informações da atividade em formato expansível */}
                                    <details className="mt-3">
                                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
                                            <ChevronRight className="h-3 w-3 transition-transform [details[open]_&]:rotate-90" />
                                            Ver descrição
                                        </summary>
                                        <div className="mt-3 space-y-3">
                                            {/* Grid com Objetivo Específico e Métodos lado a lado */}
                                            {(activity.description || activity.metodos) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {activity.description && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                OBJETIVO ESPECÍFICO
                                                            </p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {activity.metodos && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                MÉTODOS
                                                            </p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                                {activity.metodos}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Técnicas/Procedimentos em largura completa */}
                                            {activity.tecnicasProcedimentos && (
                                                <div className="pt-3 border-t space-y-1">
                                                    <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        TÉCNICAS/PROCEDIMENTOS
                                                    </p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                                                        {activity.tecnicasProcedimentos}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                </div>

                                <Separator />

                                {isActive && (
                                    <div className="px-4 pb-4">
                                        <div className="pt-4">
                                            <MusiActivityBlockPanel
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
                                                participacao={participacao}
                                                setParticipacao={setParticipacao}
                                                suporte={suporte}
                                                setSuporte={setSuporte}
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
