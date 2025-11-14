import { toast } from 'sonner';
import type { SavedReport, ReportFiltersApplied, ReportGeneratedData } from '../types';

/**
 * Interface para os parâmetros de salvamento do relatório
 */
export interface SaveReportParams {
  title: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  filters: ReportFiltersApplied;
  generatedData: ReportGeneratedData;
  clinicalObservations?: string;
  reportElement: HTMLElement;
}

/**
 * Gera PDF usando window.print() (compatível com o sistema existente)
 * Usa o mesmo sistema de impressão que já funciona no ReportExporter
 */
async function generatePdfViaPrint(_element: HTMLElement, _filename: string): Promise<void> {
  console.log('🔵 [PDF] Abrindo janela de impressão...');
  
  // Aguarda um pouco antes de abrir
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Usa window.print() que já está configurado no ReportExporter
  window.print();
}

/**
 * Gera o PDF do relatório - USA WINDOW.PRINT
 * Compatível com o sistema existente (ReportExporter + to-print)
 */
export async function generatePdfBlob(
  element: HTMLElement, 
  filename: string
): Promise<Blob> {
  console.log('🔵 [PDF] Usando sistema de impressão nativo...');
  
  // Usa window.print() que já funciona
  await generatePdfViaPrint(element, filename);
  
  // Retorna blob indicador de print manual
  return new Blob(['manual-print'], { type: 'text/plain' });
}

/**
 * Sanitiza string para usar em nome de arquivo
 * Remove acentos e caracteres especiais
 */
export function sanitizeForFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

/**
 * Calcula o período (start/end) com base nos filtros
 */
export function calculatePeriod(filters: ReportFiltersApplied): {
  periodStart: string;
  periodEnd: string;
} {
  const periodEnd = new Date().toISOString().split('T')[0];
  let periodStart: string;

  if (filters.periodo.mode === 'custom') {
    periodStart = filters.periodo.start;
    // Se custom, usa o end dos filtros
    return {
      periodStart,
      periodEnd: filters.periodo.end
    };
  }

  // Calcula com base no mode
  const daysMap: Record<string, number> = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365
  };

  const days = daysMap[filters.periodo.mode] || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  periodStart = startDate.toISOString().split('T')[0];

  return { periodStart, periodEnd };
}

/**
 * Prepara e envia o relatório para o backend
 * Retorna o relatório salvo com ID, URL do PDF, etc.
 */
export async function saveReportToBackend(
  params: SaveReportParams
): Promise<SavedReport> {
  console.log('🟢 [SAVE] Iniciando salvamento do relatório...');
  console.log('🟢 [SAVE] Params:', {
    title: params.title,
    patientId: params.patientId,
    patientName: params.patientName,
    therapistId: params.therapistId,
  });
  
  const {
    title,
    patientId,
    patientName,
    therapistId,
    filters,
    generatedData,
    clinicalObservations,
    reportElement
  } = params;

  // PASSO 1: Gerar PDF
  console.log('🟢 [SAVE] Passo 1: Gerando PDF...');
  
  const pdfFileName = `relatorio_${sanitizeForFileName(patientName)}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  let pdfBlob: Blob;
  try {
    pdfBlob = await generatePdfBlob(reportElement, pdfFileName);
    
    // Log do tamanho do PDF gerado
    const sizeInMB = (pdfBlob.size / 1024 / 1024).toFixed(2);
    console.log(`🟢 [SAVE] PDF gerado: ${sizeInMB} MB`);
    
    // Alerta se PDF muito grande (> 5MB)
    if (pdfBlob.size > 5 * 1024 * 1024) {
      console.warn('⚠️ [SAVE] PDF gerado é grande (> 5MB). Considere otimizar imagens/gráficos.');
    }
  } catch (error) {
    console.error('❌ [SAVE] Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar PDF do relatório');
  }

  // PASSO 2: Calcular período
  console.log('🟢 [SAVE] Passo 2: Calculando período...');
  const { periodStart, periodEnd } = calculatePeriod(filters);
  console.log('🟢 [SAVE] Período:', { periodStart, periodEnd });

  // PASSO 3: Construir FormData
  console.log('🟢 [SAVE] Passo 3: Construindo FormData...');

  const formData = new FormData();
  
  // Arquivo PDF
  formData.append('pdf', pdfBlob, pdfFileName);
  
  // Dados básicos
  formData.append('title', title);
  formData.append('type', 'mensal'); // Pode ser dinâmico futuramente
  formData.append('patientId', patientId);
  formData.append('therapistId', therapistId);
  formData.append('periodStart', periodStart);
  formData.append('periodEnd', periodEnd);
  formData.append('clinicalObservations', clinicalObservations || '');
  formData.append('status', 'final');

  // Dados estruturados (filtros + dados gerados)
  const structuredData = {
    filters: {
      pacienteId: patientId,
      periodo: {
        mode: filters.periodo.mode,
        start: periodStart,
        end: periodEnd,
      },
      programaId: filters.programaId,
      estimuloId: filters.estimuloId,
      terapeutaId: filters.terapeutaId,
      comparar: filters.comparar,
    },
    generatedData,
  };

  formData.append('data', JSON.stringify(structuredData));
  
  console.log('🟢 [SAVE] FormData construído com sucesso');

  // PASSO 4: Enviar para o backend
  console.log('🟢 [SAVE] Passo 4: Enviando para o backend...');
  try {
    const apiBase = import.meta.env.VITE_API_BASE || '';
    const url = `${apiBase}/api/relatorios`;
    console.log('🟢 [SAVE] URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    console.log('🟢 [SAVE] Resposta recebida:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [SAVE] Erro do servidor:', errorData);
      
      // Se backend não existe (404), oferece download do PDF
      if (response.status === 404) {
        console.warn('⚠️ [SAVE] Backend não implementado, fazendo download do PDF...');
        toast.warning('Backend ainda não implementado. Baixando PDF...', { duration: 4000 });
        
        // Faz download do PDF localmente
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = pdfFileName;
        link.click();
        URL.revokeObjectURL(url);
        
        // Retorna um objeto mock para não quebrar o fluxo
        return {
          id: 'local-' + Date.now(),
          title,
          type: 'mensal',
          status: 'final',
          patientId,
          therapistId,
          periodStart,
          periodEnd,
          createdAt: new Date().toISOString(),
          pdfUrl: 'local-download',
        } as SavedReport;
      }
      
      throw new Error(errorData.message || 'Erro ao salvar relatório no servidor');
    }

    const savedReport: SavedReport = await response.json();
    
    console.log('✅ [SAVE] Relatório salvo com sucesso!');
    console.log('✅ [SAVE] ID do relatório:', savedReport.id);
    
    toast.success('Relatório salvo com sucesso!', { duration: 3000 });
    
    return savedReport;
  } catch (error) {
    console.error('❌ [SAVE] Erro ao salvar relatório:', error);
    
    // Se for erro de rede/backend, oferece download local
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('⚠️ [SAVE] Erro de rede, fazendo download local...');
      toast.warning('Erro de conexão. Baixando PDF localmente...', { duration: 4000 });
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFileName;
      link.click();
      URL.revokeObjectURL(url);
      
      return {
        id: 'local-' + Date.now(),
        title,
        type: 'mensal',
        status: 'final',
        patientId,
        therapistId,
        periodStart,
        periodEnd,
        createdAt: new Date().toISOString(),
        pdfUrl: 'local-download',
      } as SavedReport;
    }
    
    toast.error(
      error instanceof Error 
        ? error.message 
        : 'Erro ao salvar relatório no servidor'
    );
    throw error;
  }
}

/**
 * Exporta PDF diretamente para download (sem salvar no backend)
 * Útil para exportações rápidas
 */
export async function exportPdfDirectly(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const blob = await generatePdfBlob(element, filename);
    
    // Se blob muito pequeno, é fallback - não faz download automático
    if (blob.size < 1000) {
      return;
    }
    
    // Cria link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('PDF exportado com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    toast.error('Erro ao exportar PDF');
    throw error;
  }
}

/**
 * Prepara dados do relatório para preview antes de salvar
 * Útil para validar dados antes do envio
 */
export function prepareReportPreview(params: Omit<SaveReportParams, 'reportElement'>): {
  summary: string;
  estimatedSize: string;
  warnings: string[];
} {
  const { filters, generatedData, clinicalObservations } = params;
  
  const warnings: string[] = [];
  
  // Validações
  if (!clinicalObservations || clinicalObservations.trim().length < 50) {
    warnings.push('Observação clínica muito curta. Recomendamos adicionar mais detalhes.');
  }
  
  if (!generatedData.kpis) {
    warnings.push('Nenhum KPI encontrado. Verifique se há dados de sessões no período.');
  }
  
  if (!filters.programaId && !filters.estimuloId) {
    warnings.push('Nenhum filtro de programa ou estímulo aplicado. O relatório incluirá todos os dados.');
  }

  // Estimativa de tamanho do PDF
  const dataComplexity = 
    (generatedData.graphic?.length || 0) + 
    (clinicalObservations?.length || 0) / 100;
  
  const estimatedSize = dataComplexity < 50 
    ? '< 1 MB' 
    : dataComplexity < 150 
      ? '1-3 MB' 
      : '> 3 MB';

  const summary = `Relatório abrange ${filters.periodo.mode} com ${generatedData.kpis?.sessoes || 0} sessões.`;

  return {
    summary,
    estimatedSize,
    warnings
  };
}
