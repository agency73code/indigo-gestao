export function sanitizeUtf8Filename(name: string): string {
  return name
    .replace(/[\r\n\t\0]/g, ' ')
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim();
}