export function brMoneyToNumber(valor: string): number {
  return Number(
    valor
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
}