import { useEffect, type JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Flag, Hand, Pause, X } from 'lucide-react';

export type ResultadoTentativa = 'erro' | 'ajuda' | 'indep';

export type BlockCounts = {
    erro: number;
    ajuda: number;
    indep: number;
};

export type StimulusSummary = {
    id: string;
    nome: string;
    indice?: number;
};

export type StimulusBlockPanelProps = {
    sessionId: string;
    descricaoCurtoPrazo: string;
    descricaoAplicacao: string;
    stimulus: StimulusSummary;
    paused: boolean;
    counts: BlockCounts;
    onCreateAttempt: (resultado: ResultadoTentativa) => void;
    onPause: () => void;
    onFinalizarBloco: () => void;
};

export default function StimulusBlockPanel({
    sessionId,
    descricaoCurtoPrazo,
    descricaoAplicacao,
    stimulus,
    paused,
    counts,
    onCreateAttempt,
    onPause,
    onFinalizarBloco,
}: StimulusBlockPanelProps) {
    // sessionId, descricaoCurtoPrazo, descricaoAplicacao e stimulus reservados
    void sessionId;
    void descricaoCurtoPrazo;
    void descricaoAplicacao;
    void stimulus;

    useEffect(() => {
        const handleHotkeys = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            if (event.key === '1' && !paused) {
                event.preventDefault();
                onCreateAttempt('erro');
                return;
            }

            if (event.key === '2' && !paused) {
                event.preventDefault();
                onCreateAttempt('ajuda');
                return;
            }

            if (event.key === '3' && !paused) {
                event.preventDefault();
                onCreateAttempt('indep');
                return;
            }

            if (event.key.toLowerCase() === 'p') {
                event.preventDefault();
                onPause();
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                onFinalizarBloco();
            }
        };

        window.addEventListener('keydown', handleHotkeys);
        return () => {
            window.removeEventListener('keydown', handleHotkeys);
        };
    }, [onCreateAttempt, onFinalizarBloco, onPause, paused]);

    const attemptOptions: Array<{
        key: ResultadoTentativa;
        label: string;
        icon: JSX.Element;
        tooltip: string;
    }> = [
        {
            key: 'erro',
            label: 'ERRO',
            icon: <X className="mr-3 h-5 w-5" />,
            tooltip: 'Resposta incorreta ou sem resposta',
        },
        {
            key: 'ajuda',
            label: 'AJUDA',
            icon: <Hand className="mr-3 h-5 w-5" />,
            tooltip: 'Resposta com ajuda ou dica',
        },
        {
            key: 'indep',
            label: 'INDEP.',
            icon: <Check className="mr-3 h-5 w-5" />,
            tooltip: 'Resposta independente e correta',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="space-y-1 mb-4">
                <div className="text-sm font-medium" data-testid="stimulus-helper-title">
                    Registre este estímulo
                </div>
                <div className="text-xs text-muted-foreground" data-testid="stimulus-helper-text">
                    Clique nos cartões para marcar ERRO, AJUDA ou INDEP. Um clique = 1 tentativa. Ao
                    concluir, finalize o bloco.
                </div>
            </div>

            <TooltipProvider>
                <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    aria-label="Registrar tentativa"
                >
                    {attemptOptions.map((option) => {
                        const colorClasses = {
                            erro: 'border-red-200 hover:bg-red-50 hover:border-red-300',
                            ajuda: 'border-amber-200 hover:bg-amber-50 hover:border-amber-300',
                            indep: 'border-green-200 hover:bg-green-50 hover:border-green-300',
                        };
                        const badgeClasses = {
                            erro: 'bg-red-100 text-red-700 border-red-300',
                            ajuda: 'bg-amber-100 text-amber-700 border-amber-300',
                            indep: 'bg-green-100 text-green-700 border-green-300',
                        };
                        const iconClasses = {
                            erro: 'text-red-600',
                            ajuda: 'text-amber-600',
                            indep: 'text-green-600',
                        };

                        return (
                            <Tooltip key={option.key}>
                                <TooltipTrigger asChild>
                                    <Button
                                        className={`h-20 rounded-[5px] justify-start px-4 transition-all ${colorClasses[option.key]}`}
                                        variant="outline"
                                        disabled={paused}
                                        onClick={() => onCreateAttempt(option.key)}
                                        data-testid={`btn-${option.key}`}
                                    >
                                        <div className={iconClasses[option.key]}>{option.icon}</div>
                                        <div className="text-left">
                                            <div className="font-semibold flex items-center gap-2">
                                                {option.label}
                                                <Badge
                                                    variant="outline"
                                                    className={`${badgeClasses[option.key]}`}
                                                >
                                                    {counts[option.key]}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {option.tooltip}
                                            </div>
                                        </div>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                    {option.tooltip}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>

            <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onPause}
                    data-testid="btn-pause"
                    className="h-9 rounded-[5px]"
                >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                </Button>
                <Button
                    size="sm"
                    variant="default"
                    onClick={onFinalizarBloco}
                    data-testid="btn-finalizar"
                    className="h-9 rounded-[5px]"
                >
                    <Flag className="h-4 w-4 mr-2" />
                    Finalizar bloco
                </Button>
            </div>

            <Separator />
        </div>
    );
}
