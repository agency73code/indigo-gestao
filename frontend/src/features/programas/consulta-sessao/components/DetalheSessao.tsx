import { useMemo } from 'react';
import HeaderSessao from './HeaderSessao';
import SessionSummary from '../pages/components/SessionSummary';
import StimuliPerformanceList from '../pages/components/StimuliPerformanceList';
import SessionNotes from '../pages/components/SessionNotes';
import type { Sessao, Patient, ProgramDetail } from '../types';
import { aggregateByStimulus, sumCounts, toStatus } from '../pages/helpers';

interface DetalheSessaoProps {
    sessao: Sessao;
    paciente: Patient;
    programa: ProgramDetail;
    onBack?: () => void;
}

export default function DetalheSessao({ sessao, paciente, programa, onBack }: DetalheSessaoProps) {
    // Log de carregamento
    console.log('[Event] sessao:detalhe:load:success', {
        sessionId: sessao.id,
        patientId: paciente.id,
    });

    // Agregar contagens por estímulo
    const countsByStimulus = useMemo(
        () => aggregateByStimulus(sessao.registros),
        [sessao.registros],
    );

    // Somar todas as contagens da sessão
    const countsSessao = useMemo(
        () =>
            Object.values(countsByStimulus).reduce((acc, c) => sumCounts(acc, c), {
                erro: 0,
                ajuda: 0,
                indep: 0,
            }),
        [countsByStimulus],
    );

    // Calcular status geral da sessão
    const statusSessao = useMemo(() => toStatus(countsSessao), [countsSessao]);

    // Mapear estímulos com informações necessárias
    const stimuliInfo = useMemo(
        () =>
            programa.stimuli.map((s) => ({
                id: s.id,
                label: s.label,
                order: s.order,
            })),
        [programa.stimuli],
    );

    const workedCount = Object.keys(countsByStimulus).length;
    const plannedCount = programa.stimuli.filter((s) => s.active).length;

    return (
        <div className="space-y-4">
            <HeaderSessao sessao={sessao} paciente={paciente} programa={programa} onBack={onBack} />

            <SessionSummary
                counts={countsSessao}
                duration={null}
                planned={plannedCount}
                worked={workedCount}
                date={sessao.data}
                status={statusSessao}
            />

            <StimuliPerformanceList
                stimuli={stimuliInfo}
                countsByStimulus={countsByStimulus}
                defaultSort="severity"
            />

            <SessionNotes notes={null} />
        </div>
    );
}
