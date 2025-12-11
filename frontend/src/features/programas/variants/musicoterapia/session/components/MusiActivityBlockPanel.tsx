import { useEffect, useState, useRef, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Check, Flag, Hand, Pause, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type ResultadoTentativa = 'nao-desempenhou' | 'desempenhou-com-ajuda' | 'desempenhou';

export type BlockCounts = {
    'nao-desempenhou': number;
    'desempenhou-com-ajuda': number;
    desempenhou: number;
};

export type ActivitySummary = {
    id: string;
    nome: string;
    indice?: number;
};

export type ActivityBlockPanelProps = {
    sessionId: string;
    descricaoCurtoPrazo: string;
    descricaoAplicacao: string;
    activity: ActivitySummary;
    paused: boolean;
    counts: BlockCounts;
    onCreateAttempt: (resultado: ResultadoTentativa, durationMinutes?: number) => void;
    onRemoveAttempt?: (resultado: ResultadoTentativa) => void;
    onPause: () => void;
    onFinalizarBloco: (durationMinutes?: number) => void;
    // Props para participação e suporte (gerenciados pelo pai)
    participacao: string;
    setParticipacao: (value: string) => void;
    suporte: string;
    setSuporte: (value: string) => void;
};

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
    
    // Refs para sempre ter acesso às versões mais recentes dos callbacks
    const onIncrementRef = useRef(onIncrement);
    const onDecrementRef = useRef(onDecrement);
    onIncrementRef.current = onIncrement;
    onDecrementRef.current = onDecrement;

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
        }, 500);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (disabled) return;

        const isLongPress = isLongPressing;
        setIsLongPressing(false);

        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        const deltaX = e.clientX - touchStartX.current;
        const deltaY = e.clientY - touchStartY.current;
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        const isSwipeLeft = isHorizontalSwipe && deltaX < -50;

        if (isSwipeLeft) {
            onDecrementRef.current();
            triggerHaptic();
            showFeedback('-1');
            return;
        }

        if (isLongPress) {
            onDecrementRef.current();
            showFeedback('-1');
        } else {
            onIncrementRef.current();
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

// Componente separado para cada botão - permite usar hooks corretamente
function GestureButton({
    option,
    iconClasses,
    counts,
    paused,
    onCreateAttempt,
    onRemoveAttempt,
}: {
    option: { key: ResultadoTentativa; label: string; icon: JSX.Element; tooltip: string };
    iconClasses: Record<ResultadoTentativa, string>;
    counts: BlockCounts;
    paused: boolean;
    onCreateAttempt: (resultado: ResultadoTentativa, durationMinutes?: number) => void;
    onRemoveAttempt?: (resultado: ResultadoTentativa) => void;
}) {
    const gesture = useGestureHandler(
        () => {
            // Participação e suporte são aplicados ao FINALIZAR o bloco, não aqui
            onCreateAttempt(option.key, undefined);
        },
        () => {
            if (onRemoveAttempt && counts[option.key] > 0) {
                onRemoveAttempt(option.key);
            }
        },
        paused
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative">
                    <Button
                        className={`h-20 w-full rounded-lg justify-start px-4 border border-border/40 dark:border-white/15 transition-all select-none touch-none ${
                            gesture.isLongPressing ? 'scale-95 ring-2 ring-blue-500' : ''
                        }`}
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                        variant="outline"
                        disabled={paused}
                        {...gesture.handlers}
                    >
                        <div className={iconClasses[option.key]}>{option.icon}</div>
                        <div className="text-left">
                            <div className="font-semibold flex items-center gap-2">
                                {option.label}
                                <div className="p-2 rounded-[5px]">{counts[option.key]}</div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{option.tooltip}</div>
                        </div>
                    </Button>

                    {gesture.showFloatingNumber && (
                        <div
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold pointer-events-none animate-float-up ${
                                gesture.showFloatingNumber === '+1' ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {gesture.showFloatingNumber}
                        </div>
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs">{option.tooltip}</TooltipContent>
        </Tooltip>
    );
}

export default function MusiActivityBlockPanel({
    sessionId,
    descricaoCurtoPrazo,
    descricaoAplicacao,
    activity,
    paused,
    counts,
    onCreateAttempt,
    onRemoveAttempt,
    onPause,
    onFinalizarBloco,
    participacao,
    setParticipacao,
    suporte,
    setSuporte,
}: ActivityBlockPanelProps) {
    void sessionId;
    void descricaoCurtoPrazo;
    void descricaoAplicacao;
    void activity;

    const participacaoOptions = [
        { value: '0', label: '0 - Não participa' },
        { value: '1', label: '1 - Percebe, mas não participa' },
        { value: '2', label: '2 - Percebe, tenta participar, mas não consegue' },
        { value: '3', label: '3 - Participa, mas não como esperado' },
        { value: '4', label: '4 - Participa conforme esperado' },
        { value: '5', label: '5 - Participa e supera as expectativas' },
    ];

    const suporteOptions = [
        { value: '1', label: '1 - Sem suporte (independente)' },
        { value: '2', label: '2 - Mínimo (verbal)' },
        { value: '3', label: '3 - Visual' },
        { value: '4', label: '4 - Moderado (parcialmente físico)' },
        { value: '5', label: '5 - Máximo (totalmente físico)' },
    ];

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
                onCreateAttempt('nao-desempenhou', undefined);
                return;
            }

            if (event.key === '2' && !paused) {
                event.preventDefault();
                onCreateAttempt('desempenhou-com-ajuda', undefined);
                return;
            }

            if (event.key === '3' && !paused) {
                event.preventDefault();
                onCreateAttempt('desempenhou', undefined);
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
            key: 'nao-desempenhou',
            label: 'NÃO DESEMPENHOU',
            icon: <X className="mr-3 h-5 w-5" />,
            tooltip: 'Não realizou a atividade',
        },
        {
            key: 'desempenhou-com-ajuda',
            label: 'DESEMPENHOU COM AJUDA',
            icon: <Hand className="mr-3 h-5 w-5" />,
            tooltip: 'Realizou a atividade com ajuda',
        },
        {
            key: 'desempenhou',
            label: 'DESEMPENHOU',
            icon: <Check className="mr-3 h-5 w-5" />,
            tooltip: 'Realizou a atividade de forma independente',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Participação e Suporte lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Participação */}
                <div className="space-y-2">
                    <Label htmlFor="participacao" className="text-sm font-medium">
                        Participação
                    </Label>
                    <Select
                        value={participacao}
                        onValueChange={setParticipacao}
                        disabled={paused}
                    >
                        <SelectTrigger id="participacao">
                            <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                            {participacaoOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Suporte */}
                <div className="space-y-2">
                    <Label htmlFor="suporte" className="text-sm font-medium">
                        Suporte
                    </Label>
                    <Select
                        value={suporte}
                        onValueChange={setSuporte}
                        disabled={paused}
                    >
                        <SelectTrigger id="suporte">
                            <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                            {suporteOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            <div className="space-y-1 mb-4">
                <div className="text-sm font-medium">
                    Registre esta atividade
                </div>
                <div className="text-xs text-muted-foreground">
                    <strong>Toque</strong> para adicionar (+1) • <strong>Segure</strong> para remover
                    (-1) • <strong>Deslize ←</strong> para remover rápido
                </div>
            </div>

            <TooltipProvider>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {attemptOptions.map((option) => {
                        const iconClasses = {
                            'nao-desempenhou': 'text-red-600',
                            'desempenhou-com-ajuda': 'text-amber-600',
                            desempenhou: 'text-green-600',
                        };

                        return (
                            <GestureButton
                                key={option.key}
                                option={option}
                                iconClasses={iconClasses}
                                counts={counts}
                                paused={paused}
                                onCreateAttempt={onCreateAttempt}
                                onRemoveAttempt={onRemoveAttempt}
                            />
                        );
                    })}
                </div>
            </TooltipProvider>

            <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onPause}
                    className="h-9 rounded-[5px]"
                >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                </Button>
                <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                        onFinalizarBloco(undefined);
                    }}
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
