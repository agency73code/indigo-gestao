import { useMemo } from 'react';
import type { Sessao, Patient, ProgramDetail, RegistroTentativa } from '@/features/programas/consulta-sessao/types';
import { aggregateByStimulus, sumCounts } from '@/features/programas/consulta-sessao/pages/helpers';
import HeaderSessao from '@/features/programas/consulta-sessao/components/HeaderSessao';
import SessionNotes from '@/features/programas/consulta-sessao/pages/components/SessionNotes';
import SessionFiles from '@/features/programas/consulta-sessao/pages/components/SessionFiles';
import { getSessionFiles } from '@/features/programas/variants/fisioterapia/session/services';
import { getFisioStatus } from '../helpers';
import FisioActivitiesPerformanceList from './FisioActivitiesPerformanceList';
import FisioSessionSummary from './FisioSessionSummary';

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

// Helper para agregar metadata por atividade (última tentativa)
function aggregateMetadataByActivity(registros: RegistroTentativa[]): Record<string, {
    usedLoad?: boolean;
    loadValue?: string;
    hadDiscomfort?: boolean;
    discomfortDescription?: string;
    hadCompensation?: boolean;
    compensationDescription?: string;
}> {
    const metadata: Record<string, any> = {};

    registros.forEach(r => {
        if (r.stimulusId) {
            // Sempre atualizar com a última tentativa (sobrescreve)
            metadata[r.stimulusId] = {
                usedLoad: r.usedLoad,
                loadValue: r.loadValue,
                hadDiscomfort: r.hadDiscomfort,
                discomfortDescription: r.discomfortDescription,
                hadCompensation: r.hadCompensation,
                compensationDescription: r.compensationDescription,
            };
        }
    });
    
    return metadata;
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

    // Agregar metadata por atividade
    const metadataByActivity = useMemo(
        () => aggregateMetadataByActivity(sessao.registros),
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

    // Calcular contadores de metadata
    const { discomfortCount, compensationCount } = useMemo(() => {
        let load = 0;
        let discomfort = 0;
        let compensation = 0;

        Object.values(metadataByActivity).forEach(meta => {
            if (meta.usedLoad) load++;
            if (meta.hadDiscomfort) discomfort++;
            if (meta.hadCompensation) compensation++;
        });

        return { loadCount: load, discomfortCount: discomfort, compensationCount: compensation };
    }, [metadataByActivity]);

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

            <FisioSessionSummary
                status={statusSessao}
                activitiesWorked={workedCount}
                activitiesPlanned={plannedCount}
                compensationCount={compensationCount}
                discomfortCount={discomfortCount}
            />

            <FisioActivitiesPerformanceList
                activities={activitiesInfo}
                countsByActivity={countsByActivity}
                durationsByActivity={durationsByActivity}
                metadataByActivity={metadataByActivity}
                defaultSort="severity"
            />

            <SessionFiles files={sessionFiles} />

            <SessionNotes notes={sessao.observacoes ?? null} />
        </div>
    );
}
