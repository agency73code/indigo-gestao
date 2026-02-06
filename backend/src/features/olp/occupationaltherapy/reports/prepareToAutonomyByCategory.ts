import type { OccupationalSession } from "./types.js";

export function prepareToAutonomyByCategory(sessions: OccupationalSession[]) {
    const statsByCategory = new Map<
        string,
        { total: number; independente: number }
    >();

    for (const session of sessions) {
        for (const trial of session.trials) {
            const category =
                trial.estimulosOcp?.nome ?? 'Sem categoria';

            let stats = statsByCategory.get(category);

            if (!stats) {
                stats = { total: 0, independente: 0 };
                statsByCategory.set(category, stats);
            }

            stats.total++;

            if (trial.resultado === 'independent') {
                stats.independente++;
            }
        }
    }

    return Array.from(statsByCategory.entries()).map(
        ([categoria, stats]) => ({
            categoria,
            autonomia:
                stats.total > 0
                ? Math.round((stats.independente / stats.total) * 100)
                : 0,
        })
    );
}