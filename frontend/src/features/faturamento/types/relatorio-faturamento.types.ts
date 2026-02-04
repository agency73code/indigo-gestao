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
    dataExtenso: string; // Ex: "quinta-feira, 2 de janeiro de 2025"
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

// Dados da dona da clínica (fixo)
export const DADOS_DONA_CLINICA = {
    nome: 'Leticia da Silva Sena',
    titulo: 'Sócia Fundadora da Clínica Instituto Índigo e Supervisora ABA',
    crfa: 'CRFª 2-21234',
    certificacoes: [
        'Certificada no PECS pela Pyramid Educational Consultants',
        'Certificada no PROMPT nível 1 pela Prompt Institute',
        'Certificada no PODD pela Cerebral Palsy Education Centre Therapy Services',
        'Certificada no nível 1 do Protocolo IISCA pelo QABA – análise funcional de comportamentos problema para planejamento de tratamento baseado em habilidades',
    ],
    formacao: [
        'Analista do Comportamento aplicada voltado ao Transtorno do Espectro Autista e Atrasos do Desenvolvimento',
        'Doutoranda em Ciências pela Universidade Federal de São Paulo',
        'Especialista em Terapia da Aceitação e do Compromisso pelo Centro Brasileiro de Ciência Comportamental Contextual',
        'Graduanda em Psicologia pela Anhanguera',
    ],
};

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
    mesReferencia: string; // Ex: "JANEIRO"
    anoReferencia: number; // Ex: 2025
    cliente: ClienteRelatorio;
    terapeuta: TerapeutaRelatorio;
    especialidade: string;
    sessoes: SessaoRelatorio[];
    totalHoras: number;
    totalSessoes: number;
    // Campos para preenchimento manual (grifado)
    apresentacaoCaso?: string; // Terapeuta preenche
    desempenhoCrianca?: string; // Terapeuta preenche
    // Dados calculados
    diasAtendimento: number[]; // Ex: [2, 3, 6, 8, 9...]
    sessoesMaxPorDia: number; // máximo de sessões em um único dia
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
