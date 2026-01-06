import type { OccupationalSession } from "./types.js";

export function calcOcuppationalKpis(sessions: OccupationalSession[]) {
    let independent = 0;
    let prompted = 0;
    let failed = 0;
    let totalSessions = 0;
    let totalTime = 0;

    const countedDurations = new Set<string>();
    const countedActivities = new Set<string | number>();
    
    for (const session of sessions) {
        totalSessions += 1;
        
        
        for (const trial of session.trials) {
            const key = `${session.id}-${trial.estimulos_ocp_id}`;

            if (trial.estimulos_ocp_id) {
                countedActivities.add(trial.estimulos_ocp_id);
            }

            if (trial.resultado === 'independent') independent += 1;
            else if (trial.resultado === 'prompted') prompted += 1;
            else if (trial.resultado === 'error') failed += 1;

            if (
                trial.duracao_minutos &&
                !countedDurations.has(key)
            ) {
                totalTime += trial.duracao_minutos;
                countedDurations.add(key);
            }
        }
    }

    return {
        desempenhou: independent,
        desempenhouComAjuda: prompted,
        naoDesempenhou: failed,
        tempoTotal: totalTime,
        atividadesTotal: countedActivities.size,
        sessoesTotal: totalSessions,
    }
}