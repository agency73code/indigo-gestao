/**
 * ============================================================================
 * TIPOS DE FATURAMENTO DE SESSÃO
 * ============================================================================
 * 
 * Tipos para dados de faturamento que serão incluídos automaticamente
 * nos formulários de registro de sessão.
 * 
 * CAMPOS A SEREM ADICIONADOS NA TABELA DO BANCO:
 * 
 * Tabela: sessao (ou session)
 * ──────────────────────────────────────────────────────────────────────────
 * | Campo                      | Tipo           | Descrição                  |
 * ──────────────────────────────────────────────────────────────────────────
 * | data_sessao               | DATE           | Data da sessão (editável)   |
 * | horario_inicio            | TIME           | Hora de início (HH:mm)      |
 * | horario_fim               | TIME           | Hora de fim (HH:mm)         |
 * | tipo_atendimento          | ENUM           | 'consultorio' | 'homecare'  |
 * | ajuda_custo               | BOOLEAN        | Se houve ajuda de custo     |
 * | observacao_faturamento    | TEXT           | Observações do faturamento  |
 * ──────────────────────────────────────────────────────────────────────────
 * 
 * Tabela: arquivo_faturamento_sessao (nova tabela)
 * ──────────────────────────────────────────────────────────────────────────
 * | Campo                      | Tipo           | Descrição                  |
 * ──────────────────────────────────────────────────────────────────────────
 * | id                        | UUID           | ID do arquivo               |
 * | sessao_id                 | UUID           | FK para sessão              |
 * | nome                      | VARCHAR(255)   | Nome do arquivo             |
 * | caminho                   | VARCHAR(500)   | Caminho no storage          |
 * | tipo                      | VARCHAR(100)   | MIME type                   |
 * | tamanho                   | INTEGER        | Tamanho em bytes            |
 * | criado_em                 | TIMESTAMP      | Data de criação             |
 * ──────────────────────────────────────────────────────────────────────────
 * 
 * ============================================================================
 */

// ============================================
// ENUMS E CONSTANTES
// ============================================

/**
 * Tipo de atendimento para cálculo de faturamento
 */
export const TIPO_ATENDIMENTO = {
    CONSULTORIO: 'consultorio',
    HOMECARE: 'homecare',
} as const;

export type TipoAtendimento = (typeof TIPO_ATENDIMENTO)[keyof typeof TIPO_ATENDIMENTO];

export const TIPO_ATENDIMENTO_LABELS: Record<TipoAtendimento, string> = {
    [TIPO_ATENDIMENTO.CONSULTORIO]: 'Consultório',
    [TIPO_ATENDIMENTO.HOMECARE]: 'Homecare',
};

// ============================================
// TIPOS PRINCIPAIS
// ============================================

/**
 * Arquivo de comprovante de faturamento
 * (separado dos arquivos da sessão clínica)
 */
export interface ArquivoFaturamento {
    id: string;
    nome: string;
    tipo: string; // MIME type
    tamanho: number;
    url?: string;
    caminho?: string;
    arquivoId?: string;
    file?: File; // Para upload
    removed?: boolean; // Para edição
}

/**
 * Dados de faturamento da sessão
 * 
 * IMPORTANTE PARA O BACKEND:
 * - Estes campos devem ser adicionados ao payload de criação/edição de sessão
 * - O campo `dataSessao` substitui a data fixa atual
 * - `horarioInicio` e `horarioFim` são obrigatórios para cálculo de horas
 * - `tipoAtendimento` determina o valor da hora (consultório vs homecare)
 * - `ajudaCusto` só é relevante quando `tipoAtendimento === 'homecare'`
 */
export interface DadosFaturamentoSessao {
    /** Data da sessão (YYYY-MM-DD) - editável, default: hoje */
    dataSessao: string;
    
    /** Horário de início (HH:mm) */
    horarioInicio: string;
    
    /** Horário de fim (HH:mm) */
    horarioFim: string;
    
    /** Tipo de atendimento: consultório ou homecare */
    tipoAtendimento: TipoAtendimento;
    
    /** Se houve ajuda de custo (só para homecare) */
    ajudaCusto: boolean;
    
    /** Observações específicas do faturamento (comprovantes, notas, etc) */
    observacaoFaturamento?: string;
    
    /** Arquivos de comprovante de faturamento */
    arquivosFaturamento?: ArquivoFaturamento[];
}

/**
 * Estado inicial dos dados de faturamento
 */
export const DADOS_FATURAMENTO_INITIAL: DadosFaturamentoSessao = {
    dataSessao: new Date().toISOString().split('T')[0],
    horarioInicio: '',
    horarioFim: '',
    tipoAtendimento: TIPO_ATENDIMENTO.CONSULTORIO,
    ajudaCusto: false,
    observacaoFaturamento: '',
    arquivosFaturamento: [],
};

// ============================================
// TIPOS DE INPUT PARA API
// ============================================

/**
 * Input de arquivo para upload
 * Usado no formulário antes de enviar para API
 */
export interface ArquivoFaturamentoInput {
    id: string;
    nome: string;
    file: File;
}

/**
 * Payload de faturamento para API de sessão
 * 
 * BACKEND: Adicionar estes campos ao payload de criação/edição de sessão
 * Exemplo de uso no service:
 * 
 * ```typescript
 * async function saveSession(payload: SaveSessionPayload & DadosFaturamentoPayload) {
 *   // payload.faturamento contém os dados de faturamento
 * }
 * ```
 */
export interface DadosFaturamentoPayload {
    faturamento: {
        dataSessao: string;
        horarioInicio: string;
        horarioFim: string;
        tipoAtendimento: TipoAtendimento;
        ajudaCusto: boolean;
        observacaoFaturamento?: string;
        arquivos?: ArquivoFaturamentoInput[];
    };
}

// ============================================
// VALIDAÇÃO
// ============================================

/**
 * Valida se os dados de faturamento estão completos
 */
export function validarDadosFaturamento(dados?: DadosFaturamentoSessao): {
    valido: boolean;
    erros: Record<string, string>;
    mensagem?: string;
} {
    const erros: Record<string, string> = {};

    if (!dados) {
        return {
            valido: false,
            erros: { geral: 'Dados de faturamento não informados' },
            mensagem: 'Preencha os dados de faturamento da sessão',
        };
    }

    if (!dados.dataSessao) {
        erros.dataSessao = 'Data da sessão é obrigatória';
    }

    if (!dados.horarioInicio) {
        erros.horarioInicio = 'Horário de início é obrigatório';
    }

    if (!dados.horarioFim) {
        erros.horarioFim = 'Horário de fim é obrigatório';
    }

    // Validar se horário de fim é após horário de início
    if (dados.horarioInicio && dados.horarioFim) {
        const [hI, mI] = dados.horarioInicio.split(':').map(Number);
        const [hF, mF] = dados.horarioFim.split(':').map(Number);
        const inicioMinutos = hI * 60 + mI;
        const fimMinutos = hF * 60 + mF;
        
        if (fimMinutos <= inicioMinutos) {
            erros.horarioFim = 'Horário de fim deve ser após o início';
        }
    }

    const errosList = Object.values(erros);

    return {
        valido: Object.keys(erros).length === 0,
        erros,
        mensagem: errosList.length > 0 ? errosList[0] : undefined,
    };
}

/**
 * Calcula a duração em minutos
 */
export function calcularDuracaoMinutos(horarioInicio: string, horarioFim: string): number {
    const [hI, mI] = horarioInicio.split(':').map(Number);
    const [hF, mF] = horarioFim.split(':').map(Number);
    return (hF * 60 + mF) - (hI * 60 + mI);
}

/**
 * Formata duração para exibição
 */
export function formatarDuracao(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}
