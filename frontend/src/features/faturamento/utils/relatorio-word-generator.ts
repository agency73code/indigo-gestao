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
import { DADOS_DONA_CLINICA as DONA_CLINICA } from '../types/relatorio-faturamento.types';

// Logo PNG para compatibilidade com Word
import LOGO_INDIGO from '@/assets/logos/indigo.png';

// Variável para armazenar logo em base64
let logoBase64: string | null = null;

/**
 * Converte a logo PNG para base64 para embutir no documento Word
 */
async function getLogoBase64(): Promise<string> {
    if (logoBase64) return logoBase64;
    
    try {
        const response = await fetch(LOGO_INDIGO);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                logoBase64 = reader.result as string;
                resolve(logoBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao carregar logo:', error);
        return '';
    }
}

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

function gerarHtmlConvenio(dados: DadosRelatorioConvenio, logoDataUri: string): string {
    // Formatar lista de dias de atendimento
    const diasFormatados = dados.diasAtendimento.length > 0 
        ? dados.diasAtendimento.slice(0, -1).join(', ') + ' E ' + dados.diasAtendimento[dados.diasAtendimento.length - 1]
        : '';
    
    // Calcular horário de atendimento (pegar do primeiro e último horário)
    const horariosInicio = dados.sessoes.map(s => s.horaInicio).filter(Boolean);
    const horariosFim = dados.sessoes.map(s => s.horaFim).filter(Boolean);
    const horarioInicioMin = horariosInicio.length > 0 ? horariosInicio.sort()[0] : '08h';
    const horarioFimMax = horariosFim.length > 0 ? horariosFim.sort().reverse()[0] : '12h';
    
    // Gerar linhas da tabela de sessões
    const sessoesRows = dados.sessoes.map(sessao => `
        <tr>
            <td style="padding: 4pt 6pt; border: 1pt solid ${CORES.borda}; font-size: 9pt;">${sessao.dataFormatted}</td>
            <td style="padding: 4pt 6pt; border: 1pt solid ${CORES.borda}; font-size: 9pt;">${sessao.dataExtenso}</td>
            <td style="padding: 4pt 6pt; border: 1pt solid ${CORES.borda}; font-size: 9pt;">${sessao.horaInicio} às ${sessao.horaFim.replace(':', 'h')}</td>
            <td style="padding: 4pt 6pt; border: 1pt solid ${CORES.borda}; font-size: 9pt;">Terapia de ${dados.especialidade} com ${dados.terapeuta.nome} (${dados.terapeuta.registroProfissional ?? 'CRP -'})</td>
        </tr>
    `).join('');

    // Texto padrão da clínica
    const textoClinicaPadrao = `Nesta clínica realizamos intervenção comportamental para o desenvolvimento da linguagem, fala e cognição social, baseadas em modelos de aprendizagem da Análise do Comportamento Aplicada (ABA – Applied Behavior Analysis) e modelos de aprendizagem que visam a motivação da criança como base para a aprendizagem – Modelo Denver de Intervenção Precoce (EDSM, que é baseado na ciência ABA). Além disso, em nossas intervenções, realizamos o treino motor de fala, de base motora, visto que o planejamento motor é necessário para a fala - PROMPT, Multigestos e Intervenção da Motricidade Oral. Atuamos também em abordagens específicas para CAA (Comunicação Aumentativa Alternativa) e CSA (Comunicação Suplementar Alternativa), com sistemas robustos e não robustos de comunicação, de baixa e alta tecnologia, tais como COREWORDs, PODD (Pranchas Dinâmicas com Organização Pragmática) e PECS (Sistema de Comunicação por Troca de Figuras) visando a melhora na efetividade da comunicação.`;

    // Texto padrão sobre valores
    const textoValoresPadrao = `Com relação aos valores praticados pela Clínica, aponte-se que são levados em consideração diversos fatores, dentre os quais o nível de capacitação dos profissionais envolvidos, a estrutura física adequada aos atendimentos, e o nível de especialização exigido da equipe, sempre atualizada, de modo a possibilitar o efetivo atendimento e consequente ajuste e melhoria das condições apresentadas pelos pacientes. Sem mais, agradeço a atenção e coloco-me à disposição para maiores esclarecimentos.`;

    return `
        <!-- Cabeçalho com Logo -->
        <div style="display: table; width: 100%; margin-bottom: 20pt;">
            <div style="display: table-cell; vertical-align: middle; width: 100pt;">
                ${logoDataUri ? `<img src="${logoDataUri}" alt="Logo Índigo" width="90" height="90" style="width: 90px; height: 90px; max-width: 90px; max-height: 90px;" />` : ''}
            </div>
            <div style="display: table-cell; vertical-align: middle; padding-left: 12pt;">
                <h1 style="font-size: 18pt; font-weight: 400; color: #395482; margin: 0 0 6pt 0;">Relatório de Acompanhamento Comportamental baseado em ABA</h1>
                <p style="font-size: 11pt; color: #374151; margin: 0 0 3pt 0;">Cliente: ${dados.cliente.nome}</p>
                <p style="font-size: 10pt; color: #6b7280; margin: 0;">Emitido em: ${dados.dataEmissao}</p>
            </div>
        </div>
        <div style="border-bottom: 2pt solid #395482; margin-bottom: 16pt;"></div>

        <!-- Dados do Paciente (Cabeçalho) -->
        <div style="margin-bottom: 16pt;">
            <p style="font-size: 11pt; margin: 3pt 0;"><strong>Nome:</strong> ${dados.cliente.nome}</p>
            ${dados.cliente.dataNascimento ? `<p style="font-size: 11pt; margin: 3pt 0;"><strong>Data de Nascimento:</strong> ${dados.cliente.dataNascimento}</p>` : ''}
            ${dados.cliente.idade ? `<p style="font-size: 11pt; margin: 3pt 0;"><strong>Idade:</strong> ${dados.cliente.idade}</p>` : ''}
            <p style="font-size: 11pt; margin: 3pt 0;"><strong>Data de emissão do relatório:</strong> ${dados.dataEmissao}</p>
        </div>

        <!-- Campo para Apresentação do Caso (GRIFADO - Terapeuta preenche) -->
        <div style="margin-bottom: 16pt;">
            <div style="background-color: #FFFF00; padding: 8pt; margin-bottom: 8pt;">
                <p style="font-size: 11pt; margin: 0; font-style: italic;"><strong>Descrever apresentação do caso:</strong> (Terapeuta preenche manualmente)</p>
            </div>
            <div style="border: 1pt solid ${CORES.borda}; padding: 12pt; min-height: 100pt;">
                <p style="color: #9ca3af; font-size: 10pt; margin: 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
            </div>
        </div>

        <!-- Texto Padrão da Clínica -->
        <div style="margin-bottom: 16pt;">
            <p style="font-size: 11pt; text-align: justify; line-height: 1.5; margin: 0;">
                ${textoClinicaPadrao}
            </p>
        </div>

        <!-- Resumo de Atendimentos (AUTOMÁTICO) -->
        <div style="margin-bottom: 16pt;">
            <p style="font-size: 11pt; text-align: justify; line-height: 1.5; margin: 0;">
                Logo, no mês de <strong>${dados.mesReferencia}</strong> de <strong>${dados.anoReferencia}</strong>, <strong>${dados.cliente.nome}</strong> foi atendida a partir de <strong>${dados.sessoesMaxPorDia} sessões</strong> por dia, nos dias <strong>${diasFormatados}</strong>, das ${horarioInicioMin} às ${horarioFimMax}.
            </p>
            <p style="font-size: 11pt; text-align: justify; line-height: 1.5; margin: 8pt 0 0 0;">
                <strong>Totalizando ${dados.totalSessoes} sessões/ horas de atendimento.</strong>
            </p>
        </div>

        <!-- Texto introdutório da tabela -->
        <div style="margin-bottom: 8pt;">
            <p style="font-size: 11pt; margin: 0;">Segue abaixo tabela com horários de atendimento já descritos anteriormente:</p>
        </div>

        <!-- Tabela de Sessões -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16pt; font-size: 9pt;">
            <thead>
                <tr>
                    <th style="background-color: ${CORES.primaria}; color: white; padding: 6pt; border: 1pt solid ${CORES.primaria}; text-align: left; font-size: 9pt;">Data do atendimento</th>
                    <th style="background-color: ${CORES.primaria}; color: white; padding: 6pt; border: 1pt solid ${CORES.primaria}; text-align: left; font-size: 9pt;">Data do atendimento por extenso</th>
                    <th style="background-color: ${CORES.primaria}; color: white; padding: 6pt; border: 1pt solid ${CORES.primaria}; text-align: left; font-size: 9pt;">Horários do atendimento</th>
                    <th style="background-color: ${CORES.primaria}; color: white; padding: 6pt; border: 1pt solid ${CORES.primaria}; text-align: left; font-size: 9pt;">Atividade realizada e terapeuta</th>
                </tr>
            </thead>
            <tbody>
                ${sessoesRows}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="background-color: #ecf0f1; padding: 6pt; border: 1pt solid ${CORES.borda}; font-weight: bold; text-align: center; font-size: 10pt;">
                        TOTALIZANDO ${dados.totalSessoes} HORAS DE TERAPIA ${dados.especialidade.toUpperCase()}
                    </td>
                </tr>
            </tfoot>
        </table>

        <!-- Campo para Desempenho da Criança (GRIFADO - Terapeuta preenche) -->
        <div style="margin-bottom: 16pt;">
            <div style="background-color: #FFFF00; padding: 8pt; margin-bottom: 8pt;">
                <p style="font-size: 11pt; margin: 0; font-style: italic;"><strong>Desempenho da criança:</strong> (Terapeuta preenche manualmente)</p>
            </div>
            <div style="border: 1pt solid ${CORES.borda}; padding: 12pt; min-height: 100pt;">
                <p style="color: #9ca3af; font-size: 10pt; margin: 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
                <p style="color: #9ca3af; font-size: 10pt; margin: 8pt 0 0 0;">_______________________________________________________________________________</p>
            </div>
        </div>

        <!-- Texto Padrão sobre Valores -->
        <div style="margin-bottom: 16pt;">
            <p style="font-size: 11pt; text-align: justify; line-height: 1.5; margin: 0;">
                ${textoValoresPadrao}
            </p>
        </div>

        <!-- Disposição para esclarecimentos -->
        <div style="text-align: center; margin: 24pt 0;">
            <p style="font-size: 11pt; margin: 0;">À disposição para quaisquer esclarecimentos,</p>
        </div>

        <!-- Área de Assinaturas -->
        <div style="margin-top: 40pt;">
            <!-- Assinatura do Terapeuta -->
            <div style="text-align: center; margin-bottom: 40pt;">
                <div style="border-top: 1pt solid ${CORES.texto}; width: 60%; margin: 0 auto; padding-top: 8pt;">
                    <p style="font-size: 11pt; font-weight: bold; margin: 0;">${dados.terapeuta.nome}</p>
                    <p style="font-size: 10pt; margin: 4pt 0;">Psicóloga prestadora de serviços da Clínica Instituto Índigo</p>
                    <p style="font-size: 10pt; margin: 2pt 0;">${dados.especialidade}</p>
                    <p style="font-size: 10pt; margin: 2pt 0;">${dados.terapeuta.registroProfissional ?? 'CRP -'}</p>
                </div>
            </div>

            <!-- Assinatura da Dona da Clínica (FIXO) -->
            <div style="text-align: center;">
                <div style="border-top: 1pt solid ${CORES.texto}; width: 60%; margin: 0 auto; padding-top: 8pt;">
                    <p style="font-size: 11pt; font-weight: bold; margin: 0;">${DONA_CLINICA.nome}</p>
                    <p style="font-size: 10pt; margin: 4pt 0;">${DONA_CLINICA.titulo}</p>
                    <p style="font-size: 10pt; margin: 2pt 0;">Fonoaudióloga ${DONA_CLINICA.crfa}</p>
                    ${DONA_CLINICA.certificacoes.map(cert => `<p style="font-size: 9pt; margin: 2pt 0;">${cert}</p>`).join('')}
                    ${DONA_CLINICA.formacao.map(form => `<p style="font-size: 9pt; margin: 2pt 0;">${form}</p>`).join('')}
                </div>
            </div>
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

        // Carregar logo em base64 para embutir no documento
        const logoDataUri = await getLogoBase64();

        // Gerar HTML baseado no tipo
        let htmlContent: string;
        switch (tipo) {
            case 'terapeuta':
                htmlContent = gerarHtmlTerapeuta(dados as DadosRelatorioTerapeuta);
                break;
            case 'convenio':
                htmlContent = gerarHtmlConvenio(dados as DadosRelatorioConvenio, logoDataUri);
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
