import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface GoalSectionProps {
    program: ProgramDetail;
}

export default function GoalSection({ program }: GoalSectionProps) {
    return (
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo do Programa / Objetivo
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                {/* Título do objetivo */}
                <div className="flex flex-wrap items-start gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                        Título do objetivo:
                    </span>
                    <span className="text-sm font-medium">
                        {program.goalTitle}
                    </span>
                </div>

                {/* Descrição detalhada do objetivo de longo prazo */}
                {program.goalDescription && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Descrição detalhada do objetivo de longo prazo:
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {program.goalDescription}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
