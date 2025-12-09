export function brMoneyToNumber(value: string): number | null {
    if (!value) return null;
    return Number(
        value
            .replace(/[^\d,.-]/g, '')
            .replace(/\./g, '')
            .replace(',', '.'),
    );
}
