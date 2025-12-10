import type { PhysioSession } from "./types.js";

export function calcActivityDuration(sessions: PhysioSession[]) {
    // Map para agrupar cargas por estímulo
    const activities: Record<number, { name: string, loads: number[] }> = {};

    for (const session of sessions) {
        for (const trial of session.trials) {
            const hasLoad = trial.utilizou_carga && trial.valor_carga != null;
            if (!hasLoad) continue;
            
            const id = trial.estimulos_ocp_id;
            const name = trial.estimulosOcp?.nome || 'Atividade sem nome';

            if (!activities[id]) {
                activities[id] = { name, loads: [] };
            }

            const load = trial.valor_carga as number;
            activities[id].loads.push(load);
        }
    }

    const result = Object.values(activities).map((item) => {
        const avg = item.loads.reduce((sum, n) => sum + n, 0) / item.loads.length;

        return {
            atividade: item.name,
            carga: Math.round(avg * 10) / 10,
        };
    });

    return result.sort((a, b) => b.carga - a.carga);
}