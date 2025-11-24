import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ToNotesSectionProps {
    notes: string;
    onNotesChange?: (notes: string) => void;
    readOnly?: boolean;
}

export default function ToNotesSection({ notes, onNotesChange, readOnly = false }: ToNotesSectionProps) {
    // Modo read-only para página de detalhe
    if (readOnly) {
        if (!notes) return null;
        
        return (
            <Card 
                padding="small"
                className="rounded-[5px]" 
                data-print-block
            >
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Observações do Terapeuta
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="p-4 border border-border/40 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {notes}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Modo edição - onNotesChange é obrigatório aqui
    if (!onNotesChange) {
        throw new Error('onNotesChange é obrigatório quando readOnly=false');
    }

    return (
        <Card padding="small" className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações do Terapeuta
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-2">
                    <Label htmlFor="notes">Observações adicionais sobre o programa de TO (opcional)</Label>
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
                    <p className="text-xs text-muted-foreground">{notes.length}/2000 caracteres</p>
                </div>
            </CardContent>
        </Card>
    );
}
