/**
 * Utilitários compartilhados para seções do drawer
 */

// Mapa de relações de parentesco
export const PARENTESCO_LABELS: Record<string, string> = {
    'mae': 'Mãe',
    'pai': 'Pai',
    'avo': 'Avó/Avô',
    'tio': 'Tia/Tio',
    'responsavel': 'Responsável legal',
    'tutor': 'Tutor(a)',
    'outro': 'Outro',
};

/**
 * Formata data ISO para DD/MM/YYYY
 */
export function formatDate(value?: string | null): string {
    if (!value) return 'Não informado';
    const [year, month, day] = value.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Formata data ISO para MM/YYYY
 */
export function formatMesAno(value?: string | null): string {
    if (!value) return 'Não informado';
    if (value.includes('/')) return value;

    const [year, month] = value.split('T')[0].split('-');
    return `${month}/${year}`;
}

/**
 * Formata campo Sim/Não
 */
export function formatSimNao(value: string | null | undefined): string {
    if (!value) return 'Não informado';
    return value === 'sim' ? 'Sim' : 'Não';
}

/**
 * Formata campo Sim/Não/Com Ajuda
 */
export function formatSimNaoComAjuda(value: string | null | undefined): string {
    if (!value) return 'Não informado';
    if (value === 'sim') return 'Sim';
    if (value === 'nao') return 'Não';
    if (value === 'com_ajuda') return 'Com ajuda';
    return value;
}

/**
 * Formata marco de desenvolvimento (meses + status)
 */
export function formatMarcoDesenvolvimento(marco?: { meses?: string; status?: string; naoRealiza?: boolean; naoSoubeInformar?: boolean }): string {
    if (!marco) return 'Não informado';
    // Verificar pelo status (novo formato)
    if (marco.status === 'naoRealiza') return 'Não realiza';
    if (marco.status === 'naoSoubeInformar') return 'Não soube informar';
    // Verificar pelos booleans (formato antigo)
    if (marco.naoRealiza) return 'Não realiza';
    if (marco.naoSoubeInformar) return 'Não soube informar';
    // Retornar meses se tiver
    if (marco.meses) return `${marco.meses} meses`;
    return 'Não informado';
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calcularIdade(dataNasc?: string | null): number | null {
    if (!dataNasc) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}
