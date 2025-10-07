import { useMemo, useState } from 'react';
import { Brain, ChevronDown, ChevronRight, Pause as PauseIcon, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StimulusBlockPanel, {
    type BlockCounts,
    type ResultadoTentativa,
    type StimulusSummary,
} from './StimulusBlockPanel';
import type { ProgramDetail, SessionAttempt, SessionAttemptType } from '../types';

type BlockResumo = {
    erro: number;
    ajuda: number;
    indep: number;
    total: number;
    ts: number;
};

const createEmptyCounts = (): BlockCounts => ({ erro: 0, ajuda: 0, indep: 0 });

interface StimuliPanelProps {
    program: ProgramDetail;
    attempts: SessionAttempt[];
    onAddAttempt: (attempt: SessionAttempt) => void;
    sessionId?: string;
}

export default function StimuliPanel({
    program,
    attempts,
    onAddAttempt,
    sessionId,
}: StimuliPanelProps) {
    const [ativoId, setAtivoId] = useState<string | null>(null);
    const [countsMap, setCountsMap] = useState<Record<string, BlockCounts>>({});
    const [pausedMap, setPausedMap] = useState<Record<string, boolean>>({});
    const [historico, setHistorico] = useState<Record<string, BlockResumo[]>>({});

    const activeStimuli = useMemo(
        () => program.stimuli.filter((stimulus) => stimulus.active),
        [program.stimuli],
    );

    const activeStimulus = useMemo(
        () => activeStimuli.find((stimulus) => stimulus.id === ativoId) ?? null,
        [activeStimuli, ativoId],
    );

    const effectiveSessionId = sessionId ?? program.id ?? 'draft-session';

    const registrarTentativa = (resultado: ResultadoTentativa) => {
        if (!ativoId || !activeStimulus) {
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

        const stimulusAttempts = attempts.filter((attempt) => attempt.stimulusId === ativoId);
        const attemptNumber = stimulusAttempts.length + 1;

        const tipoSessao: SessionAttemptType =
            resultado === 'erro' ? 'error' : resultado === 'ajuda' ? 'prompted' : 'independent';

        const novoAttempto: SessionAttempt = {
            id: `attempt-${Date.now()}-${Math.random()}`,
            attemptNumber,
            stimulusId: ativoId,
            stimulusLabel: activeStimulus.label,
            type: tipoSessao,
            timestamp: new Date().toISOString(),
        };

        onAddAttempt(novoAttempto);
    };

    const handleSelectStimulus = (stimulusId: string) => {
        if (ativoId === stimulusId) {
            setAtivoId(null);
            return;
        }

        setAtivoId(stimulusId);
        setPausedMap((prev) => ({ ...prev, [stimulusId]: false }));
        setCountsMap((prev) => {
            if (prev[stimulusId]) {
                return prev;
            }
            return { ...prev, [stimulusId]: createEmptyCounts() };
        });
    };

    const pausarBloco = () => {
        if (!ativoId) {
            return;
        }

        setPausedMap((prev) => ({ ...prev, [ativoId]: true }));
        setAtivoId(null);
    };

    const finalizarBloco = () => {
        if (!ativoId) {
            return;
        }

        const counts = countsMap[ativoId] ?? createEmptyCounts();
        const resumo: BlockResumo = {
            ...counts,
            total: counts.erro + counts.ajuda + counts.indep,
            ts: Date.now(),
        };

        setHistorico((prev) => {
            const atual = prev[ativoId] ? [...prev[ativoId]] : [];
            atual.push(resumo);
            return { ...prev, [ativoId]: atual };
        });

        setCountsMap((prev) => {
            const copia = { ...prev };
            delete copia[ativoId];
            return copia;
        });

        setPausedMap((prev) => ({ ...prev, [ativoId]: false }));
        setAtivoId(null);
    };

    const renderResumo = (stimulusId: string) => {
        const resumoDoStimulo = historico[stimulusId];
        if (!resumoDoStimulo || resumoDoStimulo.length === 0) {
            return null;
        }

        return (
            <div className="space-y-0">
                {resumoDoStimulo.map((item, index) => (
                    <div key={item.ts}>
                        {index > 0 && <Separator />}
                        <div className="px-4 py-3 text-xs">
                            <div className="font-semibold text-sm mb-2 text-foreground">
                                Tentativa {index + 1}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Erro:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                    >
                                        {item.erro}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Ajuda:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="bg-amber-50 text-amber-700 border-amber-200"
                                    >
                                        {item.ajuda}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Indep.:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200"
                                    >
                                        {item.indep}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Total:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary border-primary/30 font-semibold"
                                    >
                                        {item.total}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (activeStimuli.length === 0) {
        return (
            <Card className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Estimulos em treino
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum estimulo ativo encontrado para este programa</p>
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
                    Estimulos em treino
                    <Badge variant="secondary" className="ml-2">
                        {activeStimuli.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                <div className="space-y-2">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                            Objetivo a curto prazo
                        </div>
                        <div className="text-sm leading-relaxed bg-muted/50 border border-border rounded-[5px] p-3">
                            {program.shortTermGoalDescription ?? 'Sem descrição informada.'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                            Descrição da aplicação
                        </div>
                        <div className="text-sm leading-relaxed bg-muted/50 border border-border rounded-[5px] p-3">
                            {program.stimuliApplicationDescription ?? 'Sem descrição informada.'}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {activeStimuli.map((stimulus) => {
                        const isActive = ativoId === stimulus.id;
                        const resumo = renderResumo(stimulus.id);
                        const estaPausado = pausedMap[stimulus.id] ?? false;
                        const counts = countsMap[stimulus.id] ?? createEmptyCounts();
                        const stimulusSummary: StimulusSummary = {
                            id: stimulus.id,
                            nome: stimulus.label,
                            indice: stimulus.order,
                        };

                        return (
                            <div
                                key={stimulus.id}
                                className="rounded-[5px] border bg-card shadow-sm"
                            >
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                            {stimulus.order}
                                        </div>
                                        <div className="truncate font-medium text-sm text-foreground">
                                            {stimulus.label}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant={isActive ? 'secondary' : 'outline'}
                                            onClick={() => handleSelectStimulus(stimulus.id)}
                                        >
                                            <Play className="h-4 w-4 mr-2" /> Iniciar
                                        </Button>
                                        <button
                                            onClick={() => handleSelectStimulus(stimulus.id)}
                                            className="p-1 hover:bg-muted rounded transition-colors"
                                            aria-label={isActive ? 'Fechar' : 'Abrir'}
                                        >
                                            {isActive ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Separator />

                                {isActive && (
                                    <div className="px-4 pb-4">
                                        <div className="pt-4">
                                            <StimulusBlockPanel
                                                sessionId={effectiveSessionId}
                                                descricaoCurtoPrazo={
                                                    program.shortTermGoalDescription ?? ''
                                                }
                                                descricaoAplicacao={
                                                    program.stimuliApplicationDescription ?? ''
                                                }
                                                stimulus={stimulusSummary}
                                                paused={estaPausado}
                                                counts={counts}
                                                onCreateAttempt={registrarTentativa}
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
