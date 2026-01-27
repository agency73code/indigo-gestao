import { ACCESS_LEVELS } from "./accessLevels.js";

export function normalizeRoleName(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
}

export function getAccessLevelFromRoles(roles: string[]): {
    level: number;
    role: string;
} {
    return roles.reduce(
        (acc, role) => {
            const key = normalizeRoleName(role);
            const level = ACCESS_LEVELS[key] ?? 0;

            if (level > acc.level) {
                return {
                    level,
                    role: key,
                };
            }

            return acc;
        }, 
        { level: 1, role: 'acompanhante terapeutico' },
    );
}