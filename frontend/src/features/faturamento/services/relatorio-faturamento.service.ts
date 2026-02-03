/**
 * Serviço de relatórios de faturamento
 * 
 * Gera PDFs de relatórios mensais para convênios, terapeutas e pais
 */

import { TIPO_ATIVIDADE_FATURAMENTO_LABELS } from '../types/faturamento.types';
import type { ItemFaturamento } from '../types/faturamento.types';
import type {
    TipoRelatorioFaturamento,
    SessaoRelatorio,
    DadosRelatorioConvenio,
    DadosRelatorioTerapeuta,
    DadosRelatorioPais,
    ClienteRelatorio,
    TerapeutaRelatorio,
} from '../types/relatorio-faturamento.types';
import { downloadPdfRelatorio } from '../utils/relatorio-pdf-generator';
import { downloadWordRelatorio } from '../utils/relatorio-word-generator';

// ============================================
// TIPOS INTERNOS
// ============================================

interface GerarRelatorioInput {
    tipo: TipoRelatorioFaturamento;
    clienteId?: string;
    terapeutaId?: string;
    periodoInicio: Date;
    periodoFim: Date;
    lancamentos: ItemFaturamento[];
    evolucaoClinica?: string;
}

interface RelatorioGerado {
    success: boolean;
    pdfUrl?: string;
    pdfBlob?: Blob;
    dados: DadosRelatorioConvenio | DadosRelatorioTerapeuta | DadosRelatorioPais;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatarData(data: string | Date): string {
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatarMesReferencia(periodoInicio: Date): string {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[periodoInicio.getMonth()]}/${periodoInicio.getFullYear()}`;
}

function mapearSessoes(lancamentos: ItemFaturamento[]): SessaoRelatorio[] {
    return lancamentos.map(l => ({
        data: l.data,
        dataFormatted: formatarData(l.data),
        horaInicio: l.horarioInicio ?? '',
        horaFim: l.horarioFim ?? '',
        duracao: l.duracaoMinutos,
        tipoAtividade: l.tipoAtividade,
        tipoAtividadeLabel: TIPO_ATIVIDADE_FATURAMENTO_LABELS[l.tipoAtividade] ?? l.tipoAtividade,
        valorTerapeuta: l.valorTotal,
        valorCliente: l.valorTotalCliente,
        clienteNome: l.clienteNome,
        clienteIdade: l.clienteIdade,
    })).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}

// ============================================
// EXTRAIR DADOS DOS LANÇAMENTOS
// ============================================

/**
 * Extrai dados do cliente diretamente dos lançamentos (sem chamada à API)
 */
function extrairDadosCliente(lancamentos: ItemFaturamento[], clienteId: string): ClienteRelatorio {
    const lancamentoCliente = lancamentos.find(l => l.clienteId === clienteId);
    
    if (!lancamentoCliente) {
        throw new Error('Cliente não encontrado nos lançamentos');
    }

    return {
        id: clienteId,
        nome: lancamentoCliente.clienteNome ?? 'Cliente',
        // Dados abaixo não estão no mock, mas podem vir do backend futuramente
        dataNascimento: undefined,
        idade: undefined,
        cpf: undefined,
        convenio: undefined,
        numeroCarteirinha: undefined,
    };
}

/**
 * Extrai dados do terapeuta diretamente dos lançamentos (sem chamada à API)
 */
function extrairDadosTerapeuta(lancamentos: ItemFaturamento[], terapeutaId: string): TerapeutaRelatorio {
    const lancamentoTerapeuta = lancamentos.find(l => l.terapeutaId === terapeutaId);
    
    if (!lancamentoTerapeuta) {
        throw new Error('Terapeuta não encontrado nos lançamentos');
    }

    return {
        id: terapeutaId,
        nome: lancamentoTerapeuta.terapeutaNome ?? 'Terapeuta',
        email: undefined,
        especialidades: lancamentoTerapeuta.area ? [lancamentoTerapeuta.area] : [],
        crm: undefined,
        registroProfissional: undefined,
    };
}

// ============================================
// GERAR DADOS DO RELATÓRIO
// ============================================

export function gerarDadosRelatorioConvenio(
    input: GerarRelatorioInput
): DadosRelatorioConvenio {
    if (!input.clienteId) {
        throw new Error('Cliente é obrigatório para relatório de convênio');
    }

    // Filtrar lançamentos do cliente
    const lancamentosCliente = input.lancamentos.filter(l => l.clienteId === input.clienteId);
    
    if (lancamentosCliente.length === 0) {
        throw new Error('Nenhum lançamento encontrado para este cliente no período');
    }

    // Pegar terapeuta do primeiro lançamento (assumindo um terapeuta por relatório)
    const terapeutaId = lancamentosCliente[0].terapeutaId;
    
    const cliente = extrairDadosCliente(input.lancamentos, input.clienteId);
    const terapeuta = extrairDadosTerapeuta(input.lancamentos, terapeutaId);

    const sessoes = mapearSessoes(lancamentosCliente);
    const totalMinutos = lancamentosCliente.reduce((acc, l) => acc + l.duracaoMinutos, 0);

    return {
        dataEmissao: formatarData(new Date()),
        cliente,
        terapeuta,
        especialidade: terapeuta.especialidades[0] ?? 'Não informado',
        sessoes,
        totalHoras: totalMinutos / 60,
        totalSessoes: sessoes.length,
        evolucaoClinica: input.evolucaoClinica,
        assinaturaTerapeuta: true,
    };
}

export function gerarDadosRelatorioTerapeuta(
    input: GerarRelatorioInput
): DadosRelatorioTerapeuta {
    if (!input.terapeutaId) {
        throw new Error('Terapeuta é obrigatório para relatório do terapeuta');
    }

    // Filtrar lançamentos do terapeuta
    const lancamentosTerapeuta = input.lancamentos.filter(l => l.terapeutaId === input.terapeutaId);
    
    if (lancamentosTerapeuta.length === 0) {
        throw new Error('Nenhum lançamento encontrado para este terapeuta no período');
    }

    // Pegar cliente do primeiro lançamento
    const clienteId = lancamentosTerapeuta[0].clienteId;
    
    if (!clienteId) {
        throw new Error('Cliente não encontrado nos lançamentos');
    }

    const cliente = extrairDadosCliente(input.lancamentos, clienteId);
    const terapeuta = extrairDadosTerapeuta(input.lancamentos, input.terapeutaId);

    const sessoes = mapearSessoes(lancamentosTerapeuta);
    const totalMinutos = lancamentosTerapeuta.reduce((acc, l) => acc + l.duracaoMinutos, 0);
    const totalValor = lancamentosTerapeuta.reduce((acc, l) => acc + (l.valorTotal ?? 0), 0);
    const valorPorSessao = sessoes.length > 0 ? totalValor / sessoes.length : 0;

    return {
        dataEmissao: formatarData(new Date()),
        mesReferencia: formatarMesReferencia(input.periodoInicio),
        cliente,
        terapeuta,
        especialidade: terapeuta.especialidades[0] ?? 'Não informado',
        sessoes,
        totalHoras: totalMinutos / 60,
        totalSessoes: sessoes.length,
        valorPorSessao,
        valorTotal: totalValor,
    };
}

export function gerarDadosRelatorioPais(
    input: GerarRelatorioInput
): DadosRelatorioPais {
    if (!input.clienteId) {
        throw new Error('Cliente é obrigatório para relatório dos pais');
    }

    // Filtrar lançamentos do cliente
    const lancamentosCliente = input.lancamentos.filter(l => l.clienteId === input.clienteId);
    
    if (lancamentosCliente.length === 0) {
        throw new Error('Nenhum lançamento encontrado para este cliente no período');
    }

    // Pegar terapeuta do primeiro lançamento
    const terapeutaId = lancamentosCliente[0].terapeutaId;
    
    const cliente = extrairDadosCliente(input.lancamentos, input.clienteId);
    const terapeuta = extrairDadosTerapeuta(input.lancamentos, terapeutaId);

    const sessoes = mapearSessoes(lancamentosCliente);
    const totalMinutos = lancamentosCliente.reduce((acc, l) => acc + l.duracaoMinutos, 0);
    const totalValor = lancamentosCliente.reduce((acc, l) => acc + (l.valorTotalCliente ?? 0), 0);
    const valorPorHora = totalMinutos > 0 ? (totalValor / (totalMinutos / 60)) : 0;

    return {
        dataEmissao: formatarData(new Date()),
        cliente,
        terapeuta,
        especialidade: terapeuta.especialidades[0] ?? 'Não informado',
        sessoes,
        totalHoras: totalMinutos / 60,
        totalSessoes: sessoes.length,
        evolucaoClinica: input.evolucaoClinica,
        valorPorHora,
        valorTotal: totalValor,
    };
}

// ============================================
// FUNÇÃO PRINCIPAL DE GERAÇÃO
// ============================================

export async function gerarRelatorioFaturamento(
    input: GerarRelatorioInput
): Promise<RelatorioGerado> {
    let dados: DadosRelatorioConvenio | DadosRelatorioTerapeuta | DadosRelatorioPais;

    switch (input.tipo) {
        case 'convenio':
            dados = gerarDadosRelatorioConvenio(input);
            break;
        case 'terapeuta':
            dados = gerarDadosRelatorioTerapeuta(input);
            break;
        case 'pais':
            dados = gerarDadosRelatorioPais(input);
            break;
        default:
            throw new Error('Tipo de relatório inválido');
    }

    // Gerar nome do arquivo
    const mesAno = input.periodoInicio.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }).replace('/', '-');
    const tipoLabel = input.tipo === 'convenio' ? 'convenio' : input.tipo === 'terapeuta' ? 'terapeuta' : 'pais';
    const nomeRef = input.tipo === 'terapeuta' 
        ? dados.terapeuta.nome.split(' ')[0]?.toLowerCase() 
        : dados.cliente.nome.split(' ')[0]?.toLowerCase();
    const nomeArquivo = `relatorio-${tipoLabel}-${nomeRef}-${mesAno}.pdf`;

    // Gerar e baixar o PDF
    await downloadPdfRelatorio({
        tipo: input.tipo,
        dados,
        nomeArquivo,
    });

    return {
        success: true,
        dados,
    };
}

// ============================================
// FUNÇÃO DE EXPORTAÇÃO PARA WORD
// ============================================

export async function exportarRelatorioWord(
    input: GerarRelatorioInput
): Promise<RelatorioGerado> {
    let dados: DadosRelatorioConvenio | DadosRelatorioTerapeuta | DadosRelatorioPais;

    switch (input.tipo) {
        case 'convenio':
            dados = gerarDadosRelatorioConvenio(input);
            break;
        case 'terapeuta':
            dados = gerarDadosRelatorioTerapeuta(input);
            break;
        case 'pais':
            dados = gerarDadosRelatorioPais(input);
            break;
        default:
            throw new Error('Tipo de relatório inválido');
    }

    // Gerar nome do arquivo
    const mesAno = input.periodoInicio.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }).replace('/', '-');
    const tipoLabel = input.tipo === 'convenio' ? 'convenio' : input.tipo === 'terapeuta' ? 'terapeuta' : 'pais';
    const nomeRef = input.tipo === 'terapeuta' 
        ? dados.terapeuta.nome.split(' ')[0]?.toLowerCase() 
        : dados.cliente.nome.split(' ')[0]?.toLowerCase();
    const nomeArquivo = `relatorio-${tipoLabel}-${nomeRef}-${mesAno}.doc`;

    // Gerar e baixar o documento Word
    await downloadWordRelatorio({
        tipo: input.tipo,
        dados,
        nomeArquivo,
    });

    return {
        success: true,
        dados,
    };
}
