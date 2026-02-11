export const removeNonAlphanumeric = (value: string) =>
  value.replace(/[^A-Za-z0-9]/g, '');