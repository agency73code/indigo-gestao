/**
 * Gerador de PDF para relatórios de faturamento
 * 
 * Usa jsPDF e jspdf-autotable para gerar PDFs diretamente
 * Segue o padrão visual da Anamnese (logo Indigo + cores institucionais)
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
    TipoRelatorioFaturamento,
    DadosRelatorioConvenio,
    DadosRelatorioTerapeuta,
    DadosRelatorioPais,
} from '../types/relatorio-faturamento.types';

// ============================================
// LOGO INDIGO (PNG)
// ============================================

// Logo importada do assets (usar PNG para compatibilidade com jsPDF)
import LOGO_INDIGO from '@/assets/logos/indigo.png';

// ============================================
// INFORMAÇÕES DA CLÍNICA (igual Anamnese)
// ============================================

const CLINIC_INFO = {
    name: 'Clínica Instituto Índigo',
    address: 'Av Vital Brasil, 305, Butantã, CJ 905-909',
    cep: 'CEP 05503-001',
    phone: '+55 11 96973-2227',
    email: 'clinica.indigo@gmail.com',
    instagram: '@inst.indigo',
};

// ============================================
// CORES (padrão Indigo - igual anamnese: #395482)
// ============================================

const CORES = {
    // Azul institucional Indigo (anamnese: #395482)
    primaria: [57, 84, 130] as [number, number, number], // #395482
    primariaClara: [236, 240, 241] as [number, number, number], // #ecf0f1
    texto: [55, 65, 81] as [number, number, number], // #374151 (gray-700)
    textoClaro: [107, 114, 128] as [number, number, number], // #6b7280 (gray-500)
    textoLabel: [156, 163, 175] as [number, number, number], // #9ca3af (gray-400) - para labels
    sucesso: [39, 174, 96] as [number, number, number], // #27ae60
    branco: [255, 255, 255] as [number, number, number],
    cinzaClaro: [249, 250, 251] as [number, number, number], // #f9fafb
    borda: [229, 231, 235] as [number, number, number], // #e5e7eb (gray-200)
};

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

function formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatarHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
}

// ============================================
// FUNÇÕES AUXILIARES DO PDF
// ============================================

/**
 * Adiciona cabeçalho com logo e informações (padrão Anamnese)
 * Layout: Logo + Título grande + Subtítulo (Nome • Info)
 */
function adicionarCabecalhoComLogo(
    doc: jsPDF,
    titulo: string,
    subtitulo: string,
    infoExtra?: string,
    infoExtra2?: string
): number {
    // Logo Indigo (lado esquerdo) - igual anamnese
    try {
        doc.addImage(LOGO_INDIGO, 'PNG', 15, 12, 32, 32);
    } catch {
        console.warn('Não foi possível adicionar a logo');
    }
    
    // Título grande (ao lado da logo) - igual anamnese
    doc.setFontSize(24);
    doc.setTextColor(...CORES.primaria);
    doc.setFont('helvetica', 'normal');
    doc.text(titulo, 52, 24);
    
    // Subtítulo - igual anamnese (Nome • Info)
    doc.setFontSize(12);
    doc.setTextColor(...CORES.texto);
    doc.text(subtitulo, 52, 34);
    
    // Info extra (se houver) - menor e mais claro
    let nextY = 42;
    if (infoExtra) {
        doc.setFontSize(10);
        doc.setTextColor(...CORES.textoClaro);
        doc.text(infoExtra, 52, nextY);
        nextY += 5;
    }
    
    // Info extra 2 (referente ao mês)
    if (infoExtra2) {
        doc.setFontSize(10);
        doc.setTextColor(...CORES.textoClaro);
        doc.text(infoExtra2, 52, nextY);
    }
    
    return 58; // Retorna posição Y após o cabeçalho (sem linha divisória aqui)
}

/**
 * Adiciona seção com título (padrão Anamnese)
 * Estilo: Título em azul #395482 com borda inferior de 1px
 */
function adicionarSecao(
    doc: jsPDF,
    titulo: string,
    yPos: number
): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título da seção - igual anamnese (14px, azul, normal)
    doc.setFontSize(14);
    doc.setTextColor(...CORES.primaria);
    doc.setFont('helvetica', 'normal');
    doc.text(titulo, 15, yPos);
    
    // Linha sob o título - igual anamnese (1px, azul)
    doc.setDrawColor(...CORES.primaria);
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 3, pageWidth - 15, yPos + 3);
    
    return yPos + 12;
}

/**
 * Adiciona linha divisória horizontal
 */
function adicionarLinhaDivisoria(
    doc: jsPDF,
    yPos: number,
    cor: [number, number, number] = CORES.borda
): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(...cor);
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
}

/**
 * Adiciona campo de informação com label e valor (padrão Anamnese)
 * Estilo: Label pequeno cinza em maiúsculo, valor normal abaixo
 */
function adicionarCampoInfo(
    doc: jsPDF,
    label: string,
    valor: string,
    x: number,
    y: number,
    _largura: number
): number {
    // Label - igual anamnese (pequeno, cinza, maiúsculo)
    doc.setFontSize(9);
    doc.setTextColor(...CORES.textoClaro);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), x, y);
    
    // Valor - igual anamnese (normal, não bold)
    doc.setFontSize(11);
    doc.setTextColor(...CORES.texto);
    doc.setFont('helvetica', 'normal');
    doc.text(valor || '-', x, y + 6);
    
    return y + 14;
}

/**
 * Adiciona tabela de resumo
 */
function adicionarResumo(
    doc: jsPDF,
    items: { label: string; valor: string }[],
    yPos: number
): number {
    const headers = items.map(item => item.label.toUpperCase());
    const values = items.map(item => item.valor);
    
    autoTable(doc, {
        startY: yPos,
        head: [headers],
        body: [values],
        theme: 'grid',
        headStyles: {
            fillColor: CORES.primaria,
            textColor: CORES.branco,
            fontStyle: 'normal',
            fontSize: 8,
            halign: 'center',
        },
        bodyStyles: {
            fontSize: 11,
            textColor: CORES.texto,
            halign: 'center',
            fontStyle: 'normal',
        },
        margin: { left: 15, right: 15 },
    });
    
    return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
}

/**
 * Adiciona rodapé com informações da clínica
 */
function adicionarRodape(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Linha separadora
    doc.setDrawColor(...CORES.borda);
    doc.setLineWidth(0.2);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
    
    // Info da clínica
    doc.setFontSize(7);
    doc.setTextColor(...CORES.textoClaro);
    doc.setFont('helvetica', 'normal');
    
    const infoLine1 = `${CLINIC_INFO.name} • ${CLINIC_INFO.address} • ${CLINIC_INFO.cep}`;
    const infoLine2 = `${CLINIC_INFO.phone} • ${CLINIC_INFO.email} • ${CLINIC_INFO.instagram}`;
    
    doc.text(infoLine1, pageWidth / 2, pageHeight - 18, { align: 'center' });
    doc.text(infoLine2, pageWidth / 2, pageHeight - 13, { align: 'center' });
    
    doc.setFontSize(6);
    doc.text('Documento gerado automaticamente pelo Sistema Indigo Gestão', pageWidth / 2, pageHeight - 8, { align: 'center' });
}

/**
 * Adiciona assinatura
 */
function adicionarAssinatura(
    doc: jsPDF,
    nome: string,
    registro: string | undefined,
    yPos: number
): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    
    // Linha de assinatura
    doc.setDrawColor(...CORES.texto);
    doc.setLineWidth(0.3);
    doc.line(centerX - 60, yPos, centerX + 60, yPos);
    
    // Nome
    doc.setFontSize(10);
    doc.setTextColor(...CORES.texto);
    doc.setFont('helvetica', 'bold');
    doc.text(nome, centerX, yPos + 6, { align: 'center' });
    
    // Registro
    if (registro) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...CORES.textoClaro);
        doc.text(registro, centerX, yPos + 12, { align: 'center' });
    }
    
    return yPos + 20;
}

// ============================================
// GERADORES DE RELATÓRIO
// ============================================

function gerarPdfConvenio(dados: DadosRelatorioConvenio): jsPDF {
    const doc = new jsPDF();
    
    // Cabeçalho com logo
    let yPos = adicionarCabecalhoComLogo(
        doc,
        'Relatório de Atendimento',
        `Cliente: ${dados.cliente.nome}`,
        `Emitido em: ${dados.dataEmissao}`
    );
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidth = (pageWidth - 40) / 2;
    
    // Seção: Dados do Paciente
    yPos = adicionarSecao(doc, 'Dados do Paciente', yPos);
    
    const yBase = yPos;
    yPos = adicionarCampoInfo(doc, 'Nome', dados.cliente.nome, 15, yPos, colWidth);
    adicionarCampoInfo(doc, 'Idade', dados.cliente.idade || '-', 15 + colWidth + 10, yBase, colWidth);
    
    if (dados.cliente.convenio) {
        const yBase2 = yPos;
        yPos = adicionarCampoInfo(doc, 'Convênio', dados.cliente.convenio, 15, yPos, colWidth);
        adicionarCampoInfo(doc, 'Carteirinha', dados.cliente.numeroCarteirinha || '-', 15 + colWidth + 10, yBase2, colWidth);
    }
    
    yPos += 3;
    
    // Seção: Profissional Responsável
    yPos = adicionarSecao(doc, 'Profissional Responsável', yPos);
    const yBase3 = yPos;
    yPos = adicionarCampoInfo(doc, 'Terapeuta', dados.terapeuta.nome, 15, yPos, colWidth);
    adicionarCampoInfo(doc, 'Especialidade', dados.especialidade, 15 + colWidth + 10, yBase3, colWidth);
    
    yPos += 3;
    
    // Seção: Sessões Realizadas
    yPos = adicionarSecao(doc, 'Sessões Realizadas', yPos);
    
    // Tabela de sessões
    const tableData = dados.sessoes.map(sessao => [
        sessao.dataFormatted,
        `${sessao.horaInicio} - ${sessao.horaFim}`,
        formatarHoras(sessao.duracao),
        sessao.tipoAtividadeLabel,
    ]);
    
    autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Horário', 'Duração', 'Tipo de Atividade']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: CORES.primaria,
            textColor: CORES.branco,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: CORES.texto,
        },
        alternateRowStyles: {
            fillColor: CORES.cinzaClaro,
        },
        margin: { left: 15, right: 15 },
    });
    
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    // Resumo
    yPos = adicionarResumo(doc, [
        { label: 'Total de Sessões', valor: String(dados.totalSessoes) },
        { label: 'Total de Horas', valor: formatarHoras(dados.totalHoras * 60) },
    ], yPos);
    
    // Assinatura
    if (dados.assinaturaTerapeuta) {
        yPos += 10;
        adicionarAssinatura(doc, dados.terapeuta.nome, dados.terapeuta.registroProfissional, yPos);
    }
    
    adicionarRodape(doc);
    
    return doc;
}

function gerarPdfTerapeuta(dados: DadosRelatorioTerapeuta): jsPDF {
    const doc = new jsPDF();
    
    // Cabeçalho com logo - agora inclui mês de referência
    let yPos = adicionarCabecalhoComLogo(
        doc,
        'Relatório do Terapeuta',
        `Terapeuta: ${dados.terapeuta.nome}`,
        `Emitido em: ${dados.dataEmissao}`,
        `Referente ao mês: ${dados.mesReferencia}`
    );
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidth = (pageWidth - 40) / 2;
    
    // Linha divisória após o cabeçalho - igual anamnese
    adicionarLinhaDivisoria(doc, yPos - 2, CORES.borda);
    yPos += 5;
    
    // Seção: Dados do Terapeuta
    yPos = adicionarSecao(doc, 'Dados do Terapeuta', yPos);
    const yBase = yPos;
    yPos = adicionarCampoInfo(doc, 'Nome', dados.terapeuta.nome, 15, yPos, colWidth);
    adicionarCampoInfo(doc, 'Especialidade', dados.especialidade, 15 + colWidth + 10, yBase, colWidth);
    
    yPos += 5;
    
    // Seção: Sessões Realizadas
    yPos = adicionarSecao(doc, 'Sessões Realizadas', yPos);
    
    // Tabela de sessões - agora inclui Cliente e Idade
    const tableData = dados.sessoes.map(sessao => [
        sessao.dataFormatted,
        sessao.clienteNome ?? '-',
        sessao.clienteIdade ?? '-',
        `${sessao.horaInicio} - ${sessao.horaFim}`,
        formatarHoras(sessao.duracao),
        sessao.tipoAtividadeLabel,
        formatarValor(sessao.valorTerapeuta ?? 0),
    ]);
    
    autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Cliente', 'Idade', 'Horário', 'Duração', 'Tipo', 'Valor']],
        body: tableData,
        foot: [[
            '', '', '', '', '', 'TOTAL',
            formatarValor(dados.valorTotal),
        ]],
        theme: 'grid',
        headStyles: {
            fillColor: CORES.primaria,
            textColor: CORES.branco,
            fontStyle: 'normal',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: CORES.texto,
        },
        footStyles: {
            fillColor: CORES.primariaClara,
            textColor: CORES.primaria,
            fontStyle: 'bold',
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: CORES.cinzaClaro,
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
            0: { cellWidth: 22 }, // Data
            1: { cellWidth: 'auto' }, // Cliente
            2: { cellWidth: 18 }, // Idade
            3: { cellWidth: 28 }, // Horário
            4: { cellWidth: 18 }, // Duração
            5: { cellWidth: 30 }, // Tipo
            6: { cellWidth: 25 }, // Valor
        },
    });
    
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    // Resumo
    yPos = adicionarResumo(doc, [
        { label: 'Total de Sessões', valor: String(dados.totalSessoes) },
        { label: 'Total de Horas', valor: formatarHoras(dados.totalHoras * 60) },
        { label: 'Valor Total', valor: formatarValor(dados.valorTotal) },
    ], yPos);
    
    adicionarRodape(doc);
    
    return doc;
}

function gerarPdfPais(dados: DadosRelatorioPais): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // ========== CABEÇALHO COM LOGO (mesmo padrão do Word) ==========
    // Logo Indigo (lado esquerdo)
    try {
        doc.addImage(LOGO_INDIGO, 'PNG', 15, 12, 32, 32);
    } catch {
        console.warn('Não foi possível adicionar a logo');
    }
    
    // Título grande (ao lado da logo)
    doc.setFontSize(24);
    doc.setTextColor(...CORES.primaria);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório de Atendimento', 52, 22);
    
    // Paciente
    doc.setFontSize(11);
    doc.setTextColor(...CORES.texto);
    doc.setFont('helvetica', 'bold');
    doc.text('Paciente:', 52, 30);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cliente.nome, 75, 30);
    
    // Data de Nascimento
    doc.setFont('helvetica', 'bold');
    doc.text('Data de Nascimento:', 52, 36);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cliente.dataNascimento ?? '___/___/______', 97, 36);
    
    // Idade
    doc.setFont('helvetica', 'bold');
    doc.text('Idade:', 52, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cliente.idade ?? '___ anos e ___ meses', 67, 42);
    
    // Emitido em
    doc.setFontSize(10);
    doc.setTextColor(...CORES.textoClaro);
    doc.text(`Emitido em: ${dados.dataEmissao}`, 52, 48);
    
    // Linha divisória após cabeçalho
    let yPos = 55;
    doc.setDrawColor(...CORES.borda);
    doc.setLineWidth(0.3);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
    
    // ========== PROFISSIONAL RESPONSÁVEL ==========
    doc.setFontSize(11);
    doc.setTextColor(...CORES.texto);
    
    // Terapeuta
    doc.setFont('helvetica', 'bold');
    doc.text('Terapeuta:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.terapeuta.nome, 45, yPos);
    
    // Especialidade
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Especialidade:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.especialidade, 50, yPos);
    
    // Registro (CRP)
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Registro:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.terapeuta.registroProfissional ?? '-', 40, yPos);
    
    yPos += 10;
    
    // Seção: Sessões Realizadas
    yPos = adicionarSecao(doc, 'Sessões Realizadas', yPos);
    
    // Tabela de sessões
    const tableData = dados.sessoes.map(sessao => [
        sessao.dataFormatted,
        `${sessao.horaInicio} - ${sessao.horaFim}`,
        formatarHoras(sessao.duracao),
        sessao.tipoAtividadeLabel,
        formatarValor(sessao.valorCliente ?? 0),
    ]);
    
    autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Horário', 'Duração', 'Tipo', 'Valor']],
        body: tableData,
        foot: [[
            '', '', '', 'TOTAL A PAGAR',
            formatarValor(dados.valorTotal),
        ]],
        theme: 'grid',
        headStyles: {
            fillColor: CORES.primaria,
            textColor: CORES.branco,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: CORES.texto,
        },
        footStyles: {
            fillColor: CORES.primariaClara,
            textColor: CORES.primaria,
            fontStyle: 'bold',
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: CORES.cinzaClaro,
        },
        margin: { left: 15, right: 15 },
    });
    
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    // Resumo
    yPos = adicionarResumo(doc, [
        { label: 'Total de Sessões', valor: String(dados.totalSessoes) },
        { label: 'Valor por Hora', valor: formatarValor(dados.valorPorHora) },
        { label: 'Total a Pagar', valor: formatarValor(dados.valorTotal) },
    ], yPos);
    
    // Evolução clínica (se houver)
    if (dados.evolucaoClinica) {
        yPos = adicionarSecao(doc, 'Evolução Clínica do Mês', yPos);
        
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(...CORES.texto);
        doc.setFont('helvetica', 'normal');
        
        const lines = doc.splitTextToSize(dados.evolucaoClinica, pageWidth - 40);
        doc.text(lines, 20, yPos + 6);
    }
    
    adicionarRodape(doc);
    
    return doc;
}

// ============================================
// FUNÇÕES PÚBLICAS
// ============================================

interface GerarPdfOptions {
    tipo: TipoRelatorioFaturamento;
    dados: DadosRelatorioConvenio | DadosRelatorioTerapeuta | DadosRelatorioPais;
    nomeArquivo?: string;
}

export async function gerarPdfRelatorio(options: GerarPdfOptions): Promise<Blob> {
    let doc: jsPDF;
    
    switch (options.tipo) {
        case 'convenio':
            doc = gerarPdfConvenio(options.dados as DadosRelatorioConvenio);
            break;
        case 'terapeuta':
            doc = gerarPdfTerapeuta(options.dados as DadosRelatorioTerapeuta);
            break;
        case 'pais':
            doc = gerarPdfPais(options.dados as DadosRelatorioPais);
            break;
        default:
            throw new Error('Tipo de relatório inválido');
    }
    
    return doc.output('blob');
}

export async function downloadPdfRelatorio(options: GerarPdfOptions): Promise<void> {
    let doc: jsPDF;
    
    switch (options.tipo) {
        case 'convenio':
            doc = gerarPdfConvenio(options.dados as DadosRelatorioConvenio);
            break;
        case 'terapeuta':
            doc = gerarPdfTerapeuta(options.dados as DadosRelatorioTerapeuta);
            break;
        case 'pais':
            doc = gerarPdfPais(options.dados as DadosRelatorioPais);
            break;
        default:
            throw new Error('Tipo de relatório inválido');
    }
    
    const nomeArquivo = options.nomeArquivo || `relatorio-${options.tipo}-${Date.now()}.pdf`;
    doc.save(nomeArquivo);
}
