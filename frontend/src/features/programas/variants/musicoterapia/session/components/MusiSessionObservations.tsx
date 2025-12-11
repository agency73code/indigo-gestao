import { MessageSquare, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MusiSessionObservationsProps {
    notes: string;
    onNotesChange: (value: string) => void;
}

export default function MusiSessionObservations({ notes, onNotesChange }: MusiSessionObservationsProps) {
    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Observações da Sessão
                    </CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground">
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                Anotações e insights sobre esta sessão de musicoterapia
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Registre observações, comportamentos ou intercorrências
                </p>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <Textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Ex: Cliente demonstrou maior engajamento durante atividades rítmicas. Apresentou interesse especial pelos instrumentos de percussão..."
                    className="min-h-[120px] resize-none"
                    maxLength={2000}
                />
                <div className="mt-2 text-xs text-muted-foreground text-right">
                    {notes.length}/2000 caracteres
                </div>
            </CardContent>
        </Card>
    );
}
