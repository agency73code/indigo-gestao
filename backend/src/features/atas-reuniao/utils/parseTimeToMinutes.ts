export function parseTimeToMinutes(hhmm: string): number {
    const [hStr, mStr] = hhmm.split(':');
    const h = Number(hStr);
    const m = Number(mStr);

    if (!Number.isInteger(h) || !Number.isInteger(m)) return NaN;
    return h * 60 + m;
}