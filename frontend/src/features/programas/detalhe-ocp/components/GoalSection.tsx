import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface GoalSectionProps {
    program: ProgramDetail;
}

export default function GoalSection({ program }: GoalSectionProps) {
    const longTermGoalDescription =
        program.longTermGoalDescription ?? program.goalDescription ?? null;

    return (
        <Card className="rounded-[5px] px-6 py-0 md:px-6 md:py-6 lg:px-8 lg:py-0" data-print-block>
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo do Programa a Longo Prazo
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                <div className="flex flex-wrap items-start gap-1 text-sm">
                    <span className="font-medium text-muted-foreground">Título do objetivo:</span>
                    <span className="font-semibold text-foreground">{program.goalTitle}</span>
                </div>

                {longTermGoalDescription && (
                    <div className="space-y-3 mt-4">
                        <p className="text-sm font-medium text-primary mb-1">
                            Descrição detalhada do objetivo a longo prazo:
                        </p>
                        <div className="p-3 bg-muted rounded-md">
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
