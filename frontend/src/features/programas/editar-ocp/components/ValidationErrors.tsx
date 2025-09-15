import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ValidationErrors as ValidationErrorsType } from '../types';

interface ValidationErrorsProps {
    errors: ValidationErrorsType;
}

export default function ValidationErrors({ errors }: ValidationErrorsProps) {
    const hasErrors = Object.keys(errors).some((key) => {
        const value = errors[key as keyof ValidationErrorsType];
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length > 0;
        }
        return false;
    });

    if (!hasErrors) {
        return null;
    }

    const errorMessages: string[] = [];

    // Erros gerais
    if (errors.general) {
        errorMessages.push(errors.general);
    }

    // Erros do objetivo
    if (errors.goalTitle) {
        errorMessages.push(`Objetivo: ${errors.goalTitle}`);
    }

    // Erros dos estímulos
    if (errors.stimuli) {
        Object.entries(errors.stimuli).forEach(([index, stimulusErrors]) => {
            const stimulusNum = parseInt(index) + 1;
            if (stimulusErrors.label) {
                errorMessages.push(`Estímulo ${stimulusNum}: ${stimulusErrors.label}`);
            }
            if (stimulusErrors.description) {
                errorMessages.push(
                    `Estímulo ${stimulusNum} (descrição): ${stimulusErrors.description}`,
                );
            }
        });
    }

    // Erros de critérios
    if (errors.criteria) {
        errorMessages.push(`Critérios: ${errors.criteria}`);
    }

    // Erros de observações
    if (errors.notes) {
        errorMessages.push(`Observações: ${errors.notes}`);
    }

    return (
        <Card className="rounded-[5px] border-red-200 bg-red-50">
            <CardContent className="p-1 sm:p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />

                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 mb-2">
                            Corrija os seguintes erros:
                        </h3>

                        <ul className="space-y-1">
                            {errorMessages.map((message, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-red-700 flex items-start gap-2"
                                >
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
