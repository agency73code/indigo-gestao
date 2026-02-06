import type { PhysioSession } from "./types.js";

export function calcAutonomyByCategory(sessions: PhysioSession[]) {
    const activityStatus: Record<number, { name: string; total: number; independent: number }> = {};

    for (const session of sessions) {
        for (const trial of session.trials) {
            const id = trial.estimulos_ocp_id;
            const name = trial.estimulosOcp?.nome || 'Atividade sem nome';

            if (!activityStatus[id]) {
                activityStatus[id] = { name, total: 0, independent: 0 };
            }

            activityStatus[id].total += 1;

            if (trial.resultado === 'independent') {
                activityStatus[id].independent += 1;
            }
        }
    }

    const result = Object.values(activityStatus).map(item => {
        const score = item.total > 0 ? Math.round((item.independent / item.total) * 100) : 0;

        return {
            atividade: item.name,
            desempenho: score,
        };
    });

    // Ordenar desc por desempenho
    return result.sort((a, b) => b.desempenho - a.desempenho);
}