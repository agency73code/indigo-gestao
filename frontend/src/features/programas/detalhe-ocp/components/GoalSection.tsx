import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface GoalSectionProps {
    program: ProgramDetail;
}

export default function GoalSection({ program }: GoalSectionProps) {
    const longTermGoalDescription =
        program.longTermGoalDescription ?? program.goalDescription ?? null;

    return (
        <Card 
            padding="hub"
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardHeader className="pb-3">
                <CardTitleHub className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo do Programa a Longo Prazo
                </CardTitleHub>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-start gap-1 text-sm">
                    <span className="font-medium text-muted-foreground">Título do objetivo:</span>
                    <span className="font-medium text-foreground">{program.goalTitle}</span>
                </div>

                {longTermGoalDescription && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium mb-1">
                            Descrição detalhada do objetivo a longo prazo:
                        </p>
                        <div 
                            className="p-4 border border-border/40 dark:border-white/15 rounded-lg"
                            style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                        >
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {longTermGoalDescription}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
