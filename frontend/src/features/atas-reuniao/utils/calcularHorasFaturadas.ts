/**
 * Módulo de cálculo de horas faturadas para Atas de Reunião
 * 
 * Esta lógica será posteriormente implementada no backend para maior
 * performance e segurança. A implementação aqui serve para validação
 * visual com dados mockados.
 */

/**
 * Calcula as horas faturadas com base na duração real da reunião.
 * 
 * Regras de faturamento:
 * - Até 1h29min (89 minutos) = 1 hora faturada
 * - De 1h30min (90 minutos) até 2h29min (149 minutos) = 2 horas faturadas
 * - De 2h30min (150 minutos) ou mais = 3 horas faturadas (máximo)
 * 
 * @param duracaoMinutos - Duração real da reunião em minutos
 * @returns Número de horas faturadas (1, 2 ou 3)
 */
export function calcularHorasFaturadasPorReuniao(duracaoMinutos: number): number {
    if (duracaoMinutos <= 0) {
        return 0;
    }
    
    // Até 1h29min (89 minutos) = 1 hora
    if (duracaoMinutos <= 89) {
        return 1;
    }
    
    // De 1h30min (90 minutos) até 2h29min (149 minutos) = 2 horas
    if (duracaoMinutos <= 149) {
        return 2;
    }
    
    // 2h30min (150 minutos) ou mais = 3 horas (máximo)
    return 3;
}

/**
 * Calcula o total de horas faturadas para uma lista de atas.
 * 
 * @param atas - Lista de atas com horarioInicio e horarioFim
 * @returns Objeto com horasRealizadas (minutos) e horasFaturadas (horas inteiras)
 */
export function calcularTotaisHoras(
    atas: Array<{ horarioInicio: string; horarioFim: string }>
): { minutosRealizados: number; horasFaturadas: number } {
    let minutosRealizados = 0;
    let horasFaturadas = 0;
    
    for (const ata of atas) {
        const duracao = calcularDuracaoMinutos(ata.horarioInicio, ata.horarioFim);
        
        if (duracao > 0) {
            minutosRealizados += duracao;
            horasFaturadas += calcularHorasFaturadasPorReuniao(duracao);
        }
    }
    
    return {
        minutosRealizados,
        horasFaturadas,
    };
}

/**
 * Calcula a duração em minutos entre dois horários no formato HH:MM
 */
function calcularDuracaoMinutos(horarioInicio: string, horarioFim: string): number {
    const [horaInicio, minInicio] = horarioInicio.split(':').map(Number);
    const [horaFim, minFim] = horarioFim.split(':').map(Number);
    
    const inicioMinutos = horaInicio * 60 + minInicio;
    const fimMinutos = horaFim * 60 + minFim;
    
    return fimMinutos - inicioMinutos;
}

/**
 * Formata horas faturadas para exibição
 * @param horas - Número de horas faturadas
 * @returns String formatada (ex: "12h")
 */
export function formatarHorasFaturadas(horas: number): string {
    return `${horas}h`;
}
