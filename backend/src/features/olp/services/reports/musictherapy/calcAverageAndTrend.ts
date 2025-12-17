import type { MusicSession } from "./types.js";
import { toFixedNumber } from "./utils.js";

export function calcAverageAndTrend(sessions: MusicSession[], field: 'participacao' | 'suporte') {
    const values: number[] = [];

    sessions.forEach(session => {
        session.trials.forEach(trial => {
            const v = trial[field];
            if (v != null) values.push(v);
        });
    });

    if (values.length === 0) {
        return null;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;

    let trend: number | undefined;

    if (values.length >= 4) {
        const half = Math.floor(values.length / 2);
        const first = values.slice(0, half);
        const second = values.slice(half);

        const m1 = first.reduce((a, b) => a + b, 0) / first.length;
        const m2 = second.reduce((a, b) => a + b, 0) / second.length;

        trend = m2 - m1;
    }

    return {
        media: toFixedNumber(average),
        tendencia: toFixedNumber(trend),
        totalRegistros: values.length,
    }
}