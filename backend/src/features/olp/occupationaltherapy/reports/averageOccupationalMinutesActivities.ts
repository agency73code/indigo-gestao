import type { OccupationalSession } from "./types.js";

export function averageOccupationalMinutesActivities(sessions: OccupationalSession[]) {
    const activities = new Map<number, { name: string; total: number; count: number }>();

    for (const session of sessions) {
        const countedInSessions = new Set<number>();

        for (const trial of session.trials) {
            if (!trial.estimulos_ocp_id || !trial.duracao_minutos) continue;

            if (countedInSessions.has(trial.estimulos_ocp_id)) continue;
            countedInSessions.add(trial.estimulos_ocp_id);

            if (!activities.has(trial.estimulos_ocp_id)) {
                activities.set(trial.estimulos_ocp_id, {
                    name: trial.estimulosOcp?.nome ?? 'Atividade sem nome',
                    total: 0,
                    count: 0,
                });
            }

            const activity = activities.get(trial.estimulos_ocp_id)!;
            activity.total += trial.duracao_minutos;
            activity.count += 1;
        }
    }

    return Array.from(activities.values())
        .map((a) => ({
            atividade: a.name,
            duracao: Math.round(a.total / a.count),
        }))
        .sort((a, b) => b.duracao - a.duracao);
}