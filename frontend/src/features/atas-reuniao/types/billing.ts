/**
 * ============================================================================
 * TIPOS E CONSTANTES: FATURAMENTO DE ATAS DE REUNIÃO
 * ============================================================================
 * 
 * Define os dados de faturamento automático para atas de reunião.
 * 
 * LÓGICA DE FATURAMENTO:
 * - Algumas finalidades de reunião geram faturamento automático
 * - O valor é calculado com base no cadastro do terapeuta
 * - Observações e arquivos de faturamento são separados dos dados da ata
 * 
 * MAPEAMENTO FINALIDADE → TIPO FATURAMENTO:
 * 
 * | Finalidade da Ata           | Tipo de Faturamento           | Campo no Cadastro Terapeuta    |
 * |-----------------------------|-------------------------------|--------------------------------|
 * | Supervisão Recebida (NOVO)  | hora_supervisao_recebida      | valorHoraSupervisaoRecebida    |
 * | Desenv. Materiais (NOVO)    | hora_desenvolvimento_materiais| valorHoraDesenvolvimentoMateriais |
 * | Supervisão do Terapeuta     | hora_supervisao_dada          | valorHoraSupervisaoDada        |
 * | Orientação Parental         | hora_reuniao                  | valorHoraReuniao               |
 * | Reunião de Equipe           | hora_reuniao                  | valorHoraReuniao               |
 * | Reunião c/ Outro Especialista| hora_reuniao                 | valorHoraReuniao               |
 * | Reunião com a Escola        | hora_reuniao                  | valorHoraReuniao               |
 * | Supervisão do AT            | hora_reuniao                  | valorHoraReuniao               |
 * | Outros                      | hora_reuniao                  | valorHoraReuniao               |
 * 
 * BACKEND: Para implementar, adicionar na tabela de atas:
 * - tipoFaturamento: enum('hora_reuniao', 'hora_supervisao_recebida', 'hora_supervisao_dada', 'hora_desenvolvimento_materiais')
 * - valorHora: decimal (valor por hora usado no cálculo)
 * - observacaoFaturamento: text (separado do conteúdo da ata)
 * - Tabela relacionada para arquivos de faturamento (comprovantes)
 * 
 * ============================================================================
 */

// ============================================
// TIPOS DE FATURAMENTO
// ============================================

/**
 * Tipos de faturamento disponíveis (mapeamento com cadastro do terapeuta)
 */
export const TIPO_FATURAMENTO_ATA = {
    HORA_REUNIAO: 'hora_reuniao',
    SUPERVISAO_RECEBIDA: 'hora_supervisao_recebida',
    SUPERVISAO_DADA: 'hora_supervisao_dada',
    DESENVOLVIMENTO_MATERIAIS: 'hora_desenvolvimento_materiais',
} as const;

export type TipoFaturamentoAta = (typeof TIPO_FATURAMENTO_ATA)[keyof typeof TIPO_FATURAMENTO_ATA];

export const TIPO_FATURAMENTO_ATA_LABELS: Record<TipoFaturamentoAta, string> = {
    [TIPO_FATURAMENTO_ATA.HORA_REUNIAO]: 'Hora de Reunião',
    [TIPO_FATURAMENTO_ATA.SUPERVISAO_RECEBIDA]: 'Hora Supervisão Recebida',
    [TIPO_FATURAMENTO_ATA.SUPERVISAO_DADA]: 'Hora Supervisão Dada',
    [TIPO_FATURAMENTO_ATA.DESENVOLVIMENTO_MATERIAIS]: 'Hora Desenvolvimento de Materiais',
};

// ============================================
// DADOS DE FATURAMENTO
// ============================================

/**
 * Arquivo anexo de faturamento (comprovantes, recibos, etc)
 * 
 * BACKEND: Criar tabela `ata_arquivo_faturamento` com:
 * - id, ataId, nome, tipo, tamanho, url, criadoEm
 */
export interface ArquivoFaturamentoAta {
    id: string;
    nome: string;
    tipo: string;
    tamanho: number;
    file?: File;
    url?: string;
}

/**
 * Dados de faturamento de uma ata de reunião
 * 
 * IMPORTANTE:
 * - O tipo de faturamento é determinado automaticamente pela finalidade da reunião
 * - A duração é calculada pelos horários início/fim já informados na ata
 * - O valor será calculado pelo backend com base no cadastro do terapeuta
 * 
 * Este formulário coleta APENAS:
 * - Observações para faturamento (dados bancários, notas fiscais, etc)
 * - Arquivos (comprovantes de pagamento, recibos)
 * 
 * BACKEND: Adicionar campos na tabela `ata_reuniao`:
 * - tipo_faturamento: varchar (enum acima) - determinado automaticamente
 * - observacao_faturamento: text
 */
export interface DadosFaturamentoAta {
    /** Tipo de faturamento (determinado automaticamente pela finalidade) */
    tipoFaturamento: TipoFaturamentoAta;
    /** Observações específicas de faturamento (dados bancários, notas, etc) */
    observacaoFaturamento?: string;
    /** Arquivos de faturamento (comprovantes de pagamento, recibos) */
    arquivosFaturamento?: ArquivoFaturamentoAta[];
}

// ============================================
// VALORES INICIAIS
// ============================================

export const DADOS_FATURAMENTO_ATA_INITIAL: DadosFaturamentoAta = {
    tipoFaturamento: TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
    observacaoFaturamento: '',
    arquivosFaturamento: [],
};

// ============================================
// MAPEAMENTO: FINALIDADE → TIPO FATURAMENTO
// ============================================

/**
 * Mapeia a finalidade da reunião para o tipo de faturamento correspondente
 */
export function getFaturamentoTypeByFinalidade(finalidade: string): TipoFaturamentoAta {
    const map: Record<string, TipoFaturamentoAta> = {
        // Novas finalidades
        'supervisao_recebida': TIPO_FATURAMENTO_ATA.SUPERVISAO_RECEBIDA,
        'desenvolvimento_materiais': TIPO_FATURAMENTO_ATA.DESENVOLVIMENTO_MATERIAIS,
        
        // Supervisão dada
        'supervisao_terapeuta': TIPO_FATURAMENTO_ATA.SUPERVISAO_DADA,
        
        // Todas as outras são "hora de reunião"
        'orientacao_parental': TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
        'reuniao_equipe': TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
        'reuniao_outro_especialista': TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
        'reuniao_escola': TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
        'supervisao_at': TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
        'outros': TIPO_FATURAMENTO_ATA.HORA_REUNIAO,
    };

    return map[finalidade] || TIPO_FATURAMENTO_ATA.HORA_REUNIAO;
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcula a duração em horas decimais (ex: 1.5 para 1h30min)
 */
export function calcularDuracaoHoras(horarioInicio: string, horarioFim: string): number | null {
    if (!horarioInicio || !horarioFim) return null;

    const [hI, mI] = horarioInicio.split(':').map(Number);
    const [hF, mF] = horarioFim.split(':').map(Number);

    const inicioMinutos = hI * 60 + mI;
    const fimMinutos = hF * 60 + mF;

    if (fimMinutos <= inicioMinutos) return null;

    const duracaoMinutos = fimMinutos - inicioMinutos;
    return duracaoMinutos / 60; // Converte para horas decimais
}

/**
 * Formata duração em horas (ex: 1.5 → "1h 30min")
 */
export function formatarDuracaoHoras(horas: number): string {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);

    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

/**
 * Formata valor monetário
 */
export function formatarValor(valor: number | undefined): string {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

/**
 * Calcula o valor total a faturar (duração × valor/hora)
 */
export function calcularValorTotal(duracaoHoras: number | null, valorHora: number | undefined): number | null {
    if (!duracaoHoras || !valorHora) return null;
    return duracaoHoras * valorHora;
}
