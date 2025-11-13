import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import type { ProgramDetail } from '../types';

interface NotesSectionProps {
    program: ProgramDetail;
}

export default function NotesSection({ program }: NotesSectionProps) {
    const notes = program.notes?.trim();

    if (!notes) {
        return null;
    }

    return (
        <Card 
            padding="hub"
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardHeader className="pb-3">
                <CardTitleHub className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações Gerais
                </CardTitleHub>
            </CardHeader>
            <CardContent>
                <div 
                    className="p-4 border border-border/40 dark:border-white/15 rounded-lg"
                    style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                >
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {notes}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
