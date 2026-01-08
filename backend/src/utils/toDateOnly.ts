export function toDateOnly(date: Date | null) {
  if (!date) return null;
  return date.toISOString().slice(0, 10); // "2026-01-04"
}