/**
 * Tipos para relatórios de faturamento
 */

// Tipos de relatório disponíveis
export type TipoRelatorioFaturamento = 'convenio' | 'terapeuta' | 'pais';

export const TIPO_RELATORIO_LABELS: Record<TipoRelatorioFaturamento, string> = {
    convenio: 'Relatório para Convênio',
    terapeuta: 'Relatório para Terapeuta',
    pais: 'Relatório para Pais/Responsáveis',
};

export const TIPO_RELATORIO_DESCRICAO: Record<TipoRelatorioFaturamento, string> = {
    convenio: 'Relatório com evolução clínica e horas realizadas para prestação de contas ao convênio.',
    terapeuta: 'Relatório com horas realizadas e valores a pagar para o terapeuta.',
    pais: 'Relatório com evolução clínica e valores a pagar para os pais/responsáveis.',
};

// Informações de sessão para o relatório
export interface SessaoRelatorio {
    data: string;
    dataFormatted: string;
    horaInicio: string;
    horaFim: string;
    duracao: number; // em minutos
    tipoAtividade: string;
    tipoAtividadeLabel: string;
    valorTerapeuta?: number;
    valorCliente?: number;
    observacoes?: string;
    // Dados do cliente (para relatório do terapeuta)
    clienteNome?: string;
    clienteIdade?: string;
}

// Dados do cliente para relatório
export interface ClienteRelatorio {
    id: string;
    nome: string;
    dataNascimento?: string;
    idade?: string;
    cpf?: string;
    convenio?: string;
    numeroCarteirinha?: string;
}

// Dados do terapeuta para relatório
export interface TerapeutaRelatorio {
    id: string;
    nome: string;
    email?: string;
    especialidades: string[];
    crm?: string;
    registroProfissional?: string;
}

// Filtros para geração do relatório
export interface FiltrosRelatorio {
    tipoRelatorio: TipoRelatorioFaturamento;
    clienteId?: string;
    terapeutaId?: string;
    periodoInicio: Date;
    periodoFim: Date;
    incluirEvolucaoClinica?: boolean;
}

// Dados gerados para o relatório de convênio
export interface DadosRelatorioConvenio {
    dataEmissao: string;
    cliente: ClienteRelatorio;
    terapeuta: TerapeutaRelatorio;
    especialidade: string;
    sessoes: SessaoRelatorio[];
    totalHoras: number;
    totalSessoes: number;
    evolucaoClinica?: string;
    assinaturaTerapeuta: boolean;
}

// Dados gerados para o relatório do terapeuta
export interface DadosRelatorioTerapeuta {
    dataEmissao: string;
    mesReferencia: string; // Ex: "Janeiro/2026"
    cliente: ClienteRelatorio;
    terapeuta: TerapeutaRelatorio;
    especialidade: string;
    sessoes: SessaoRelatorio[];
    totalHoras: number;
    totalSessoes: number;
    valorPorSessao: number;
    valorTotal: number;
}

// Dados gerados para o relatório dos pais
export interface DadosRelatorioPais {
    dataEmissao: string;
    cliente: ClienteRelatorio;
    terapeuta: TerapeutaRelatorio;
    especialidade: string;
    sessoes: SessaoRelatorio[];
    totalHoras: number;
    totalSessoes: number;
    evolucaoClinica?: string;
    valorPorHora: number;
    valorTotal: number;
}

// União de todos os tipos de dados de relatório
export type DadosRelatorio = DadosRelatorioConvenio | DadosRelatorioTerapeuta | DadosRelatorioPais;

// Relatório salvo
export interface RelatorioFaturamentoSalvo {
    id: string;
    tipo: TipoRelatorioFaturamento;
    titulo: string;
    clienteId: string;
    clienteNome: string;
    terapeutaId: string;
    terapeutaNome: string;
    periodoInicio: string;
    periodoFim: string;
    criadoEm: string;
    pdfUrl?: string;
}
