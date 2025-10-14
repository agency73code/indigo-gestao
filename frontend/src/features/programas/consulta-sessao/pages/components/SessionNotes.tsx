import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, CircleHelp } from 'lucide-react';

interface SessionNotesProps {
    notes?: string | null;
}

export default function SessionNotes({ notes }: SessionNotesProps) {
    const hasNotes = notes && notes.trim().length > 0;

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base font-semibold">Observações da sessão</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                                <p className="text-xs">
                                    Anotações e observações registradas durante ou após a sessão.
                                    Use estas informações para contexto adicional sobre o desempenho
                                    do cliente, comportamentos observados ou ajustes necessários.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                    Anotações e insights do terapeuta sobre esta sessão
                </p>
            </CardHeader>
            <CardContent>
                {hasNotes ? (
                    <div className="p-4 bg-muted/50 rounded-md border border-border">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {notes}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-md">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>Nenhuma observação registrada para esta sessão</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
