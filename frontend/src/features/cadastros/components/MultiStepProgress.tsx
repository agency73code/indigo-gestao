import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface MultiStepProgressProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
}

export default function MultiStepProgress({
    currentStep,
    totalSteps,
    steps,
}: MultiStepProgressProps) {
    return (
        <div className="w-full mb-6 md:mb-8">
            <div className="flex items-center justify-between gap-1 sm:gap-3 md:gap-4">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={index} className="flex items-center">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className={`w-10 h-10 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                                        isCompleted
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : isCurrent
                                              ? 'border-primary text-primary bg-primary/10'
                                              : 'border-muted-foreground/30 text-muted-foreground bg-background'
                                    }`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isCompleted ? (
                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    ) : (
                                        <span className="text-[10px] sm:text-xs font-medium">{stepNumber}</span>
                                    )}
                                </motion.div>

                                {/* Step Label */}
                                <span
                                    className={`hidden sm:block mt-2 text-xs md:text-sm text-center truncate max-w-[80px] sm:max-w-[120px] md:max-w-none ${
                                        isCurrent
                                            ? 'text-primary font-medium'
                                            : isCompleted
                                              ? 'text-muted-foreground'
                                              : 'text-muted-foreground/60'
                                    }`}
                                >
                                    {step}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < totalSteps - 1 && (
                                <div className="hidden sm:block sm:flex-1 sm:mx-3 md:mx-4">
                                    <div
                                        className={`h-[2px] sm:h-[3px] md:h-2 transition-colors duration-200 ${
                                            isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 md:mt-6">
                <div className="w-full bg-muted-foreground/20 rounded-full h-[2px] sm:h-[3px] md:h-2 overflow-hidden">
                    <motion.div
                        className="bg-primary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
                    <span>
                        Etapa {currentStep} de {totalSteps}
                    </span>
                    <span>
                        {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% concluído
                    </span>
                </div>
            </div>
        </div>
    );
}
