import { parseTimeToMinutes } from "./parseTimeToMinutes.js";

export function computeDurationMinutes(inicio: string, fim: string): number | null {
    const start = parseTimeToMinutes(inicio);
    const end = parseTimeToMinutes(fim);

    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

    let diff = end - start;
    if (diff < 0) diff += 24 * 60;
    return diff;
}