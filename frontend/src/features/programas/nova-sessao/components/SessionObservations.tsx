import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { CircleHelp } from 'lucide-react';

interface SessionObservationsProps {
    notes: string;
    onNotesChange: (notes: string) => void;
}

export default function SessionObservations({ notes, onNotesChange }: SessionObservationsProps) {
    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base font-semibold">Observações da Sessão</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CircleHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px]">
                                <p className="text-xs">
                                    Registre observações importantes sobre comportamentos,
                                    engajamento, dificuldades ou intercorrências durante a sessão.
                                    Estas anotações ajudam no acompanhamento do progresso e
                                    planejamento de sessões futuras.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                    Anotações e insights sobre esta sessão
                </p>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-3">
                    <Label htmlFor="session-notes" className="text-sm font-medium">
                        Registre observações, comportamentos ou intercorrências
                    </Label>
                    <textarea
                        id="session-notes"
                        placeholder="Ex: Cliente demonstrou maior engajamento ao utilizar reforçadores visuais. Apresentou dificuldade em manter foco após 15 minutos de sessão..."
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        maxLength={2000}
                        rows={4}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{notes.length}/2000 caracteres</p>
                </div>
            </CardContent>
        </Card>
    );
}
