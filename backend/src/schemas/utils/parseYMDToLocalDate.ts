export function parseYMDToLocalDate(value: string | null): Date {
    if (value === null) return new Date('invalid');
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return new Date('invalid');

    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);

    return new Date(year, month, day);
}