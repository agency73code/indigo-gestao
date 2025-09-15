import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ValidationErrors } from '../types';

interface NotesSectionProps {
    notes: string;
    onNotesChange: (notes: string) => void;
    errors?: ValidationErrors;
}

export default function NotesSection({ notes, onNotesChange, errors }: NotesSectionProps) {
    return (
        <Card className="rounded-[5px] p-1 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2">
                    <Label htmlFor="notes">Observações gerais (opcional)</Label>
                    <textarea
                        id="notes"
                        placeholder="Informações adicionais sobre o programa, histórico, recomendações..."
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onNotesChange(e.target.value)
                        }
                        maxLength={2000}
                        className="w-full p-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                        rows={5}
                    />
                    {errors?.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                    <p className="text-xs text-muted-foreground">{notes.length}/2000 caracteres</p>
                </div>
            </CardContent>
        </Card>
    );
}
