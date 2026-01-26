/**
 * Contratos da API para Prontuário Psicológico
 * 
 * Define as interfaces para comunicação com o backend (snake_case)
 * Estes tipos representam exatamente o que a API recebe/retorna.
 * 
 * IMPORTANTE: Manter sincronizado com o backend
 */

// ============================================
// RESPONSES DA API
// ============================================

/**
 * Item resumido para listagem de prontuários
 * Usado no endpoint GET /prontuarios-psicologicos
 */
export interface ApiProntuarioListItem {
    id: string;
    cliente_id: string;
    cliente_nome: string;
    cliente_idade: string;
    terapeuta_nome: string;
    terapeuta_crp: string;
    total_evolucoes: number;
    ultima_evolucao?: string;
    status: 'ativo' | 'inativo';
    criado_em: string;
}

export interface ApiListProntuariosResponse {
    items: ApiProntuarioListItem[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

/**
 * Prontuário completo
 * Usado no endpoint GET /prontuarios-psicologicos/:id
 */
export interface ApiProntuarioPsicologico {
    id: string;
    cliente_id: string;
    terapeuta_id: string;
    
    // Informações Educacionais
    informacoes_educacionais: {
        nivel_escolaridade: string;
        instituicao_formacao: string;
        profissao_ocupacao: string;
        observacoes: string;
    };
    
    // Núcleo Familiar
    nucleo_familiar: ApiMembroNucleoFamiliar[];
    observacoes_nucleo_familiar: string;
    
    // Avaliação da Demanda
    avaliacao_demanda: {
        encaminhado_por: string;
        motivo_busca_atendimento: string;
        atendimentos_anteriores: string;
        observacoes: string;
        terapias_previas?: ApiTerapiaPrevia[];
    };
    
    // Objetivos e Avaliação
    objetivos_trabalho: string;
    avaliacao_atendimento: string;
    
    // Evoluções
    evolucoes?: ApiEvolucaoTerapeutica[];
    
    // Metadados
    status: 'ativo' | 'inativo';
    criado_em: string;
    atualizado_em?: string;
    
    // Relacionamentos expandidos (quando incluídos)
    cliente?: {
        id: string;
        nome: string;
        data_nascimento: string;
        idade: string;
        genero?: string;
        foto_url?: string;
    };
    terapeuta?: {
        id: string;
        nome: string;
        crp?: string;
        foto_url?: string;
    };
}

export interface ApiMembroNucleoFamiliar {
    id: string;
    nome: string;
    cpf?: string;
    parentesco: string;
    descricao_relacao?: string;
    data_nascimento?: string;
    idade?: number | string;
    ocupacao?: string;
    origem_banco?: boolean;
}

export interface ApiTerapiaPrevia {
    id: string;
    profissional: string;
    especialidade_abordagem: string;
    tempo_intervencao: string;
    observacao?: string;
    ativo: boolean;
    origem_anamnese?: boolean;
}

export interface ApiEvolucaoTerapeutica {
    id: string;
    numero_sessao: number;
    data_evolucao: string;
    descricao_sessao: string;
    arquivos: ApiArquivoEvolucao[];
    criado_em: string;
    atualizado_em?: string;
}

export interface ApiArquivoEvolucao {
    id: string;
    nome: string;
    tipo: 'foto' | 'video' | 'documento';
    mime_type?: string;
    tamanho: number;
    url?: string;
    caminho?: string;
    arquivo_id?: string;
}

// ============================================
// PAYLOADS PARA API (CREATE/UPDATE)
// ============================================

export interface ApiCreateProntuarioPayload {
    cliente_id: string;
    terapeuta_id: string;
    
    informacoes_educacionais: {
        nivel_escolaridade: string;
        instituicao_formacao: string;
        profissao_ocupacao: string;
        observacoes: string;
    };
    
    nucleo_familiar: Omit<ApiMembroNucleoFamiliar, 'id'>[];
    observacoes_nucleo_familiar: string;
    
    avaliacao_demanda: {
        encaminhado_por: string;
        motivo_busca_atendimento: string;
        atendimentos_anteriores: string;
        observacoes: string;
        terapias_previas?: Omit<ApiTerapiaPrevia, 'id'>[];
    };
    
    objetivos_trabalho: string;
    avaliacao_atendimento: string;
}

export interface ApiUpdateProntuarioPayload extends Partial<ApiCreateProntuarioPayload> {
    status?: 'ativo' | 'inativo';
}

export interface ApiCreateEvolucaoPayload {
    prontuario_id: string;
    data_evolucao: string;
    descricao_sessao: string;
}

// ============================================
// CONSTANTES DA API
// ============================================

export const API_STATUS_PRONTUARIO = {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
} as const;

export const API_TIPO_ARQUIVO = {
    FOTO: 'foto',
    VIDEO: 'video',
    DOCUMENTO: 'documento',
} as const;

// ============================================
// ENDPOINT DE IA - RESUMO
// ============================================

/**
 * Payload para gerar resumo com IA
 * Endpoint: POST /ai/generate-prontuario-summary
 */
export interface ApiGenerateSummaryPayload {
    evolutions: Array<{
        numero_sessao: number;
        data: string;
        descricao_sessao: string;
    }>;
    patient_name: string;
    therapist_name: string;
    period_label: string;
}

export interface ApiGenerateSummaryResponse {
    success: boolean;
    summary: string;
    disclaimer: string;
    sessions_used: number;
}

// ============================================
// VALIDAÇÃO DE ARQUIVOS
// ============================================

/** Tamanho máximo de arquivo: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Tipos de arquivo permitidos */
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/** Extensões permitidas */
export const ALLOWED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.mp4', '.webm',
    '.pdf', '.doc', '.docx',
] as const;

/**
 * Valida se arquivo é permitido
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
        return { valid: false, error: 'Tipo de arquivo não permitido' };
    }
    
    return { valid: true };
}
