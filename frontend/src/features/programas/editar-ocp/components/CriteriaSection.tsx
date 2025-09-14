import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ValidationErrors } from '../types';

interface CriteriaSectionProps {
    criteria: string;
    onCriteriaChange: (criteria: string) => void;
    errors?: ValidationErrors;
}

export default function CriteriaSection({
    criteria,
    onCriteriaChange,
    errors,
}: CriteriaSectionProps) {
    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Critérios de Domínio
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2">
                    <Label htmlFor="criteria">
                        Critérios para considerar o objetivo atingido (opcional)
                    </Label>
                    <textarea
                        id="criteria"
                        placeholder="Ex: Acertar 80% das tentativas em 3 sessões consecutivas..."
                        value={criteria}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onCriteriaChange(e.target.value)
                        }
                        maxLength={1000}
                        className="w-full p-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                        rows={4}
                    />
                    {errors?.criteria && <p className="text-sm text-red-600">{errors.criteria}</p>}
                    <p className="text-xs text-muted-foreground">
                        {criteria.length}/1000 caracteres
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
