/**
 * Componente de Resumo de Evoluções com IA
 * Interface profissional para gerar e visualizar resumo das sessões
 */

import { useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Copy, Check, AlertTriangle, FileText, Info } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
    generateProntuarioSummaryWithAI, 
    calculatePeriodLabel,
    formatDateForSummary,
    type ProntuarioEvolutionForAI,
} from '../services/ai.service';

interface ResumoIAProps {
    evolutions: Array<{
        id: string;
        numeroSessao: number;
        dataEvolucao: string;
        descricaoSessao: string;
    }>;
    patientName: string;
    therapistName: string;
}

export default function ResumoIA({ evolutions, patientName, therapistName }: ResumoIAProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [disclaimer, setDisclaimer] = useState<string | null>(null);
    const [sessionsUsed, setSessionsUsed] = useState<number>(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Verifica se há evoluções suficientes
    const hasEvolutions = evolutions.length > 0;
    const minEvolutionsForSummary = 1;
    const canGenerate = evolutions.length >= minEvolutionsForSummary;

    // Gerar resumo
    const handleGenerateSummary = useCallback(async () => {
        if (!canGenerate) return;

        setIsGenerating(true);
        setError(null);

        try {
            // Prepara as evoluções para a API
            const evolutionsForAI: ProntuarioEvolutionForAI[] = evolutions.map(ev => ({
                numeroSessao: ev.numeroSessao,
                data: formatDateForSummary(ev.dataEvolucao),
                descricaoSessao: ev.descricaoSessao,
            }));

            const periodLabel = calculatePeriodLabel(evolutionsForAI);

            const result = await generateProntuarioSummaryWithAI({
                evolutions: evolutionsForAI,
                patientName,
                therapistName,
                periodLabel,
            });

            setSummary(result.summary);
            setDisclaimer(result.disclaimer);
            setSessionsUsed(result.sessionsUsed);
            toast.success('Resumo gerado com sucesso!');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao gerar resumo';
            setError(message);
            toast.error(message);
        } finally {
            setIsGenerating(false);
        }
    }, [evolutions, patientName, therapistName, canGenerate]);

    // Copiar resumo
    const handleCopy = useCallback(async () => {
        if (!summary) return;

        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            toast.success('Resumo copiado para a área de transferência');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Erro ao copiar resumo');
        }
    }, [summary]);

    // Estado inicial - sem resumo gerado
    if (!summary) {
        return (
            <Card className="border-dashed">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Resumo com IA</CardTitle>
                            <CardDescription className="text-xs">
                                Gere um resumo das evoluções terapêuticas
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {!hasEvolutions ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                Nenhuma evolução registrada ainda.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Registre evoluções para gerar um resumo.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>
                                        A IA irá analisar <strong>{evolutions.length} {evolutions.length === 1 ? 'evolução' : 'evoluções'}</strong> registradas 
                                        e gerar um resumo organizado dos temas trabalhados e do percurso terapêutico.
                                    </p>
                                    <p>
                                        O resumo é baseado <strong>exclusivamente</strong> no que foi registrado e requer revisão do profissional.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button 
                                onClick={handleGenerateSummary} 
                                disabled={isGenerating || !canGenerate}
                                className="w-full"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Gerando resumo...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Gerar Resumo com IA
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Estado com resumo gerado
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Resumo com IA</CardTitle>
                            <CardDescription className="text-xs">
                                Baseado em {sessionsUsed} {sessionsUsed === 1 ? 'sessão' : 'sessões'}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copiar
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateSummary}
                            disabled={isGenerating}
                            className="h-8"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                            Regenerar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                {/* Disclaimer */}
                {disclaimer && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{disclaimer}</span>
                    </div>
                )}

                {/* Resumo */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {summary}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
