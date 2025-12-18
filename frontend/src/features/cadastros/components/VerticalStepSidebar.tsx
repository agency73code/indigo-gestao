import { motion } from 'framer-motion';
import { User, MapPin, FileText, CreditCard, GraduationCap, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface VerticalStepSidebarProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
    stepIcons?: LucideIcon[];
    onStepClick?: (step: number) => void;
}

// Mapeamento de ícones padrão para cada step (Cliente)
const defaultStepIcons: LucideIcon[] = [
    User,          // 1. Dados Pessoais
    MapPin,        // 2. Endereço
    FileText,      // 3. Arquivos
    CreditCard,    // 4. Dados Pagamento
    GraduationCap  // 5. Dados Escola
];

export default function VerticalStepSidebar({
    currentStep,
    totalSteps,
    steps,
    stepIcons = defaultStepIcons,
    onStepClick,
}: VerticalStepSidebarProps) {
    return (
        <div 
            className="h-full flex flex-col p-4"
            style={{ 
                backgroundColor: 'var(--header-bg)',
                borderRadius: '16px'
            }}
        >
            {/* Steps List */}
            <div className="flex-1 flex flex-col gap-1">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const StepIcon = stepIcons[index] || User;

                    return (
                        <div key={index} className="flex flex-col">
                            {/* Step Item */}
                            <div 
                                className={`flex items-center gap-3 py-3 ${onStepClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onStepClick?.(stepNumber)}
                            >
                                {/* Step Circle/Icon */}
                                <motion.div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                                        isCompleted
                                            ? 'bg-primary text-primary-foreground'
                                            : isCurrent
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-muted text-muted-foreground'
                                    }`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <StepIcon className="w-5 h-5" />
                                    )}
                                </motion.div>

                                {/* Step Label */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        style={{ 
                                            fontFamily: "var(--hub-card-title-font-family)",
                                            fontWeight: "var(--hub-card-title-font-weight)",
                                            color: isCurrent ? "var(--primary)" : "var(--hub-card-title-color)"
                                        }}
                                        className="text-base leading-snug tracking-tight"
                                    >
                                        {step}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < totalSteps - 1 && (
                                <div className="flex justify-start pl-5 py-1">
                                    <div
                                        className={`w-[2px] h-4 transition-colors duration-200 ${
                                            isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Indicator - No final */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span className="font-medium">
                            {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="bg-primary h-full rounded-full"
                            initial={{ height: 0 }}
                            animate={{ height: '100%', width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        Etapa {currentStep} de {totalSteps}
                    </p>
                </div>
            </div>
        </div>
    );
}
