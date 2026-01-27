import { ACCESS_LEVELS } from "./accessLevels.js";
import { normalizeRoleName } from "./normalizeRoleName.js";

type AreaRole = {
    area: string | null;
    role: string | null;
};

const initial: { level: number; area: string; roleKey: string } = {
    level: 0,
    area: 'Não informado',
    roleKey: 'Não informado',
}

export function getPrimaryAreaFromAreaRoles(items: AreaRole[]): {
    level: number;
    area: string;
    roleKey: string;
} {
    return items.reduce(
        (acc, item) => {
            if (!item?.role || !item?.area) return acc;

            const roleKey = normalizeRoleName(item.role);
            const level = ACCESS_LEVELS[roleKey] ?? 0;

            if (level > acc.level) {
                return {
                    level,
                    area: item.area,
                    roleKey,
                };
            }

            return acc;
        },
        initial,
    );
}