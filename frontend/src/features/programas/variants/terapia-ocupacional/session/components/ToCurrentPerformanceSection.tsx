import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ToProgramDetail } from '../types';

interface ToCurrentPerformanceSectionProps {
    program: ToProgramDetail;
}

export default function ToCurrentPerformanceSection({ program }: ToCurrentPerformanceSectionProps) {
    const currentPerformanceLevel = program.currentPerformanceLevel?.trim();

    if (!currentPerformanceLevel) return null;

    return (
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Nível atual de Desempenho
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {currentPerformanceLevel}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
