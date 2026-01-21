import { ACCESS_LEVELS } from "./accessLevels.js";

export function getAccessLevel(role?: string): number {
    if (!role) return 0;
    const normalized = role
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    return ACCESS_LEVELS[normalized] ?? 0;
} 