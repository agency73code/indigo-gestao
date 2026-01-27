import { fromZonedTime } from 'date-fns-tz';

const TIMEZONE_SP = 'America/Sao_Paulo';

export function buildUtcDate(date: string, time: string) {
    const localDateTime = `${date}T${time}:00`;
    return fromZonedTime(localDateTime, TIMEZONE_SP);
}