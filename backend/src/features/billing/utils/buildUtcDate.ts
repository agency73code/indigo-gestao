import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const TIMEZONE_SP = 'America/Sao_Paulo';

type SessionTimeDTO = {
    day: string;
    start: string;
    end: string;
}

export function buildUtcDate(date: string, time: string) {
    const localDateTime = `${date}T${time}:00`;
    return fromZonedTime(localDateTime, TIMEZONE_SP);
}

export function buildLocalSessionTime(
    startUtc: Date,
    endUtc: Date,
): SessionTimeDTO {
    const startSp = toZonedTime(startUtc, TIMEZONE_SP);
    const endSp = toZonedTime(endUtc, TIMEZONE_SP);

    return {
        day: format(startSp, "yyyy-MM-dd"),
        start: format(startSp, "HH:mm"),
        end: format(endSp, "HH:mm"),
    }
}