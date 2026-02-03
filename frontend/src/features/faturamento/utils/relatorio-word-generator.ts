/**
 * Gerador de Word para relatórios de faturamento
 * 
 * Usa HTML compatível com Word para gerar documentos editáveis
 * Segue o padrão visual da Anamnese
 */

import { toast } from 'sonner';
import type {
    TipoRelatorioFaturamento,
    DadosRelatorioConvenio,
    DadosRelatorioTerapeuta,
    DadosRelatorioPais,
} from '../types/relatorio-faturamento.types';

// ============================================
// INFORMAÇÕES DA CLÍNICA
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
// CORES (padrão Indigo #395482)
// ============================================

const CORES = {
    primaria: '#395482',
    texto: '#374151',
    textoClaro: '#6b7280',
    borda: '#e5e7eb',
    fundoClaro: '#f9fafb',
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
// ESTILOS CSS PARA WORD
// ============================================

const getWordStyles = () => `
    @page {
        size: A4;
        margin: 2cm;
    }
    
    body { 
        font-family: Arial, Helvetica, sans-serif; 
        font-size: 11pt; 
        color: ${CORES.texto};
        line-height: 1.4;
        margin: 0;
        padding: 20pt;
    }
    
    /* Cabeçalho */
    .header {
        margin-bottom: 20pt;
    }
    
    .header-title {
        font-size: 24pt;
        font-weight: 400;
        color: ${CORES.primaria};
        margin: 0 0 8pt 0;
    }
    
    .header-subtitle {
        font-size: 12pt;
        color: ${CORES.texto};
        margin: 0 0 4pt 0;
    }
    
    .header-info {
        font-size: 10pt;
        color: ${CORES.textoClaro};
        margin: 0;
    }
    
    .header-line {
        border-bottom: 1pt solid ${CORES.borda};
        margin-top: 12pt;
    }
    
    /* Seções */
    .section {
        margin-top: 16pt;
        margin-bottom: 12pt;
    }
    
    .section-title {
        font-size: 14pt;
        font-weight: 400;
        color: ${CORES.primaria};
        border-bottom: 1pt solid ${CORES.primaria};
        padding-bottom: 4pt;
        margin-bottom: 12pt;
    }
    
    /* Campos */
    .fields-row {
        display: table;
        width: 100%;
        margin-bottom: 8pt;
    }
    
    .field {
        display: table-cell;
        width: 50%;
        vertical-align: top;
        padding-right: 16pt;
    }
    
    .field-label {
        font-size: 9pt;
        text-transform: uppercase;
        color: ${CORES.textoClaro};
        margin-bottom: 2pt;
    }
    
    .field-value {
        font-size: 11pt;
        color: ${CORES.texto};
    }
    
    /* Tabela de sessões */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8pt;
    }
    
    th {
        background-color: ${CORES.primaria};
        color: white;
        font-size: 9pt;
        font-weight: normal;
        padding: 8pt 6pt;
        text-align: left;
        border: 1pt solid ${CORES.primaria};
    }
    
    td {
        font-size: 9pt;
        padding: 6pt;
        border: 1pt solid ${CORES.borda};
        vertical-align: top;
    }
    
    tr:nth-child(even) td {
        background-color: ${CORES.fundoClaro};
    }
    
    .table-footer td {
        background-color: #ecf0f1 !important;
        font-weight: bold;
        color: ${CORES.primaria};
    }
    
    /* Resumo */
    .summary {
        margin-top: 16pt;
    }
    
    .summary table {
        margin-top: 0;
    }
    
    .summary th {
        font-size: 8pt;
        padding: 6pt;
    }
    
    .summary td {
        font-size: 11pt;
        text-align: center;
        padding: 8pt;
    }
    
    /* Rodapé */
    .footer {
        margin-top: 30pt;
        padding-top: 12pt;
        border-top: 1pt solid ${CORES.borda};
        text-align: center;
        font-size: 8pt;
        color: ${CORES.textoClaro};
    }
    
    .footer p {
        margin: 2pt 0;
    }
`;

// ============================================
// GERADORES DE HTML PARA WORD
// ============================================

function gerarHtmlTerapeuta(dados: DadosRelatorioTerapeuta): string {
    const sessoesRows = dados.sessoes.map(sessao => `
        <tr>
            <td>${sessao.dataFormatted}</td>
            <td>${sessao.clienteNome ?? '-'}</td>
            <td>${sessao.clienteIdade ?? '-'}</td>
            <td>${sessao.horaInicio} - ${sessao.horaFim}</td>
            <td>${formatarHoras(sessao.duracao)}</td>
            <td>${sessao.tipoAtividadeLabel}</td>
            <td style="text-align: right;">${formatarValor(sessao.valorTerapeuta ?? 0)}</td>
        </tr>
    `).join('');

    return `
        <!-- Cabeçalho -->
        <div class="header">
            <h1 class="header-title">Relatório do Terapeuta</h1>
            <p class="header-subtitle">Terapeuta: ${dados.terapeuta.nome}</p>
            <p class="header-info">Emitido em: ${dados.dataEmissao}</p>
            <p class="header-info">Referente ao mês: ${dados.mesReferencia}</p>
            <div class="header-line"></div>
        </div>

        <!-- Dados do Terapeuta -->
        <div class="section">
            <h2 class="section-title">Dados do Terapeuta</h2>
            <div class="fields-row">
                <div class="field">
                    <div class="field-label">NOME</div>
                    <div class="field-value">${dados.terapeuta.nome}</div>
                </div>
                <div class="field">
                    <div class="field-label">ESPECIALIDADE</div>
                    <div class="field-value">${dados.especialidade}</div>
                </div>
            </div>
        </div>

        <!-- Sessões Realizadas -->
        <div class="section">
            <h2 class="section-title">Sessões Realizadas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Idade</th>
                        <th>Horário</th>
                        <th>Duração</th>
                        <th>Tipo</th>
                        <th style="text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessoesRows}
                </tbody>
                <tfoot>
                    <tr class="table-footer">
                        <td colspan="6" style="text-align: right;">TOTAL</td>
                        <td style="text-align: right;">${formatarValor(dados.valorTotal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Resumo -->
        <div class="summary">
            <table>
                <thead>
                    <tr>
                        <th>TOTAL DE SESSÕES</th>
                        <th>TOTAL DE HORAS</th>
                        <th>VALOR TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${dados.totalSessoes}</td>
                        <td>${formatarHoras(dados.totalHoras * 60)}</td>
                        <td>${formatarValor(dados.valorTotal)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Rodapé -->
        <div class="footer">
            <p>${CLINIC_INFO.name} • ${CLINIC_INFO.address} • ${CLINIC_INFO.cep}</p>
            <p>${CLINIC_INFO.phone} • ${CLINIC_INFO.email} • ${CLINIC_INFO.instagram}</p>
            <p style="margin-top: 8pt;">Documento gerado automaticamente pelo Sistema Indigo Gestão</p>
        </div>
    `;
}

function gerarHtmlConvenio(dados: DadosRelatorioConvenio): string {
    const sessoesRows = dados.sessoes.map(sessao => `
        <tr>
            <td>${sessao.dataFormatted}</td>
            <td>${sessao.horaInicio} - ${sessao.horaFim}</td>
            <td>${formatarHoras(sessao.duracao)}</td>
            <td>${sessao.tipoAtividadeLabel}</td>
        </tr>
    `).join('');

    return `
        <!-- Cabeçalho -->
        <div class="header">
            <h1 class="header-title">Relatório de Atendimento</h1>
            <p class="header-subtitle">Cliente: ${dados.cliente.nome}</p>
            <p class="header-info">Emitido em: ${dados.dataEmissao}</p>
            <div class="header-line"></div>
        </div>

        <!-- Dados do Paciente -->
        <div class="section">
            <h2 class="section-title">Dados do Paciente</h2>
            <div class="fields-row">
                <div class="field">
                    <div class="field-label">NOME</div>
                    <div class="field-value">${dados.cliente.nome}</div>
                </div>
                <div class="field">
                    <div class="field-label">IDADE</div>
                    <div class="field-value">${dados.cliente.idade ?? '-'}</div>
                </div>
            </div>
            ${dados.cliente.convenio ? `
            <div class="fields-row">
                <div class="field">
                    <div class="field-label">CONVÊNIO</div>
                    <div class="field-value">${dados.cliente.convenio}</div>
                </div>
                <div class="field">
                    <div class="field-label">CARTEIRINHA</div>
                    <div class="field-value">${dados.cliente.numeroCarteirinha ?? '-'}</div>
                </div>
            </div>
            ` : ''}
        </div>

        <!-- Profissional Responsável -->
        <div class="section">
            <h2 class="section-title">Profissional Responsável</h2>
            <div class="fields-row">
                <div class="field">
                    <div class="field-label">TERAPEUTA</div>
                    <div class="field-value">${dados.terapeuta.nome}</div>
                </div>
                <div class="field">
                    <div class="field-label">ESPECIALIDADE</div>
                    <div class="field-value">${dados.especialidade}</div>
                </div>
            </div>
        </div>

        <!-- Sessões Realizadas -->
        <div class="section">
            <h2 class="section-title">Sessões Realizadas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Duração</th>
                        <th>Tipo de Atividade</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessoesRows}
                </tbody>
            </table>
        </div>

        <!-- Resumo -->
        <div class="summary">
            <table>
                <thead>
                    <tr>
                        <th>TOTAL DE SESSÕES</th>
                        <th>TOTAL DE HORAS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${dados.totalSessoes}</td>
                        <td>${formatarHoras(dados.totalHoras * 60)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${dados.evolucaoClinica ? `
        <!-- Evolução Clínica -->
        <div class="section">
            <h2 class="section-title">Evolução Clínica do Mês</h2>
            <div style="background-color: #f0fdf4; border: 1pt solid #bbf7d0; padding: 12pt; border-radius: 4pt;">
                <p style="margin: 0; white-space: pre-wrap;">${dados.evolucaoClinica}</p>
            </div>
        </div>
        ` : ''}

        <!-- Rodapé -->
        <div class="footer">
            <p>${CLINIC_INFO.name} • ${CLINIC_INFO.address} • ${CLINIC_INFO.cep}</p>
            <p>${CLINIC_INFO.phone} • ${CLINIC_INFO.email} • ${CLINIC_INFO.instagram}</p>
            <p style="margin-top: 8pt;">Documento gerado automaticamente pelo Sistema Indigo Gestão</p>
        </div>
    `;
}

function gerarHtmlPais(dados: DadosRelatorioPais): string {
    const sessoesRows = dados.sessoes.map(sessao => `
        <tr>
            <td>${sessao.dataFormatted}</td>
            <td>${sessao.horaInicio} - ${sessao.horaFim}</td>
            <td>${formatarHoras(sessao.duracao)}</td>
            <td>${sessao.tipoAtividadeLabel}</td>
            <td style="text-align: right;">${formatarValor(sessao.valorCliente ?? 0)}</td>
        </tr>
    `).join('');

    return `
        <!-- Cabeçalho -->
        <div class="header">
            <h1 class="header-title">Relatório de Atendimento</h1>
            <p class="header-subtitle">Cliente: ${dados.cliente.nome}</p>
            <p class="header-info">Emitido em: ${dados.dataEmissao}</p>
            <div class="header-line"></div>
        </div>

        <!-- Dados do Paciente -->
        <div class="section">
            <h2 class="section-title">Dados do Paciente</h2>
            <div class="fields-row">
                <div class="field">
                    <div class="field-label">NOME</div>
                    <div class="field-value">${dados.cliente.nome}</div>
                </div>
                <div class="field">
                    <div class="field-label">IDADE</div>
                    <div class="field-value">${dados.cliente.idade ?? '-'}</div>
                </div>
            </div>
        </div>

        <!-- Profissional Responsável -->
        <div class="section">
            <h2 class="section-title">Profissional Responsável</h2>
            <div class="fields-row">
                <div class="field">
                    <div class="field-label">TERAPEUTA</div>
                    <div class="field-value">${dados.terapeuta.nome}</div>
                </div>
                <div class="field">
                    <div class="field-label">ESPECIALIDADE</div>
                    <div class="field-value">${dados.especialidade}</div>
                </div>
            </div>
        </div>

        <!-- Sessões Realizadas -->
        <div class="section">
            <h2 class="section-title">Sessões Realizadas</h2>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Duração</th>
                        <th>Tipo de Atividade</th>
                        <th style="text-align: right;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessoesRows}
                </tbody>
                <tfoot>
                    <tr class="table-footer">
                        <td colspan="4" style="text-align: right;">TOTAL</td>
                        <td style="text-align: right;">${formatarValor(dados.valorTotal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Resumo -->
        <div class="summary">
            <table>
                <thead>
                    <tr>
                        <th>TOTAL DE SESSÕES</th>
                        <th>TOTAL DE HORAS</th>
                        <th>VALOR TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${dados.totalSessoes}</td>
                        <td>${formatarHoras(dados.totalHoras * 60)}</td>
                        <td>${formatarValor(dados.valorTotal)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${dados.evolucaoClinica ? `
        <!-- Evolução Clínica -->
        <div class="section">
            <h2 class="section-title">Evolução Clínica do Mês</h2>
            <div style="background-color: #f0fdf4; border: 1pt solid #bbf7d0; padding: 12pt; border-radius: 4pt;">
                <p style="margin: 0; white-space: pre-wrap;">${dados.evolucaoClinica}</p>
            </div>
        </div>
        ` : ''}

        <!-- Rodapé -->
        <div class="footer">
            <p>${CLINIC_INFO.name} • ${CLINIC_INFO.address} • ${CLINIC_INFO.cep}</p>
            <p>${CLINIC_INFO.phone} • ${CLINIC_INFO.email} • ${CLINIC_INFO.instagram}</p>
            <p style="margin-top: 8pt;">Documento gerado automaticamente pelo Sistema Indigo Gestão</p>
        </div>
    `;
}

// ============================================
// FUNÇÃO PRINCIPAL DE EXPORTAÇÃO
// ============================================

interface GerarWordOptions {
    tipo: TipoRelatorioFaturamento;
    dados: DadosRelatorioConvenio | DadosRelatorioTerapeuta | DadosRelatorioPais;
    nomeArquivo?: string;
}

export async function downloadWordRelatorio(options: GerarWordOptions): Promise<void> {
    const { tipo, dados, nomeArquivo } = options;

    try {
        toast.loading('Gerando documento Word...', { id: 'word-export' });

        // Gerar HTML baseado no tipo
        let htmlContent: string;
        switch (tipo) {
            case 'terapeuta':
                htmlContent = gerarHtmlTerapeuta(dados as DadosRelatorioTerapeuta);
                break;
            case 'convenio':
                htmlContent = gerarHtmlConvenio(dados as DadosRelatorioConvenio);
                break;
            case 'pais':
                htmlContent = gerarHtmlPais(dados as DadosRelatorioPais);
                break;
            default:
                throw new Error('Tipo de relatório inválido');
        }

        // Criar documento HTML completo compatível com Word
        const fullHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                        <w:DoNotOptimizeForBrowser/>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    ${getWordStyles()}
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        // Criar Blob com o conteúdo HTML
        const blob = new Blob(['\ufeff', fullHtml], {
            type: 'application/msword'
        });

        // Criar link de download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = nomeArquivo || `relatorio-${tipo}-${Date.now()}`;
        link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Documento Word exportado com sucesso!', { id: 'word-export' });
    } catch (error) {
        console.error('Erro ao exportar Word:', error);
        toast.error('Erro ao exportar documento Word. Tente novamente.', { id: 'word-export' });
        throw error;
    }
}
