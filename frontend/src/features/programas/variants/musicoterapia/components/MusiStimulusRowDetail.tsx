import { useMemo, useState } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MusiStimulusEvolutionInline from './MusiStimulusEvolutionInline';

interface MusiStimulusRowDetailProps {
    programId: string;
    stimulus: {
        id: string;
        order: number;
        label: string;
        description?: string | null;
        active: boolean;
        metodos?: string | null;
        tecnicasProcedimentos?: string | null;
    };
    muted?: boolean;
}

function getStimulusStatusBadge(status: 'active' | 'archived') {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    const statusClasses =
        status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';

    return (
        <span className={`${baseClasses} ${statusClasses}`}>
            {status === 'active' ? 'Ativo' : 'Arquivado'}
        </span>
    );
}

export default function MusiStimulusRowDetail({
    programId,
    stimulus,
    muted = false,
}: MusiStimulusRowDetailProps) {
    const [isOpen, setIsOpen] = useState(false);
    const panelId = useMemo(() => `stimulus-evolution-${stimulus.id}`, [stimulus.id]);

    const toggle = () => setIsOpen((prev) => !prev);

    return (
        <div 
            className={`border border-border/40 dark:border-white/15 rounded-lg p-4 ${muted ? 'opacity-70' : ''}`}
            style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
        >
            <div className="flex flex-col gap-3">
                {/* Cabeçalho: número, nome, status e botão gráfico */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shrink-0">
                            {stimulus.order}
                        </span>
                        <div className="flex-1 min-w-0 space-y-4">
                            {/* Objetivo Principal */}
                            <div>
                                <p className="text-sm font-semibold text-foreground">{stimulus.label}</p>
                            </div>
                            
                            {/* Grid com Descrição e Métodos lado a lado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stimulus.description && stimulus.description.trim().length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1 w-1 rounded-full bg-primary/60"></div>
                                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                                Objetivo Específico
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-2.5">
                                            {stimulus.description}
                                        </p>
                                    </div>
                                )}
                                
                                {stimulus.metodos && stimulus.metodos.trim().length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1 w-1 rounded-full bg-primary/60"></div>
                                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                                Métodos
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-2.5">
                                            {stimulus.metodos}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Técnicas/Procedimentos em largura total */}
                            {stimulus.tecnicasProcedimentos && stimulus.tecnicasProcedimentos.trim().length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-border/40 dark:border-white/10">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1 w-1 rounded-full bg-primary/60"></div>
                                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                            Técnicas/Procedimentos
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed pl-2.5">
                                        {stimulus.tecnicasProcedimentos}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="sm:ml-auto flex flex-wrap items-center gap-2 sm:shrink-0">
                        {getStimulusStatusBadge(stimulus.active ? 'active' : 'archived')}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggle}
                            aria-controls={panelId}
                            aria-expanded={isOpen}
                            aria-label={`Visualizar gráfico de evolução da atividade ${stimulus.label}`}
                            className="gap-2"
                        >
                            <LineChartIcon className="h-4 w-4" />
                            Visualizar gráfico
                        </Button>
                    </div>
                </div>
            </div>

            {isOpen && <Separator className="mt-3 -mx-4 dark:bg-white/15" />}

            <MusiStimulusEvolutionInline
                programId={programId}
                stimulusId={stimulus.id}
                stimulusName={stimulus.label}
                isOpen={isOpen}
                panelId={panelId}
            />
        </div>
    );
}
