/**
 * Tipos para Prontuário Psicológico (Psicoterapia)
 */

// ============================================
// TIPOS BASE
// ============================================

export type ID = string;

// ============================================
// CUIDADOR / NÚCLEO FAMILIAR
// ============================================

export interface MembroNucleoFamiliar {
    id: ID;
    nome: string;
    cpf?: string;
    parentesco: string;
    descricaoRelacao?: string; // Para quando parentesco é "Outro"
    dataNascimento?: string;
    idade?: number | string;
    ocupacao?: string;
    origemBanco?: boolean; // true se veio dos cuidadores do cliente
}

// ============================================
// TERAPIA PRÉVIA
// ============================================

export interface TerapiaPrevia {
    id: ID;
    profissional: string;
    especialidadeAbordagem: string;
    tempoIntervencao: string;
    observacao?: string;
    ativo: boolean;
    origemAnamnese?: boolean; // true se veio da anamnese
}

// ============================================
// CLIENTE / DADOS PESSOAIS
// ============================================

export interface ClienteProntuario {
    id: ID;
    nome: string;
    dataNascimento: string;
    idade: string;
    genero?: string;
    enderecoCompleto?: string;
    telefoneResidencial?: string;
    celular?: string;
    email?: string;
    fotoUrl?: string;
}

// ============================================
// TERAPEUTA
// ============================================

export interface TerapeutaProntuario {
    id: ID;
    nome: string;
    crp?: string;
    fotoUrl?: string;
}

// ============================================
// INFORMAÇÕES EDUCACIONAIS
// ============================================

export interface InformacoesEducacionais {
    nivelEscolaridade: string;
    instituicaoFormacao: string;
    profissaoOcupacao: string;
    observacoes: string;
}

// ============================================
// AVALIAÇÃO DA DEMANDA
// ============================================

export interface AvaliacaoDemanda {
    encaminhadoPor: string;
    motivoBuscaAtendimento: string;
    atendimentosAnteriores: string;
    observacoes: string;
    terapiasPrevias?: TerapiaPrevia[];
}

// ============================================
// ARQUIVO DA EVOLUÇÃO (padrão similar a Atas)
// ============================================

export interface ArquivoEvolucao {
    id: ID;
    nome: string;
    tipo: 'foto' | 'video' | 'documento';
    mimeType?: string;
    tamanho: number;
    url?: string;
    caminho?: string;
    arquivoId?: string;  // ID do arquivo no storage (para construir URL de download)
    file?: File;         // Arquivo local (upload)
    removed?: boolean;   // Flag para remoção em edição
}

/**
 * Input para upload de anexo (padrão Atas)
 */
export interface AnexoInput {
    id: string;          // UUID temporário para tracking no form
    nome: string;        // Nome customizado pelo usuário
    file: File;          // Arquivo original
}

// ============================================
// EVOLUÇÃO TERAPÊUTICA (SESSÃO)
// ============================================

export interface EvolucaoTerapeutica {
    id: ID;
    numeroSessao: number;
    dataEvolucao: string;
    descricaoSessao: string;
    arquivos: ArquivoEvolucao[];
    criadoEm?: string;
    atualizadoEm?: string;
}

// ============================================
// PRONTUÁRIO PSICOLÓGICO
// ============================================

export interface ProntuarioPsicologico {
    id?: ID;
    
    // Dados do cliente (preenchidos automaticamente)
    clienteId: ID;
    cliente?: ClienteProntuario;
    
    // Dados do terapeuta
    terapeutaId: ID;
    terapeuta?: TerapeutaProntuario;
    
    // Informações Educacionais
    informacoesEducacionais: InformacoesEducacionais;
    
    // Núcleo Familiar (puxado dos cuidadores, mas com observações extras)
    nucleoFamiliar: MembroNucleoFamiliar[];
    observacoesNucleoFamiliar: string;
    
    // Avaliação da Demanda
    avaliacaoDemanda: AvaliacaoDemanda;
    
    // Objetivos de Trabalho
    objetivosTrabalho: string;
    
    // Avaliação do Atendimento
    avaliacaoAtendimento: string;
    
    // Evoluções/Sessões
    evolucoes: EvolucaoTerapeutica[];
    
    // Metadados
    status: 'ativo' | 'inativo';
    criadoEm?: string;
    atualizadoEm?: string;
}

// ============================================
// CABEÇALHO DA EVOLUÇÃO (para exibição)
// ============================================

export interface CabecalhoEvolucao {
    nomeCliente: string;
    idadeCliente: string;
    diagnosticoClinico: string;
    motivoBusca: string;
    nomeTerapeuta: string;
    crpTerapeuta: string;
    dataEvolucao: string;
    numeroSessao: number;
}

// ============================================
// FORMULÁRIO DE CADASTRO
// ============================================

export interface ProntuarioFormData {
    // Identificação
    clienteId: ID;
    clienteNome: string;
    dataNascimento: string;
    idade: string;
    genero: string;
    enderecoCompleto: string;
    telefoneResidencial: string;
    celular: string;
    email: string;
    
    // Informações Educacionais
    nivelEscolaridade: string;
    instituicaoFormacao: string;
    profissaoOcupacao: string;
    observacoesEducacao: string;
    
    // Núcleo Familiar (automático + observações)
    nucleoFamiliar: MembroNucleoFamiliar[];
    observacoesNucleoFamiliar: string;
    
    // Avaliação da Demanda
    encaminhadoPor: string;
    motivoBuscaAtendimento: string;
    atendimentosAnteriores: string;
    observacoesAvaliacao: string;
    terapiasPrevias: TerapiaPrevia[];
    
    // Objetivos de Trabalho
    objetivosTrabalho: string;
    
    // Avaliação do Atendimento
    avaliacaoAtendimento: string;
    
    // Terapeuta
    terapeutaId: ID;
    terapeutaNome: string;
    terapeutaCrp: string;
}

// ============================================
// FORMULÁRIO DE EVOLUÇÃO
// ============================================

export interface EvolucaoFormData {
    prontuarioId: ID;
    dataEvolucao: string;
    descricaoSessao: string;
    arquivos: ArquivoEvolucao[];
}

// ============================================
// STEPS DO PRONTUÁRIO
// ============================================

export const PRONTUARIO_STEPS = [
    'Identificação',
    'Informações Educacionais',
    'Núcleo Familiar',
    'Avaliação da Demanda',
    'Objetivos de Trabalho',
    'Avaliação do Atendimento',
] as const;

export type ProntuarioStep = typeof PRONTUARIO_STEPS[number];

// ============================================
// RESPOSTA DA API
// ============================================

export interface ProntuarioResponse {
    success: boolean;
    data?: ProntuarioPsicologico;
    message?: string;
    errors?: string[];
}

export interface EvolucaoResponse {
    success: boolean;
    data?: EvolucaoTerapeutica;
    message?: string;
    errors?: string[];
}

// ============================================
// LISTAGEM
// ============================================

export interface ProntuarioListItem {
    id: ID;
    clienteId: ID;
    clienteNome: string;
    clienteIdade: string;
    terapeutaNome: string;
    terapeutaCrp: string;
    totalEvolucoes: number;
    ultimaEvolucao?: string;
    status: 'ativo' | 'inativo';
    criadoEm: string;
}

export interface ProntuarioListFilters {
    q?: string;
    status?: 'ativo' | 'inativo' | 'todos';
    page?: number;
    pageSize?: number;
}

export interface ProntuarioListResult {
    items: ProntuarioListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
