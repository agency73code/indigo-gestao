export function calcularHorasFaturadasPorReuniao(duracaoMinutos: number): number {
    if (duracaoMinutos <= 0) return 0;
    if (duracaoMinutos <= 89) return 1;
    if (duracaoMinutos <= 149) return 2;
    return 3;
}