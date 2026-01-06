import type { OccupationalSession } from "./types.js";

export function prepareToAttentionActivities(sessions: OccupationalSession[]) {
    const statsByStimulus = new Map<
    number,
    {
        name: string;
        performed: number;
        assisted: number;
        failed: number;
        durationTotal: number;
        durationCount: number;
    }
    >();

    for (const session of sessions) {
        for (const trial of session.trials) {
            const stimulusId = trial.estimulos_ocp_id;
            if (!stimulusId) continue;

            let stats = statsByStimulus.get(stimulusId);

            if (!stats) {
                stats = {
                    name: trial.estimulosOcp?.nome ?? 'Atividade sem nome',
                    performed: 0,
                    assisted: 0,
                    failed: 0,
                    durationTotal: 0,
                    durationCount: 0,
                };
                statsByStimulus.set(stimulusId, stats);
            }

            if (trial.resultado === 'independent') stats.performed++;
            else if (trial.resultado === 'prompted') stats.assisted++;
            else if (trial.resultado === 'error') stats.failed++;

            if (trial.duracao_minutos != null) {
                stats.durationTotal += trial.duracao_minutos;
                stats.durationCount++;
            }
        }
    }

    return Array.from(statsByStimulus.entries()).map(([id, stats]) => ({
        id,
        nome: stats.name,
        counts: {
            desempenhou: stats.performed,
            comAjuda: stats.assisted,
            naoDesempenhou: stats.failed,
        },
        total: stats.performed + stats.assisted + stats.failed,
        durationMinutes: stats.durationCount > 0
            ? Math.round(stats.durationTotal / stats.durationCount)
            : null,
    }));
}