import { useMemo, useState } from 'react';
import { Brain, Pause as PauseIcon, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
    // Armazena tentativas temporárias do bloco ativo (não enviadas ainda)
    const [tempAttempts, setTempAttempts] = useState<Record<string, SessionAttempt[]>>({});

    const shortTermGoalDescription =
        program.shortTermGoalDescription ?? program.goalDescription ?? null;

    const applicationDescription = program.stimuliApplicationDescription ?? null;

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

        // Calcula o número da tentativa baseado nas tentativas já salvas + temporárias
        const stimulusAttempts = attempts.filter((attempt) => attempt.stimulusId === ativoId);
        const tempStimulusAttempts = tempAttempts[ativoId] ?? [];
        const attemptNumber = stimulusAttempts.length + tempStimulusAttempts.length + 1;

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

        // Armazena temporariamente em vez de enviar imediatamente
        setTempAttempts((prev) => {
            const atual = prev[ativoId] ?? [];
            return { ...prev, [ativoId]: [...atual, novoAttempto] };
        });
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

        // Limpa as tentativas temporárias quando pausar (não finalizado)
        setTempAttempts((prev) => {
            const copia = { ...prev };
            delete copia[ativoId];
            return copia;
        });

        // Limpa os contadores também
        setCountsMap((prev) => {
            const copia = { ...prev };
            delete copia[ativoId];
            return copia;
        });

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

        // Envia todas as tentativas temporárias para o registro geral
        const tempStimulusAttempts = tempAttempts[ativoId] ?? [];
        tempStimulusAttempts.forEach((attempt) => {
            onAddAttempt(attempt);
        });

        // Limpa as tentativas temporárias deste estímulo
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
                                <Badge variant="outline" className="p-2 rounded-[5px]">
                                    Erro: {item.erro}
                                </Badge>
                                <Badge variant="outline" className="p-2 rounded-[5px]">
                                    Ajuda: {item.ajuda}
                                </Badge>
                                <Badge variant="outline" className="p-2 rounded-[5px]">
                                    Indep.: {item.indep}
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

                {shortTermGoalDescription && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">
                            Descrição detalhada do objetivo a curto prazo:
                        </Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {shortTermGoalDescription}
                            </p>
                        </div>
                    </div>
                )}

                {applicationDescription && applicationDescription.trim().length > 0 && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">Descrição da Aplicação</Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {applicationDescription}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Esta descrição é aplicada a todos os estímulos do programa.
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
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
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
                                            {stimulus.order}
                                        </div>
                                        <div className="truncate font-medium text-sm text-foreground">
                                            {stimulus.label}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleSelectStimulus(stimulus.id)}
                                        >
                                            <Play className="h-4 w-4 mr-2" /> Iniciar
                                        </Button>
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
