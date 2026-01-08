export function calculateAge(dateOfBirth: Date | null, referenceDate = new Date()): string {
    if (dateOfBirth === null) return 'Não informado';

    let years = referenceDate.getFullYear() - dateOfBirth.getFullYear();
    let months = referenceDate.getMonth() - dateOfBirth.getMonth();

    // If birthday hasn't happened yet this month
    if (months < 0) {
        years--;
        months += 12;
    }

    // Fine adjustment if day hasn't been reached yet
    if (referenceDate.getDate() < dateOfBirth.getDate()) {
        months--;
        if (months < 0) {
            years--;
            months += 12;
        }
    }

    return `${years} years ${months} months`;
}