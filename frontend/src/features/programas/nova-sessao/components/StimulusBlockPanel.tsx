import { useEffect, useState, useRef, type JSX } from 'react';
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
    onRemoveAttempt?: (resultado: ResultadoTentativa) => void; // Nova prop para decrementar
    onPause: () => void;
    onFinalizarBloco: () => void;
};

// Hook para gerenciar gestos (long press + swipe)
function useGestureHandler(
    onIncrement: () => void,
    onDecrement: () => void,
    disabled: boolean
) {
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [showFloatingNumber, setShowFloatingNumber] = useState<'+1' | '-1' | null>(null);
    const longPressTimer = useRef<number | null>(null);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);

    const triggerHaptic = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    };

    const showFeedback = (type: '+1' | '-1') => {
        setShowFloatingNumber(type);
        setTimeout(() => setShowFloatingNumber(null), 600);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disabled) return;

        touchStartX.current = e.clientX;
        touchStartY.current = e.clientY;

        longPressTimer.current = window.setTimeout(() => {
            setIsLongPressing(true);
            triggerHaptic();
        }, 500); // 500ms para long press
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (disabled) return;

        const isLongPress = isLongPressing;
        setIsLongPressing(false);

        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        // Detectar swipe
        const deltaX = e.clientX - touchStartX.current;
        const deltaY = e.clientY - touchStartY.current;
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        const isSwipeLeft = isHorizontalSwipe && deltaX < -50;

        if (isSwipeLeft) {
            // Swipe left = decrementar
            onDecrement();
            triggerHaptic();
            showFeedback('-1');
            return;
        }

        if (isLongPress) {
            // Long press = decrementar
            onDecrement();
            showFeedback('-1');
        } else {
            // Tap normal = incrementar
            onIncrement();
            showFeedback('+1');
        }
    };

    const handlePointerCancel = () => {
        setIsLongPressing(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    return {
        isLongPressing,
        showFloatingNumber,
        handlers: {
            onPointerDown: handlePointerDown,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerCancel,
            onPointerLeave: handlePointerCancel,
        },
    };
}

export default function StimulusBlockPanel({
    sessionId,
    descricaoCurtoPrazo,
    descricaoAplicacao,
    stimulus,
    paused,
    counts,
    onCreateAttempt,
    onRemoveAttempt,
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
                    <strong>Toque</strong> para adicionar (+1) • <strong>Segure</strong> para remover
                    (-1) • <strong>Deslize ←</strong> para remover rápido
                </div>
            </div>

            <TooltipProvider>
                <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    aria-label="Registrar tentativa"
                >
                    {attemptOptions.map((option) => {
                        const iconClasses = {
                            erro: 'text-red-600',
                            ajuda: 'text-amber-600',
                            indep: 'text-green-600',
                        };

                        // Hook de gestos para este botão específico
                        const gesture = useGestureHandler(
                            () => onCreateAttempt(option.key),
                            () => {
                                if (onRemoveAttempt && counts[option.key] > 0) {
                                    onRemoveAttempt(option.key);
                                }
                            },
                            paused
                        );

                        return (
                            <Tooltip key={option.key}>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        <Button
                                            className={`h-20 w-full rounded-[5px] justify-start px-4 bg-muted hover:bg-muted/70 border-border transition-all select-none touch-none ${
                                                gesture.isLongPressing
                                                    ? 'scale-95 ring-2 ring-blue-500'
                                                    : ''
                                            }`}
                                            variant="outline"
                                            disabled={paused}
                                            {...gesture.handlers}
                                            data-testid={`btn-${option.key}`}
                                        >
                                            <div className={iconClasses[option.key]}>
                                                {option.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold flex items-center gap-2">
                                                    {option.label}
                                                    <div className="p-2 rounded-[5px]">
                                                        {counts[option.key]}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {option.tooltip}
                                                </div>
                                            </div>
                                        </Button>

                                        {/* Número flutuante animado */}
                                        {gesture.showFloatingNumber && (
                                            <div
                                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold pointer-events-none animate-float-up ${
                                                    gesture.showFloatingNumber === '+1'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {gesture.showFloatingNumber}
                                            </div>
                                        )}
                                    </div>
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
