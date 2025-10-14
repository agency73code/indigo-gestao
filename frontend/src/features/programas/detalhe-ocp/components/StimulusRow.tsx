import { useMemo, useState } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StimulusEvolutionInline from './StimulusEvolutionInline';
import type { ProgramDetail } from '../types';

interface StimulusRowProps {
    programId: string;
    stimulus: ProgramDetail['stimuli'][number];
    applicationDescription: string | null;
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

export default function StimulusRow({
    programId,
    stimulus,
    applicationDescription,
    muted = false,
}: StimulusRowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const panelId = useMemo(() => `stimulus-evolution-${stimulus.id}`, [stimulus.id]);

    const stimulusDescription = stimulus.description?.trim() ?? '';
    const shouldShowDescription =
        stimulusDescription.length > 0 && stimulusDescription !== applicationDescription;

    const containerClassName = `border border-border rounded-md p-3 ${muted ? 'opacity-70' : ''}`;

    const toggle = () => setIsOpen((prev) => !prev);

    return (
        <div className={containerClassName}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {stimulus.order}
                    </span>
                    <div>
                        <p className="text-sm font-medium">{stimulus.label}</p>
                        {shouldShowDescription && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stimulusDescription}
                            </p>
                        )}
                    </div>
                </div>
                <div className="sm:ml-auto flex flex-wrap items-center gap-2">
                    {getStimulusStatusBadge(stimulus.active ? 'active' : 'archived')}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggle}
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        aria-label={`Visualizar gráfico de evolução do estímulo ${stimulus.label}`}
                        className="gap-2"
                    >
                        <LineChartIcon className="h-4 w-4" />
                        Visualizar gráfico
                    </Button>
                </div>
            </div>

            {isOpen && <Separator className="mt-3 -mx-3" />}

            <StimulusEvolutionInline
                programId={programId}
                stimulusId={stimulus.id}
                stimulusName={stimulus.label}
                isOpen={isOpen}
                panelId={panelId}
            />
        </div>
    );
}
