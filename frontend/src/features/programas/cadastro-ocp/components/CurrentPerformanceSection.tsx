import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface CurrentPerformanceSectionProps {
    currentPerformanceLevel: string;
    onCurrentPerformanceLevelChange: (level: string) => void;
    customTitle?: string;
}

export default function CurrentPerformanceSection({
    currentPerformanceLevel,
    onCurrentPerformanceLevelChange,
    customTitle,
}: CurrentPerformanceSectionProps) {
    return (
        <Card padding="none" className="rounded-lg p-2 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {customTitle || 'Nível atual de Desempenho'}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-performance" className="text-sm font-medium">
                        Descreva o nível atual de desempenho do cliente nesta habilidade/objetivo.
                    </Label>
                    <textarea
                        id="current-performance"
                        placeholder="Ex: O cliente atualmente consegue realizar a atividade com auxílio parcial, apresentando dificuldades em..."
                        value={currentPerformanceLevel}
                        onChange={(e) => onCurrentPerformanceLevelChange(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        {currentPerformanceLevel.length}/1000 caracteres
                    </p>
                </div>

                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                    <p className="font-medium mb-1">💡 Dica:</p>
                    <p className="text-xs">
                        Descreva objetivamente como o cliente está realizando a atividade no momento, incluindo pontos fortes e dificuldades observadas.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
