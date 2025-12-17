export function toFixedNumber(value: number | null | undefined, decimals = 1, fallback = 0): number {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Number(value.toFixed(decimals));
}