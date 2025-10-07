import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface GoalPreviewProps {
    program: ProgramDetail;
}

export default function GoalPreview({ program }: GoalPreviewProps) {
    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3  pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo do Programa
                </CardTitle>
            </CardHeader>
            <CardContent className=" pb-3 sm:pb-6">
                <div className="space-y-2">
                    <h3 className="font-medium text-sm">{program.goalTitle}</h3>
                </div>
                <div className="space-y-3 mt-4">
                        <p className="text-xs text-muted-foreground mb-1">
                            Descrição detalhada do objetivo a longo prazo:
                        </p>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {program.goalDescription}
                            </p>
                        </div>
                    </div>
            </CardContent>
        </Card>
    );
}
