import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';

interface MusiCurrentPerformanceSectionProps {
    currentPerformanceLevel?: string | null;
}

export default function MusiCurrentPerformanceSection({ currentPerformanceLevel }: MusiCurrentPerformanceSectionProps) {
    if (!currentPerformanceLevel) return null;

    return (
        <Card 
            padding="hub"
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardHeader className="pb-3">
                <CardTitleHub className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Nível atual de Desempenho
                </CardTitleHub>
            </CardHeader>
            <CardContent>
                <div 
                    className="p-4 border border-border/40 dark:border-white/15 rounded-lg"
                    style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {currentPerformanceLevel}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
