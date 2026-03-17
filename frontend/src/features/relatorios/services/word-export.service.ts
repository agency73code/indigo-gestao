/**
 * Gerador de Word para relatórios de evolução terapêutica
 * 
 * Usa HTML compatível com Word para gerar documentos editáveis
 * Captura gráficos do DOM como imagens base64 para embutir no documento
 * Inclui campos de assinatura de terapeuta e supervisor
 */

import { toast } from 'sonner';
import type { SavedReport } from '../types';
import type { AreaType } from '@/contexts/AreaContext';
import { AREA_LABELS } from '@/contexts/AreaContext';
import LOGO_INDIGO from '@/assets/logos/indigo.png';

// ============================================
// CONSTANTES
// ============================================

let logoBase64: string | null = null;

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

const CLINIC_INFO = {
    name: 'Clínica Instituto Índigo',
    address: 'Av Vital Brasil, 305, Butantã, CJ 905-909',
    cep: 'CEP 05503-001',
    phone: '+55 11 96973-2227',
    email: 'clinica.indigo@gmail.com',
    instagram: '@inst.indigo',
};

const CORES = {
    primaria: '#395482',
    texto: '#374151',
    textoClaro: '#6b7280',
    borda: '#e5e7eb',
    fundoClaro: '#f9fafb',
    verde: '#10b981',
    azul: '#3b82f6',
    vermelho: '#ef4444',
    amarelo: '#f59e0b',
    roxo: '#8b5cf6',
};

const AREA_PARA_SIGLA_CONSELHO: Record<string, string> = {
    'Fisioterapia': 'CREFITO',
    'Terapia Ocupacional': 'CREFITO',
    'Fonoaudiologia': 'CRFa',
    'Psicologia': 'CRP',
    'Neuropsicologia': 'CRP',
    'Psicopedagogia': 'CRP',
    'Terapia ABA': 'CRP',
    'Musicoterapia': 'CBMT',
    'Nutrição': 'CRN',
    'Enfermagem': 'COREN',
    'Medicina': 'CRM',
};

function getSiglaConselho(areaAtuacao: string | undefined): string {
    if (!areaAtuacao) return 'CRP';
    return AREA_PARA_SIGLA_CONSELHO[areaAtuacao] || 'CRP';
}

function getTituloProfissional(especialidade: string | undefined): string {
    const titulosMap: Record<string, string> = {
        'Fisioterapia': 'Fisioterapeuta',
        'Terapia Ocupacional': 'Terapeuta Ocupacional',
        'Fonoaudiologia': 'Fonoaudióloga',
        'Psicologia': 'Psicóloga',
        'Neuropsicologia': 'Neuropsicóloga',
        'Psicopedagogia': 'Psicopedagoga',
        'Terapia ABA': 'Terapeuta ABA',
        'Musicoterapia': 'Musicoterapeuta',
        'Nutrição': 'Nutricionista',
        'Enfermagem': 'Enfermeira',
        'Medicina': 'Médica',
    };
    if (!especialidade) return 'Profissional';
    return titulosMap[especialidade] || 'Profissional';
}

// ============================================
// CAPTURA DE GRÁFICOS DO DOM
// ============================================

interface ChartCapture {
    dataUrl: string;
    width: number;
    height: number;
    label: string;
}

/**
 * Captura todos os gráficos (canvas) do relatório como imagens base64
 */
function captureCharts(reportElement: HTMLElement): ChartCapture[] {
    const canvases = Array.from(reportElement.querySelectorAll('canvas'));
    const captures: ChartCapture[] = [];

    for (const canvas of canvases) {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const rect = canvas.getBoundingClientRect();
            captures.push({
                dataUrl,
                width: rect.width || canvas.width,
                height: rect.height || canvas.height,
                label: canvas.getAttribute('aria-label') || 'Gráfico',
            });
        } catch (error) {
            console.warn('Falha ao capturar canvas:', error);
        }
    }

    return captures;
}

/**
 * Captura os títulos dos gráficos (cards que contêm canvas)
 */
function captureChartTitles(reportElement: HTMLElement): string[] {
    const titles: string[] = [];
    const canvases = Array.from(reportElement.querySelectorAll('canvas'));
    
    for (const canvas of canvases) {
        // Procura o título no card pai mais próximo
        const card = canvas.closest('[class*="rounded"]');
        if (card) {
            const titleEl = card.querySelector('h3, [class*="CardTitle"]');
            if (titleEl?.textContent) {
                titles.push(titleEl.textContent.trim());
                continue;
            }
        }
        titles.push('');
    }
    
    return titles;
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

    h1, h2, h3 {
        font-family: Arial, Helvetica, sans-serif;
    }
    
    .header {
        margin-bottom: 20pt;
    }
    
    .header-title {
        font-size: 20pt;
        font-weight: 600;
        color: ${CORES.primaria};
        margin: 0 0 4pt 0;
    }
    
    .header-subtitle {
        font-size: 11pt;
        color: ${CORES.texto};
        margin: 0 0 2pt 0;
    }
    
    .header-info {
        font-size: 10pt;
        color: ${CORES.textoClaro};
        margin: 0;
    }
    
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
    
    .kpi-table td {
        padding: 10pt 8pt;
        text-align: center;
        border: 1pt solid ${CORES.borda};
        vertical-align: top;
    }
    
    .kpi-label {
        font-size: 8pt;
        text-transform: uppercase;
        color: ${CORES.textoClaro};
        margin: 0 0 4pt 0;
    }
    
    .kpi-value {
        font-size: 18pt;
        font-weight: bold;
        margin: 0;
    }
    
    .kpi-hint {
        font-size: 8pt;
        color: ${CORES.textoClaro};
        margin: 2pt 0 0 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
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
    
    .chart-container {
        text-align: center;
        margin: 12pt 0;
        page-break-inside: avoid;
    }
    
    .chart-title {
        font-size: 12pt;
        font-weight: 600;
        color: ${CORES.texto};
        margin-bottom: 8pt;
    }
    
    .chart-img {
        max-width: 100%;
        height: auto;
    }
    
    .observation-box {
        background-color: ${CORES.fundoClaro};
        border: 1pt solid ${CORES.borda};
        padding: 12pt;
        margin-top: 8pt;
        line-height: 1.6;
    }
    
    .session-obs-table td {
        font-size: 9pt;
        padding: 4pt 6pt;
        border: 1pt solid ${CORES.borda};
    }

    .signature-area {
        margin-top: 60pt;
    }
    
    .signature-block {
        text-align: center;
        margin-bottom: 50pt;
    }
    
    .signature-line {
        width: 50%;
        margin: 0 auto;
        border-collapse: collapse;
    }
    
    .signature-line td {
        border: none;
        border-top: 1pt solid ${CORES.texto};
        padding: 0;
    }

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
// GERADOR DE KPIs POR ÁREA
// ============================================

function gerarKpisHtml(report: SavedReport): string {
    const kpis = report.generatedData?.kpis;
    if (!kpis) return '';

    const area = report.area;

    // Fono, Psicopedagogia, Terapia ABA
    if (['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(area)) {
        return `
            <div class="section">
                <h2 class="section-title">Indicadores de Desempenho</h2>
                <table class="kpi-table">
                    <tr>
                        <td style="width: 25%;">
                            <p class="kpi-label">ACERTO GERAL</p>
                            <p class="kpi-value" style="color: ${CORES.verde};">${kpis.acerto ?? 0}%</p>
                            <p class="kpi-hint">Percentual de respostas corretas</p>
                        </td>
                        <td style="width: 25%;">
                            <p class="kpi-label">INDEPENDÊNCIA</p>
                            <p class="kpi-value" style="color: ${CORES.azul};">${kpis.independencia ?? 0}%</p>
                            <p class="kpi-hint">Respostas sem ajuda</p>
                        </td>
                        <td style="width: 25%;">
                            <p class="kpi-label">TENTATIVAS</p>
                            <p class="kpi-value" style="color: ${CORES.roxo};">${kpis.tentativas ?? 0}</p>
                            <p class="kpi-hint">Total de tentativas registradas</p>
                        </td>
                        <td style="width: 25%;">
                            <p class="kpi-label">SESSÕES</p>
                            <p class="kpi-value" style="color: ${CORES.primaria};">${kpis.sessoes ?? 0}</p>
                            <p class="kpi-hint">Sessões realizadas no período</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    // TO
    if (area === 'terapia-ocupacional' && 'desempenhou' in kpis) {
        return `
            <div class="section">
                <h2 class="section-title">Indicadores de Desempenho</h2>
                <table class="kpi-table">
                    <tr>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">DESEMPENHOU</p>
                            <p class="kpi-value" style="color: ${CORES.verde};">${(kpis as any).desempenhou ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">COM AJUDA</p>
                            <p class="kpi-value" style="color: ${CORES.amarelo};">${(kpis as any).desempenhouComAjuda ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">NÃO DESEMPENHOU</p>
                            <p class="kpi-value" style="color: ${CORES.vermelho};">${(kpis as any).naoDesempenhou ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">TEMPO TOTAL</p>
                            <p class="kpi-value" style="color: ${CORES.primaria};">${(kpis as any).tempoTotal ?? 0}min</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">ATIVIDADES</p>
                            <p class="kpi-value" style="color: ${CORES.roxo};">${(kpis as any).atividadesTotal ?? 0}</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">SESSÕES</p>
                            <p class="kpi-value" style="color: ${CORES.primaria};">${(kpis as any).sessoesTotal ?? 0}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    // Fisio, Psicomotricidade, Educação Física
    if (['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(area) && 'desempenhou' in kpis) {
        return `
            <div class="section">
                <h2 class="section-title">Indicadores de Desempenho</h2>
                <table class="kpi-table">
                    <tr>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">DESEMPENHOU</p>
                            <p class="kpi-value" style="color: ${CORES.verde};">${(kpis as any).desempenhou ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">COM AJUDA</p>
                            <p class="kpi-value" style="color: ${CORES.amarelo};">${(kpis as any).desempenhouComAjuda ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">NÃO DESEMPENHOU</p>
                            <p class="kpi-value" style="color: ${CORES.vermelho};">${(kpis as any).naoDesempenhou ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">COMPENSAÇÃO</p>
                            <p class="kpi-value" style="color: ${CORES.primaria};">${(kpis as any).compensacaoTotal ?? 0}%</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">ATIVIDADES</p>
                            <p class="kpi-value" style="color: ${CORES.roxo};">${(kpis as any).atividadesTotal ?? 0}</p>
                        </td>
                        <td style="width: 16.6%;">
                            <p class="kpi-label">SESSÕES</p>
                            <p class="kpi-value" style="color: ${CORES.primaria};">${(kpis as any).sessoesTotal ?? 0}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    // Musicoterapia
    if (area === 'musicoterapia') {
        return `
            <div class="section">
                <h2 class="section-title">Indicadores de Desempenho</h2>
                <table class="kpi-table">
                    <tr>
                        <td style="width: 20%;">
                            <p class="kpi-label">PARTICIPAÇÃO</p>
                            <p class="kpi-value" style="color: ${CORES.verde};">${(kpis as any).participacao ?? 0}%</p>
                        </td>
                        <td style="width: 20%;">
                            <p class="kpi-label">SUPORTE</p>
                            <p class="kpi-value" style="color: ${CORES.amarelo};">${(kpis as any).suporte ?? 0}%</p>
                        </td>
                        <td style="width: 20%;">
                            <p class="kpi-label">ATIVIDADES</p>
                            <p class="kpi-value" style="color: ${CORES.roxo};">${(kpis as any).atividadesTotal ?? 0}</p>
                        </td>
                        <td style="width: 20%;">
                            <p class="kpi-label">SESSÕES</p>
                            <p class="kpi-value" style="color: ${CORES.primaria};">${(kpis as any).sessoesTotal ?? 0}</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    return '';
}

// ============================================
// GERADOR DE OBSERVAÇÕES CLÍNICAS
// ============================================

function gerarObservacoesClinicasHtml(report: SavedReport): string {
    if (!report.clinicalObservations) return '';

    return `
        <div class="section">
            <h2 class="section-title">Observações Clínicas</h2>
            <div class="observation-box">
                ${report.clinicalObservations}
            </div>
        </div>
    `;
}

// ============================================
// GERADOR DE GRÁFICOS (IMAGENS)
// ============================================

function gerarGraficosHtml(charts: ChartCapture[], chartTitles: string[]): string {
    if (charts.length === 0) return '';

    const chartsHtml = charts.map((chart, index) => {
        const title = chartTitles[index] || chart.label || `Gráfico ${index + 1}`;
        // Calcular dimensões proporcionais para caber no Word (largura máx ~480pt em A4 com margens de 2cm)
        const maxWidth = 480;
        const scale = Math.min(1, maxWidth / chart.width);
        const displayWidth = Math.round(chart.width * scale);
        const displayHeight = Math.round(chart.height * scale);
        
        return `
            <div class="chart-container">
                <p class="chart-title">${title}</p>
                <img src="${chart.dataUrl}" 
                     alt="${title}" 
                     class="chart-img"
                     width="${displayWidth}" 
                     height="${displayHeight}"
                     style="max-width: 100%; height: auto;" />
            </div>
        `;
    }).join('');

    return `
        <div class="section">
            <h2 class="section-title">Evolução do Desempenho</h2>
            ${chartsHtml}
        </div>
    `;
}

// ============================================
// GERADOR DE OBSERVAÇÕES DAS SESSÕES
// ============================================

function gerarObservacoesSessoesHtml(report: SavedReport): string {
    const observations = report.generatedData?.sessionObservations;
    if (!observations || observations.length === 0) return '';

    const rows = observations.slice(0, 30).map((obs: any) => {
        const data = obs.data ? new Date(obs.data).toLocaleDateString('pt-BR') : '-';
        return `
            <tr>
                <td style="width: 15%; white-space: nowrap;">${data}</td>
                <td style="width: 25%;">${obs.programa || '-'}</td>
                <td style="width: 60%;">${obs.observacoes || '-'}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="section">
            <h2 class="section-title">Observações das Sessões</h2>
            <table class="session-obs-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Programa</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================
// GERADOR DE PRAZO DO PROGRAMA
// ============================================

function gerarPrazoProgramaHtml(report: SavedReport): string {
    const deadline = report.generatedData?.programDeadline;
    if (!deadline) return '';

    const inicio = deadline.inicio ? new Date(deadline.inicio).toLocaleDateString('pt-BR') : '-';
    const fim = deadline.fim ? new Date(deadline.fim).toLocaleDateString('pt-BR') : '-';
    const percent = deadline.percent ?? 0;
    // Criar barra de progresso em HTML+CSS
    const barWidth = Math.min(Math.max(percent, 0), 100);

    return `
        <div class="section">
            <h2 class="section-title">Prazo do Programa</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8pt; border: 1pt solid ${CORES.borda}; width: 20%; text-align: center;">
                        <p style="font-size: 8pt; color: ${CORES.textoClaro}; margin: 0;">INÍCIO</p>
                        <p style="font-size: 11pt; font-weight: bold; margin: 4pt 0 0 0;">${inicio}</p>
                    </td>
                    <td style="padding: 8pt; border: 1pt solid ${CORES.borda}; width: 60%; text-align: center;">
                        <p style="font-size: 8pt; color: ${CORES.textoClaro}; margin: 0;">PROGRESSO</p>
                        <div style="background-color: #e5e7eb; height: 12pt; margin: 6pt 0; position: relative;">
                            <div style="background-color: ${CORES.primaria}; height: 100%; width: ${barWidth}%;"></div>
                        </div>
                        <p style="font-size: 10pt; margin: 0;">${deadline.label || `${percent}%`}</p>
                    </td>
                    <td style="padding: 8pt; border: 1pt solid ${CORES.borda}; width: 20%; text-align: center;">
                        <p style="font-size: 8pt; color: ${CORES.textoClaro}; margin: 0;">FIM</p>
                        <p style="font-size: 11pt; font-weight: bold; margin: 4pt 0 0 0;">${fim}</p>
                    </td>
                </tr>
            </table>
        </div>
    `;
}

// ============================================
// GERADOR DE ASSINATURAS
// ============================================

interface AssinaturaInfo {
    nome: string;
    areaAtuacao?: string;
    numeroConselho?: string;
}

function gerarAssinaturasHtml(
    terapeuta: AssinaturaInfo | null,
    supervisor: AssinaturaInfo | null,
): string {
    // Terapeuta — nome, título, conselho + número de registro
    const terapeutaContent = terapeuta ? `
        <p style="font-size: 10pt; font-weight: bold; margin: 0;">${terapeuta.nome}</p>
        ${terapeuta.areaAtuacao ? `<p style="font-size: 9pt; margin: 2pt 0;">${getTituloProfissional(terapeuta.areaAtuacao)}</p>` : ''}
        <p style="font-size: 9pt; margin: 2pt 0;">${getSiglaConselho(terapeuta.areaAtuacao)} ${terapeuta.numeroConselho || '____________'}</p>
    ` : `
        <p style="font-size: 10pt; font-weight: bold; margin: 0;">Terapeuta Responsável</p>
        <p style="font-size: 9pt; margin: 2pt 0;">Registro: ____________</p>
    `;

    // Supervisor — nome, título, conselho + número de registro
    const supervisorContent = supervisor ? `
        <p style="font-size: 10pt; font-weight: bold; margin: 0;">${supervisor.nome}</p>
        ${supervisor.areaAtuacao ? `<p style="font-size: 9pt; margin: 2pt 0;">${getTituloProfissional(supervisor.areaAtuacao)}</p>` : ''}
        <p style="font-size: 9pt; margin: 2pt 0;">${getSiglaConselho(supervisor.areaAtuacao)} ${supervisor.numeroConselho || '____________'}</p>
    ` : `
        <p style="font-size: 10pt; font-weight: bold; margin: 0;">Supervisor(a)</p>
        <p style="font-size: 9pt; margin: 2pt 0;">Registro: ____________</p>
    `;

    // Layout lado a lado com tabela (compatível com Word)
    // Word ignora margin-top em divs, então usamos <br> e parágrafos vazios para espaçamento
    return `
        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 45%; text-align: center; vertical-align: top; border: none; padding: 0;">
                    <p style="margin: 0; font-size: 11pt;">&nbsp;</p>
                    <p style="margin: 0; font-size: 11pt;">&nbsp;</p>
                    <p style="margin: 0; font-size: 11pt;">&nbsp;</p>
                        <!-- Linha de assinatura -->
                        <table style="width: 80%; margin: 0 auto; border-collapse: collapse;">
                            <tr>
                                <td style="border: none; border-top: 1pt solid ${CORES.texto}; padding: 0;"></td>
                            </tr>
                        </table>
                        <div style="padding-top: 6pt;">
                            ${terapeutaContent}
                        </div>
                    </td>
                    <td style="width: 10%; border: none; padding: 0;"></td>
                    <td style="width: 45%; text-align: center; vertical-align: top; border: none; padding: 0;">
                        <p style="margin: 0; font-size: 11pt;">&nbsp;</p>
                        <p style="margin: 0; font-size: 11pt;">&nbsp;</p>
                        <p style="margin: 0; font-size: 11pt;">&nbsp;</p>
                        <!-- Linha de assinatura -->
                        <table style="width: 80%; margin: 0 auto; border-collapse: collapse;">
                            <tr>
                                <td style="border: none; border-top: 1pt solid ${CORES.texto}; padding: 0;"></td>
                            </tr>
                        </table>
                        <div style="padding-top: 6pt;">
                            ${supervisorContent}
                        </div>
                    </td>
                </tr>
            </table>
    `;
}

// ============================================
// GERADOR PRINCIPAL DO HTML
// ============================================

interface ExportWordOptions {
    report: SavedReport;
    patientName: string;
    patientAge?: number | null;
    therapistInfo: AssinaturaInfo | null;
    supervisorInfo?: AssinaturaInfo | null;
    reportElement: HTMLElement;
}

function gerarHtmlRelatorio(
    options: ExportWordOptions,
    logoDataUri: string,
    charts: ChartCapture[],
    chartTitles: string[],
): string {
    const { report, patientName, patientAge, therapistInfo } = options;
    
    const areaLabel = report.area ? (AREA_LABELS[report.area as AreaType] || report.area) : 'Não especificada';
    const periodoInicio = new Date(report.periodStart).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const periodoFim = new Date(report.periodEnd).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const dataGeracao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Cabeçalho
    const headerHtml = `
        <div style="display: table; width: 100%; margin-bottom: 20pt;">
            <div style="display: table-cell; vertical-align: middle; width: 100pt;">
                ${logoDataUri ? `<img src="${logoDataUri}" alt="Logo Índigo" width="90" height="90" style="width: 90px; height: 90px; max-width: 90px; max-height: 90px;" />` : ''}
            </div>
            <div style="display: table-cell; vertical-align: middle; padding-left: 12pt;">
                <h1 class="header-title">${report.title}</h1>
                <p class="header-subtitle">Cliente: <strong>${patientName}</strong>${patientAge ? ` • ${patientAge} anos` : ''}</p>
                <p class="header-info">Gerado em ${dataGeracao}</p>
            </div>
        </div>
        <div style="border-bottom: 1pt solid ${CORES.borda}; margin-bottom: 16pt;"></div>

        <!-- Informações do relatório -->
        <div style="margin-bottom: 16pt;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8pt; border: 1pt solid ${CORES.borda}; width: 25%;">
                        <p style="font-size: 8pt; text-transform: uppercase; color: ${CORES.textoClaro}; margin: 0;">TERAPEUTA</p>
                        <p style="font-size: 11pt; font-weight: 500; margin: 4pt 0 0 0;">${therapistInfo?.nome || 'Todos'}</p>
                    </td>
                    <td style="padding: 8pt; border: 1pt solid ${CORES.borda}; width: 25%;">
                        <p style="font-size: 8pt; text-transform: uppercase; color: ${CORES.textoClaro}; margin: 0;">ÁREA</p>
                        <p style="font-size: 11pt; font-weight: 500; margin: 4pt 0 0 0;">${areaLabel}</p>
                    </td>
                    <td style="padding: 8pt; border: 1pt solid ${CORES.borda}; width: 50%; text-align: center;">
                        <p style="font-size: 8pt; text-transform: uppercase; color: ${CORES.textoClaro}; margin: 0;">PERÍODO</p>
                        <p style="font-size: 11pt; font-weight: 500; margin: 4pt 0 0 0;">${periodoInicio} — ${periodoFim}</p>
                    </td>
                </tr>
            </table>
        </div>
    `;

    // Montar documento completo
    return `
        ${headerHtml}
        ${gerarKpisHtml(report)}
        ${gerarObservacoesClinicasHtml(report)}
        ${gerarGraficosHtml(charts, chartTitles)}
        ${gerarPrazoProgramaHtml(report)}
        ${gerarObservacoesSessoesHtml(report)}
        ${gerarAssinaturasHtml(options.therapistInfo, options.supervisorInfo ?? null)}
        
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

export async function exportReportToWord(options: ExportWordOptions): Promise<void> {
    try {
        toast.loading('Gerando documento Word...', { id: 'word-report-export' });

        // 1. Carregar logo base64
        const logoDataUri = await getLogoBase64();

        // 2. Capturar gráficos do DOM
        const charts = captureCharts(options.reportElement);
        const chartTitles = captureChartTitles(options.reportElement);

        // 3. Gerar HTML do relatório
        const htmlContent = gerarHtmlRelatorio(options, logoDataUri, charts, chartTitles);

        // 4. Criar documento Word completo
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

        // 5. Criar Blob e fazer download
        const blob = new Blob(['\ufeff', fullHtml], {
            type: 'application/msword',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const sanitizedName = options.patientName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase();
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `relatorio_${sanitizedName}_${dateStr}.doc`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Documento Word exportado com sucesso!', { id: 'word-report-export' });
    } catch (error) {
        console.error('Erro ao exportar Word:', error);
        toast.error('Erro ao exportar documento Word. Tente novamente.', { id: 'word-report-export' });
        throw error;
    }
}
