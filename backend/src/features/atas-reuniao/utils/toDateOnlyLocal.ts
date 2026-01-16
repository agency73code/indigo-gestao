export function toDateOnlyLocal(yyyyMmDd: string): Date {
    return new Date(`${yyyyMmDd}T00:00:00`);
}