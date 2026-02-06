export function parseLoadValue(raw: string | number | null | undefined): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') {
        return Number.isFinite(raw) ? raw : null;
    }

    const normalized = raw
        .trim()
        .replace(',', '.')
        .replace(/[^0-9.]/g, '');

    if (!normalized) return null;

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
}