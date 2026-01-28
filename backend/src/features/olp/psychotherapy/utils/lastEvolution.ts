export function getLastEvolution(dates: Date[]): Date | null {
    if (dates.length === 0) return null;

    return dates.reduce((latest, current) =>
        current > latest ? current : latest
    );
}