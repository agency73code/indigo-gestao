import { useMemo } from 'react';
import type { Sessao, Patient, ProgramDetail, RegistroTentativa } from '@/features/programas/consulta-sessao/types';
import { aggregateByStimulus, sumCounts } from '@/features/programas/consulta-sessao/pages/helpers';
import HeaderSessao from '@/features/programas/consulta-sessao/components/HeaderSessao';
import SessionSummary from '@/features/programas/consulta-sessao/pages/components/SessionSummary';
import SessionNotes from '@/features/programas/consulta-sessao/pages/components/SessionNotes';
import SessionFiles, { type SessionFile } from '@/features/programas/consulta-sessao/pages/components/SessionFiles';
import { initializeMockSessionFiles } from '../../session/services';
import { MusiActivitiesPerformanceList } from '.';

interface DetalheSessaoMusiProps {
    sessao: Sessao;
    paciente: Patient;
    programa: ProgramDetail;
    onBack?: () => void;
}

type StatusKind = 'verde' | 'laranja' | 'vermelho';

function getMusiStatus(counts: { erro: number; ajuda: number; indep: number }): StatusKind {
    const max = Math.max(counts.indep, counts.ajuda, counts.erro);
    
    if (counts.indep === max) return 'verde';
    if (counts.ajuda === max) return 'laranja';
    return 'vermelho';
}

function getMusiStatusConfig(kind: StatusKind) {
    const configs = {
        verde: {
            label: 'Desempenhou',
            cls: 'bg-green-100 text-green-700',
        },
        laranja: {
            label: 'Desempenhou com Ajuda',
            cls: 'bg-amber-100 text-amber-700',
        },
        vermelho: {
            label: 'Não Desempenhou',
            cls: 'bg-red-100 text-red-700',
        },
    };
    return configs[kind];
}

function aggregateDurationsByActivity(registros: RegistroTentativa[]): Record<string, number | null> {
    const durations: Record<string, number | null> = {};
    
    registros.forEach(r => {
        if (r.stimulusId && r.durationMinutes !== undefined) {
            if (!(r.stimulusId in durations)) {
                durations[r.stimulusId] = r.durationMinutes;
            }
        }
    });
    
    return durations;
}

// Mock de arquivos (para desenvolvimento)
function getSessionFiles(sessionId: string): SessionFile[] {
    initializeMockSessionFiles();
    // Retorna array vazio - em produção viria do backend
    void sessionId;
    return [];
}

export default function DetalheSessaoMusi({ sessao, paciente, programa, onBack }: DetalheSessaoMusiProps) {
    const countsByActivity = useMemo(
        () => aggregateByStimulus(sessao.registros),
        [sessao.registros],
    );

    const durationsByActivity = useMemo(
        () => aggregateDurationsByActivity(sessao.registros),
        [sessao.registros],
    );

    const countsSessao = useMemo(
        () =>
            Object.values(countsByActivity).reduce((acc, c) => sumCounts(acc, c), {
                erro: 0,
                ajuda: 0,
                indep: 0,
            }),
        [countsByActivity],
    );

    const statusSessao = useMemo(() => getMusiStatus(countsSessao), [countsSessao]);

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
                status={'positivo' as any}
                statusConfig={getMusiStatusConfig(statusSessao)}
            />

            <MusiActivitiesPerformanceList
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
