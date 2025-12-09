import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';

dayjs.locale('pt-br');

export function formatDateOnly(value: Date | string): string {
    return dayjs(value).format('YYYY-MM-DD');
}

export function userCanSeeAllReports(perfilAcesso?: string): boolean {
    if (!perfilAcesso) return false;
    const level = ACCESS_LEVELS[perfilAcesso.toLowerCase()] ?? 0;
    return level >= 5;
}
