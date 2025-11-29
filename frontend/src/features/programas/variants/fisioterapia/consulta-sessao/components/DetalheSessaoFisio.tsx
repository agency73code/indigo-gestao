import { useMemo } from 'react';
import type { Sessao, Patient, ProgramDetail, RegistroTentativa } from '@/features/programas/consulta-sessao/types';
import { aggregateByStimulus, sumCounts } from '@/features/programas/consulta-sessao/pages/helpers';
import HeaderSessao from '@/features/programas/consulta-sessao/components/HeaderSessao';
import SessionSummary from '@/features/programas/consulta-sessao/pages/components/SessionSummary';
import SessionNotes from '@/features/programas/consulta-sessao/pages/components/SessionNotes';
import SessionFiles from '@/features/programas/consulta-sessao/pages/components/SessionFiles';
import { getSessionFiles } from '@/features/programas/variants/fisioterapia/session/services';
import { getFisioStatus, getFisioStatusConfig } from '../helpers';
import { ToActivitiesPerformanceList } from '.';

interface DetalheSessaoToProps {
    sessao: Sessao;
    paciente: Patient;
    programa: ProgramDetail;
    onBack?: () => void;
}

// Helper para agregar tempos por atividade
function aggregateDurationsByActivity(registros: RegistroTentativa[]): Record<string, number | null> {
    const durations: Record<string, number | null> = {};
    
    registros.forEach(r => {
        if (r.stimulusId && r.durationMinutes !== undefined) {
            // Usar o primeiro valor de tempo encontrado para cada atividade
            if (!(r.stimulusId in durations)) {
                durations[r.stimulusId] = r.durationMinutes;
            }
        }
    });
    
    return durations;
}

export default function DetalheSessaoTo({ sessao, paciente, programa, onBack }: DetalheSessaoToProps) {
    // Agregar contagens por atividade (usando stimulusId como activityId)
    const countsByActivity = useMemo(
        () => aggregateByStimulus(sessao.registros),
        [sessao.registros],
    );

    // Agregar tempos por atividade
    const durationsByActivity = useMemo(
        () => aggregateDurationsByActivity(sessao.registros),
        [sessao.registros],
    );

    // Somar todas as contagens da sessão
    const countsSessao = useMemo(
        () =>
            Object.values(countsByActivity).reduce((acc, c) => sumCounts(acc, c), {
                erro: 0,
                ajuda: 0,
                indep: 0,
            }),
        [countsByActivity],
    );

    // Calcular status geral da sessão (TO usa status predominante)
    const statusSessao = useMemo(() => getFisioStatus(countsSessao), [countsSessao]);

    // Mapear atividades com informações necessárias
    const activitiesInfo = useMemo(
        () =>
            programa.stimuli.map((s) => ({
                id: s.id,
                label: s.label,
                order: s.order,
            })),
        [programa.stimuli],
    );

    const workedCount = Object.keys(countsByActivity).length;
    const plannedCount = programa.stimuli.filter((s) => s.active).length;

    // Buscar arquivos da sessão do localStorage
    const sessionFiles = useMemo(() => {
        return sessao.files || getSessionFiles(sessao.id);
    }, [sessao.id, sessao.files]);

    return (
        <div className="space-y-4">
            <HeaderSessao sessao={sessao} paciente={paciente} programa={programa} onBack={onBack} />

            <SessionSummary
                counts={countsSessao}
                duration={null}
                planned={plannedCount}
                worked={workedCount}
                date={sessao.data}
                status={'positivo' as any} // Ignorado pois passamos statusConfig customizado
                statusConfig={getFisioStatusConfig(statusSessao)}
            />

            <ToActivitiesPerformanceList
                activities={activitiesInfo}
                countsByActivity={countsByActivity}
                durationsByActivity={durationsByActivity}
                defaultSort="severity"
            />

            <SessionFiles files={sessionFiles} />

            <SessionNotes notes={sessao.observacoes ?? null} />
        </div>
    );
}
