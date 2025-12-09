export function normalizedBirthDate(birthDate: string) {
    return birthDate.replace(/T.*| .*/, '');
}
