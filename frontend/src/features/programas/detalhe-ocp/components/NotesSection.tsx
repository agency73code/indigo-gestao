import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações Gerais
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {notes}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
