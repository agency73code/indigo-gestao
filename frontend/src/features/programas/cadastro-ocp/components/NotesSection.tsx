import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface NotesSectionProps {
    notes: string;
    onNotesChange: (notes: string) => void;
}

export default function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
    return (
        <Card padding="none" className="rounded-[5px] p-2">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações Gerais
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                        Anotações adicionais sobre o programa (opcional)
                    </Label>
                    <textarea
                        id="notes"
                        placeholder="Adicione observações importantes, histórico do cliente, estratégias específicas..."
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{notes.length}/1000 caracteres</p>
                </div>
            </CardContent>
        </Card>
    );
}
