import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ValidationErrors } from '../types';

interface GoalSectionProps {
    goalTitle: string;
    goalDescription: string;
    onGoalTitleChange: (title: string) => void;
    onGoalDescriptionChange: (description: string) => void;
    errors?: ValidationErrors;
}

export default function GoalSection({
    goalTitle,
    goalDescription,
    onGoalTitleChange,
    onGoalDescriptionChange,
    errors,
}: GoalSectionProps) {
    return (
        <Card padding="small" className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo do Programa
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="goal-title">Título do objetivo *</Label>
                    <Input
                        id="goal-title"
                        placeholder="Ex: Desenvolvimento da comunicação verbal"
                        value={goalTitle}
                        onChange={(e) => onGoalTitleChange(e.target.value)}
                        maxLength={120}
                        className={errors?.goalTitle ? 'border-red-500' : ''}
                    />
                    {errors?.goalTitle && (
                        <p className="text-sm text-red-600">{errors.goalTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {goalTitle.length}/120 caracteres
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="goal-description">Descrição do objetivo (opcional)</Label>
                    <textarea
                        id="goal-description"
                        placeholder="Descreva o objetivo detalhadamente..."
                        value={goalDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onGoalDescriptionChange(e.target.value)
                        }
                        maxLength={1000}
                        className="min-h-20 resize-none w-full p-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                        {goalDescription.length}/1000 caracteres
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
