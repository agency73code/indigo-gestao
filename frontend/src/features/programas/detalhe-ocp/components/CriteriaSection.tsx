import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface CriteriaSectionProps {
    program: ProgramDetail;
}

export default function CriteriaSection({ program }: CriteriaSectionProps) {
    const criteria = program.criteria?.trim();

    return (
        <Card className="rounded-[5px] px-6 py-0 md:px-8 md:py-10 lg:px-8 lg:py-0" data-print-block>
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Critérios de Domínio
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                {criteria ? (
                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {criteria}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Nenhum critério informado para este programa.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
