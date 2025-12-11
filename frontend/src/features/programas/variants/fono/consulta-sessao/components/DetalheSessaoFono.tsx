import { useMemo } from 'react';
import HeaderSessao from '@/features/programas/consulta-sessao/components/HeaderSessao';
import SessionNotes from '@/features/programas/consulta-sessao/pages/components/SessionNotes';
import SessionFiles from '@/features/programas/consulta-sessao/pages/components/SessionFiles';
import FonoSessionSummary from './FonoSessionSummary';
import FonoStimuliPerformanceList from './FonoStimuliPerformanceList';
import type { Sessao, Patient, ProgramDetail, SessionFile } from '@/features/programas/consulta-sessao/types';

interface DetalheSessaoFonoProps {
    sessao: Sessao;
    paciente: Patient;
    programa: ProgramDetail;
    onBack?: () => void;
}

type StatusKind = 'verde' | 'laranja' | 'vermelho';

type Counts = {
    erro: number;
    ajuda: number;
    indep: number;
};

// Função para determinar o status da sessão
function getFonoStatus(counts: Counts): StatusKind {
    const total = counts.erro + counts.ajuda + counts.indep;
    if (total === 0) return 'vermelho';
    
    const max = Math.max(counts.indep, counts.ajuda, counts.erro);
    if (counts.indep === max) return 'verde';
    if (counts.ajuda === max) return 'laranja';
    return 'vermelho';
}

// Função para agregar contagens por estímulo
function aggregateByStimulus(registros: Sessao['registros']): Record<string, Counts> {
    return registros.reduce<Record<string, Counts>>((acc, reg) => {
        const stimulusId = reg.stimulusId ?? 'default';
        if (!acc[stimulusId]) {
            acc[stimulusId] = { erro: 0, ajuda: 0, indep: 0 };
        }
        if (reg.resultado === 'erro') acc[stimulusId].erro += 1;
        else if (reg.resultado === 'ajuda') acc[stimulusId].ajuda += 1;
        else acc[stimulusId].indep += 1;
        return acc;
    }, {});
}

// Função para somar contagens
function sumCounts(a: Counts, b: Counts): Counts {
    return {
        erro: a.erro + b.erro,
        ajuda: a.ajuda + b.ajuda,
        indep: a.indep + b.indep,
    };
}

// Placeholder para files de sessão (caso não tenha o campo files)
function getSessionFiles(_sessionId: string): SessionFile[] {
    return [];
}

export default function DetalheSessaoFono({ sessao, paciente, programa, onBack }: DetalheSessaoFonoProps) {
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
    const statusSessao = useMemo(() => getFonoStatus(countsSessao), [countsSessao]);

    // Mapear estímulos com informações necessárias
    const stimuliInfo = useMemo(
        () => {
            const info = programa.stimuli.map((s) => ({
                id: s.id,
                label: s.label,
                order: s.order,
                objetivoEspecifico: s.description || null,
            }));
            return info;
        },
        [programa.stimuli],
    );

    const workedCount = Object.keys(countsByStimulus).length;
    const plannedCount = programa.stimuli.filter((s) => s.active).length;

    const sessionFiles = useMemo(() => {
        return sessao.files || getSessionFiles(sessao.id);
    }, [sessao.id, sessao.files]);

    return (
        <div className="space-y-4">
            <HeaderSessao sessao={sessao} paciente={paciente} programa={programa} onBack={onBack} />

            <FonoSessionSummary
                counts={countsSessao}
                plannedStimuli={plannedCount}
                workedStimuli={workedCount}
                status={statusSessao}
            />

            <FonoStimuliPerformanceList
                stimuli={stimuliInfo}
                countsByStimulus={countsByStimulus}
                defaultSort="severity"
            />

            <SessionFiles files={sessionFiles} />

            <SessionNotes notes={sessao.observacoes ?? null} />
        </div>
    );
}
