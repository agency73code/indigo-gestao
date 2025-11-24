import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalSectionProps {
    goalTitle: string;
    goalDescription: string;
    onGoalTitleChange: (title: string) => void;
    onGoalDescriptionChange: (description: string) => void;
    customTitle?: string;
    errors?: {
        goalTitle?: string;
    };
}

export default function GoalSection({
    goalTitle,
    goalDescription,
    onGoalTitleChange,
    onGoalDescriptionChange,
    customTitle,
    errors,
}: GoalSectionProps) {
    return (
        <Card padding="none" className="rounded-lg px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {customTitle || 'Objetivo do Programa / Objetivo'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="goal-title" className="text-sm font-medium">
                        Título do objetivo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="goal-title"
                        placeholder="Ex: Desenvolver habilidades de comunicação verbal"
                        value={goalTitle}
                        onChange={(e) => onGoalTitleChange(e.target.value)}
                        maxLength={120}
                        className={errors?.goalTitle ? 'border-destructive' : ''}
                        aria-invalid={!!errors?.goalTitle}
                        aria-describedby={errors?.goalTitle ? 'goal-title-error' : undefined}
                    />
                    {errors?.goalTitle && (
                        <p id="goal-title-error" className="text-sm text-destructive">
                            {errors.goalTitle}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {goalTitle.length}/120 caracteres
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="goal-description" className="text-sm font-medium">
                        Descrição detalhada do objetivo de longo prazo
                    </Label>
                    <textarea
                        id="goal-description"
                        placeholder="Descreva mais detalhadamente o que se espera alcançar com este programa..."
                        value={goalDescription}
                        onChange={(e) => onGoalDescriptionChange(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        {goalDescription.length}/1000 caracteres
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
