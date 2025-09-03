export function normalizeAccessInfo(value: string) {
    const base = value.trim().toLowerCase();
    if (base.includes('@')) {
        return base.replace(/\s+/g, '');
    }
    return base.replace(/\D+/g, '');
}