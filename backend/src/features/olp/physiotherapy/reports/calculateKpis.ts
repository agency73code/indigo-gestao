import type { PhysioSession } from "./types.js";

export function calcKpis(sessions: PhysioSession[]) {
    const compensationActivities = new Set<number>();
    const discomfortActivities = new Set<number>();
    let independent = 0;
    let prompted = 0;
    let failed = 0;
    let totalActivities = 0;

    for (const session of sessions) {
        for (const trial of session.trials) {
            totalActivities += 1;

            if (trial.resultado === 'independent') independent += 1;
            else if (trial.resultado === 'prompted') prompted += 1;
            else if (trial.resultado === 'error') failed += 1;

            if (trial.teve_compensacao) {
                compensationActivities.add(trial.estimulos_ocp_id);
            }

            if (trial.teve_desconforto) {
                discomfortActivities.add(trial.estimulos_ocp_id);
            }
        }
    }

    return {
        desempenhou: independent,
        desempenhouComAjuda: prompted,
        naoDesempenhou: failed,
        atividadesTotal: totalActivities,
        compensacaoTotal: compensationActivities.size,
        desconfortoTotal: discomfortActivities.size,
    };
}