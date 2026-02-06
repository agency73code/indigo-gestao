/**
 * Utilitários de cálculo para faturamento
 * 
 * NOTA: Estes cálculos são temporários e devem ser feitos pelo backend
 * após a implementação da API. Este arquivo pode ser removido depois.
 */

import type { TipoAtividade, ValoresTerapeuta } from '../types';
import { TIPO_ATIVIDADE } from '../types';

/**
 * Calcula a duração em minutos entre dois horários
 */
export function calcularDuracaoMinutos(horarioInicio: string, horarioFim: string): number {
    const [hI, mI] = horarioInicio.split(':').map(Number);
    const [hF, mF] = horarioFim.split(':').map(Number);
    
    const inicioMinutos = hI * 60 + mI;
    const fimMinutos = hF * 60 + mF;
    
    return fimMinutos - inicioMinutos;
}

/**
 * Formata minutos para exibição (ex: "1h 30min")
 */
export function formatarDuracao(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

/**
 * Obtém o valor por hora baseado no tipo de atividade
 */
export function getValorPorTipoAtividade(
    tipo: TipoAtividade,
    valores: ValoresTerapeuta
): number {
    const mapa: Record<TipoAtividade, keyof ValoresTerapeuta> = {
        [TIPO_ATIVIDADE.SESSAO_CONSULTORIO]: 'sessaoConsultorio',
        [TIPO_ATIVIDADE.SESSAO_HOMECARE]: 'sessaoHomecare',
        [TIPO_ATIVIDADE.DESENVOLVIMENTO_MATERIAIS]: 'desenvolvimentoMateriais',
        [TIPO_ATIVIDADE.SUPERVISAO_RECEBIDA]: 'supervisaoRecebida',
        [TIPO_ATIVIDADE.SUPERVISAO_DADA]: 'supervisaoDada',
        [TIPO_ATIVIDADE.REUNIAO]: 'reuniao',
    };
    
    return valores[mapa[tipo]];
}

/**
 * Calcula o valor total baseado na duração e valor por hora
 */
export function calcularValorTotal(duracaoMinutos: number, valorHora: number): number {
    return (duracaoMinutos / 60) * valorHora;
}

/**
 * Formata valor monetário para BRL
 */
export function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

/**
 * Formata data ISO para DD/MM/YYYY
 */
export function formatarData(dataISO: string): string {
    const [year, month, day] = dataISO.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Valida se o horário de fim é posterior ao início
 */
export function validarHorarios(horarioInicio: string, horarioFim: string): boolean {
    const duracao = calcularDuracaoMinutos(horarioInicio, horarioFim);
    return duracao > 0;
}

/**
 * Gera resumo textual da duração
 */
export function gerarResumoHoras(totalMinutos: number): {
    horas: number;
    minutos: number;
    texto: string;
} {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return {
        horas,
        minutos,
        texto: formatarDuracao(totalMinutos),
    };
}
