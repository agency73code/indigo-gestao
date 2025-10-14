import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface SessionNotesInputProps {
    notes: string;
    onChange: (notes: string) => void;
}

export default function SessionNotesInput({ notes, onChange }: SessionNotesInputProps) {
    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações da sessão
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-3">
                    <Label htmlFor="session-notes" className="text-sm font-medium">
                        Registre observações importantes sobre esta sessão:
                    </Label>
                    <textarea
                        id="session-notes"
                        placeholder="Ex: Cliente mostrou maior engajamento com reforçadores visuais. Atenção reduzida após 20 minutos. Considerar intervalos mais frequentes nas próximas sessões..."
                        value={notes}
                        onChange={(e) => onChange(e.target.value)}
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
