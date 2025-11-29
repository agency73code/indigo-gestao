import { useEffect, useState, useRef, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';
import { InputField } from '@/ui/input-field';
import { TextAreaField } from '@/ui/textarea-field';
import { Check, Flag, Hand, Pause, X } from 'lucide-react';

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
    descricaoAplicacao: string;
    activity: ActivitySummary;
    paused: boolean;
    counts: BlockCounts;
    onCreateAttempt: (resultado: ResultadoTentativa, durationMinutes?: number) => void;
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

export default function ToActivityBlockPanel({
    sessionId,
    descricaoAplicacao,
    activity,
    paused,
    counts,
    onCreateAttempt,
    onRemoveAttempt,
    onPause,
    onFinalizarBloco,
}: ActivityBlockPanelProps) {
    // sessionId, descricaoAplicacao e activity reservados
    void sessionId;
    void descricaoAplicacao;
    void activity;

    const [durationMinutes, setDurationMinutes] = useState<string>('');
    
    // Estados específicos de Fisioterapia
    const [usedLoad, setUsedLoad] = useState<string>('nao');
    const [loadValue, setLoadValue] = useState<string>('');
    const [hadDiscomfort, setHadDiscomfort] = useState<string>('nao');
    const [discomfortDescription, setDiscomfortDescription] = useState<string>('');
    const [hadCompensation, setHadCompensation] = useState<string>('nao');
    const [compensationDescription, setCompensationDescription] = useState<string>('');

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

            const minutes = durationMinutes ? parseInt(durationMinutes, 10) : undefined;

            if (event.key === '1' && !paused) {
                event.preventDefault();
                onCreateAttempt('nao-desempenhou', minutes);
                return;
            }

            if (event.key === '2' && !paused) {
                event.preventDefault();
                onCreateAttempt('desempenhou-com-ajuda', minutes);
                return;
            }

            if (event.key === '3' && !paused) {
                event.preventDefault();
                onCreateAttempt('desempenhou', minutes);
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
    }, [onCreateAttempt, onFinalizarBloco, onPause, paused, durationMinutes]);

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
            {/* Campos de tempo, carga e valor da carga na mesma linha */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InputField
                    label="Tempo de realização (minutos)"
                    id="duration-minutes"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    disabled={paused}
                />

                <SelectFieldRadix
                    label="Foi um exercício com carga?"
                    value={usedLoad}
                    onValueChange={setUsedLoad}
                    disabled={paused}
                    placeholder="Selecione"
                >
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                </SelectFieldRadix>
                
                {usedLoad === 'sim' && (
                    <InputField
                        label="Qual a carga utilizada?"
                        id="load-value"
                        type="text"
                        placeholder="Ex: 5 kg, 10 kg, 2 kg"
                        value={loadValue}
                        onChange={(e) => setLoadValue(e.target.value)}
                        disabled={paused}
                    />
                )}
            </div>


            {/* Campo de desconforto */}
            <div>
                <SelectFieldRadix
                    label="O cliente apresentou desconforto durante a execução?"
                    value={hadDiscomfort}
                    onValueChange={setHadDiscomfort}
                    disabled={paused}
                    placeholder="Selecione"
                >
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                </SelectFieldRadix>
                
                {hadDiscomfort === 'sim' && (
                    <div className="mt-3">
                        <TextAreaField
                            label="Descreva o desconforto apresentado"
                            id="discomfort-desc"
                            placeholder="Ex: Dor na região lombar, fadiga muscular..."
                            value={discomfortDescription}
                            onChange={(e) => setDiscomfortDescription(e.target.value)}
                            disabled={paused}
                            maxLength={500}
                            className="min-h-[100px]"
                        />
                    </div>
                )}
            </div>


            {/* Campo de compensação */}
            <div>
                <SelectFieldRadix
                    label="O cliente apresentou compensação durante a execução?"
                    value={hadCompensation}
                    onValueChange={setHadCompensation}
                    disabled={paused}
                    placeholder="Selecione"
                >
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                </SelectFieldRadix>
                
                {hadCompensation === 'sim' && (
                    <div className="mt-3">
                        <TextAreaField
                            label="Descreva a compensação apresentada"
                            id="compensation-desc"
                            placeholder="Ex: Inclinação lateral do tronco, rotação excessiva..."
                            value={compensationDescription}
                            onChange={(e) => setCompensationDescription(e.target.value)}
                            disabled={paused}
                            maxLength={500}
                            className="min-h-[100px]"
                        />
                    </div>
                )}
            </div>


            <div className="space-y-1 mb-4">
                <div className="text-sm font-medium" data-testid="activity-helper-title">
                    Registre esta atividade
                </div>
                <div className="text-xs text-muted-foreground" data-testid="activity-helper-text">
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
                            'nao-desempenhou': 'text-red-600',
                            'desempenhou-com-ajuda': 'text-amber-600',
                            desempenhou: 'text-green-600',
                        };

                        // Hook de gestos para este botão específico
                        const gesture = useGestureHandler(
                            () => {
                                const minutes = durationMinutes ? parseInt(durationMinutes, 10) : undefined;
                                onCreateAttempt(option.key, minutes);
                            },
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
                                            className={`h-20 w-full rounded-lg justify-start px-4 border border-border/40 dark:border-white/15 transition-all select-none touch-none ${
                                                gesture.isLongPressing
                                                    ? 'scale-95 ring-2 ring-blue-500'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: 'var(--hub-card-background)' }}
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
