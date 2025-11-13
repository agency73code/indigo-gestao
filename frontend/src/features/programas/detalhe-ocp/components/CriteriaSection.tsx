import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface CriteriaSectionProps {
    program: ProgramDetail;
}

export default function CriteriaSection({ program }: CriteriaSectionProps) {
    const criteria = program.criteria?.trim();

    return (
        <Card 
            padding="hub"
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardHeader className="pb-3">
                <CardTitleHub className="text-base flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Critério de Aprendizagem
                </CardTitleHub>
            </CardHeader>
            <CardContent>
                {criteria ? (
                    <div 
                        className="p-4 border border-border/40 dark:border-white/15 rounded-lg"
                        style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                    >
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
