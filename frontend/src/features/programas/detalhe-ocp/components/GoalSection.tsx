import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface GoalSectionProps {
    program: ProgramDetail;
}

export default function GoalSection({ program }: GoalSectionProps) {
    return (
        <Card className="rounded-[5px] p-1 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2">
                    <h3 className="font-medium text-sm">{program.goalTitle}</h3>
                    {program.goalDescription && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {program.goalDescription}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
