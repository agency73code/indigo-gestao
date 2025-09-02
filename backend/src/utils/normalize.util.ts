export function normalizeAccessInfo(value: string) {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
    return normalized;
}