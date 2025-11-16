import type { LucideIcon } from 'lucide-react';

interface SimpleStepSidebarProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
    stepIcons?: LucideIcon[];
    onStepClick?: (step: number) => void;
}

export default function SimpleStepSidebar({
    currentStep,
    totalSteps,
    steps,
    stepIcons,
    onStepClick,
}: SimpleStepSidebarProps) {
    return (
        <div className="h-full flex flex-col p-4 pt-0">
            {/* Steps List */}
            <div className="flex-1 flex flex-col gap-1">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCurrent = stepNumber === currentStep;
                    const StepIcon = stepIcons?.[index];

                    return (
                        <div key={index} className="flex flex-col">
                            {/* Step Item */}
                            <div 
                                className={`flex items-center gap-3 py-3 rounded-lg px-2 transition-colors ${
                                    isCurrent ? 'bg-primary/10' : 'hover:bg-muted/50'
                                } ${onStepClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onStepClick?.(stepNumber)}
                            >
                                {/* Step Icon */}
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                                        isCurrent
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {StepIcon && <StepIcon className="w-5 h-5" />}
                                </div>

                                {/* Step Label */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        style={{ 
                                            fontFamily: "var(--hub-card-title-font-family)",
                                            fontWeight: "var(--hub-card-title-font-weight)",
                                            color: isCurrent ? "var(--primary)" : "var(--hub-card-title-color)"
                                        }}
                                        className="text-base truncate leading-none tracking-tight"
                                    >
                                        {step}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < totalSteps - 1 && (
                                <div className="flex justify-start pl-5 py-1">
                                    <div className="w-[2px] h-2 bg-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
