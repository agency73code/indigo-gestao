import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface CriteriaSectionProps {
    criteria: string;
    onCriteriaChange: (criteria: string) => void;
    customTitle?: string;
}

export default function CriteriaSection({ criteria, onCriteriaChange, customTitle }: CriteriaSectionProps) {
    return (
        <Card padding="none"className="rounded-lg p-2 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {customTitle || 'Critério de Aprendizagem'}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="criteria" className="text-sm font-medium">
                        Defina como será determinado que o paciente aprendeu a habilidade. 
                    </Label>
                    <textarea
                        id="criteria"
                        placeholder="EEx: ≥90% de acertos em 3 sessões seguidas ou manutenção do desempenho por 2 semanas."
                        value={criteria}
                        onChange={(e) => onCriteriaChange(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        {criteria.length}/1000 caracteres
                    </p>
                </div>

                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                    <p className="font-medium mb-1">💡 Exemplos de critérios:</p>
                    <ul className="space-y-1 text-xs">
                        <li>• ≥90% de acertos por 3 sessões consecutivas</li>
                        <li>• Independência total em 5 apresentações</li>
                        <li>• Manutenção por 2 semanas sem treino</li>
                        <li>• Generalização para 3 contextos diferentes</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
