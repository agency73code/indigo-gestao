import { useMemo } from 'react';
import type { Sessao, Patient, ProgramDetail, RegistroTentativa } from '@/features/programas/consulta-sessao/types';
import { aggregateByStimulus, sumCounts } from '@/features/programas/consulta-sessao/pages/helpers';
import HeaderSessao from '@/features/programas/consulta-sessao/components/HeaderSessao';
import SessionNotes from '@/features/programas/consulta-sessao/pages/components/SessionNotes';
import SessionFiles, { type SessionFile } from '@/features/programas/consulta-sessao/pages/components/SessionFiles';
import { initializeMockSessionFiles } from '../../session/services';
import { MusiActivitiesPerformanceList, MusiSessionSummary } from '.';

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

function aggregateScalesByActivity(registros: RegistroTentativa[]): Record<string, { participacao?: number | null; suporte?: number | null }> {
    const scales: Record<string, { participacao?: number | null; suporte?: number | null }> = {};
    
    registros.forEach(r => {
        if (r.stimulusId) {
            if (!(r.stimulusId in scales)) {
                scales[r.stimulusId] = {
                    participacao: r.participacao,
                    suporte: r.suporte,
                };
            }
        }
    });
    
    return scales;
}

// Calcula a média de participação de todas as atividades
function calculateAvgParticipacao(scalesByActivity: Record<string, { participacao?: number | null; suporte?: number | null }>): number | null {
    const values = Object.values(scalesByActivity)
        .map(s => s.participacao)
        .filter((v): v is number => v !== null && v !== undefined);
    
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Calcula a média de suporte de todas as atividades
function calculateAvgSuporte(scalesByActivity: Record<string, { participacao?: number | null; suporte?: number | null }>): number | null {
    const values = Object.values(scalesByActivity)
        .map(s => s.suporte)
        .filter((v): v is number => v !== null && v !== undefined);
    
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
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

    const scalesByActivity = useMemo(
        () => aggregateScalesByActivity(sessao.registros),
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
        () => {
            const info = programa.stimuli.map((s) => ({
                id: s.id,
                label: s.label,
                order: s.order,
                objetivoEspecifico: s.description || null,
                metodos: s.methods || null,
                tecnicasProcedimentos: s.techniquesProcedures || null,
            }));

            return info;
        },
        [programa.stimuli],
    );

    const workedCount = Object.keys(countsByActivity).length;
    const plannedCount = programa.stimuli.filter((s) => s.active).length;

    // Métricas para o summary
    const avgParticipacao = useMemo(
        () => calculateAvgParticipacao(scalesByActivity),
        [scalesByActivity],
    );

    const avgSuporte = useMemo(
        () => calculateAvgSuporte(scalesByActivity),
        [scalesByActivity],
    );

    const sessionFiles = useMemo(() => {
        return sessao.files || getSessionFiles(sessao.id);
    }, [sessao.id, sessao.files]);

    return (
        <div className="space-y-4">
            <HeaderSessao sessao={sessao} paciente={paciente} programa={programa} onBack={onBack} />

            <MusiSessionSummary
                counts={countsSessao}
                plannedActivities={plannedCount}
                workedActivities={workedCount}
                avgParticipacao={avgParticipacao}
                avgSuporte={avgSuporte}
                status={statusSessao}
            />

            <MusiActivitiesPerformanceList
                activities={activitiesInfo}
                countsByActivity={countsByActivity}
                scalesByActivity={scalesByActivity}
                defaultSort="severity"
            />

            <SessionFiles files={sessionFiles} />

            <SessionNotes notes={sessao.observacoes ?? null} />
        </div>
    );
}
