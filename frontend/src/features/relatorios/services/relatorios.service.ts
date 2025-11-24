import type {
  SavedReport,
  CreateReportInput,
  ReportListFilters,
  Paciente,
  Terapeuta,
  ReportGeneratedData,
  ReportFiltersApplied,
} from '../types';
import { mockReports, mockPatients, mockTherapists } from '../mocks';

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Resposta paginada da API de relatórios
 */
export interface ReportListResponse {
  /** Lista de relatórios da página atual */
  items: SavedReport[];
  /** Total de registros (após filtros) */
  total: number;
  /** Página atual */
  page: number;
  /** Itens por página */
  pageSize: number;
  /** Total de páginas */
  totalPages: number;
}

/**
 * Busca todos os relatórios com filtros e paginação (via URL query params)
 * 
 * 🔄 ADAPTER: Funciona com backend atual (array) e futuro (objeto paginado)
 */
export async function getAllReports(filters?: ReportListFilters): Promise<ReportListResponse> {
  await delay(500);
  
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      // Envia filtros individuais
      if (filters.q) queryParams.append('q', filters.q);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.patientId) queryParams.append('patientId', filters.patientId);
      if (filters.therapistId) queryParams.append('therapistId', filters.therapistId);
      if (filters.orderBy) queryParams.append('orderBy', filters.orderBy);
      // NÃO envia page/pageSize por enquanto (backend pode não suportar)
    }
    
    const res = await fetch(`/api/relatorios?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao carregar relatórios');
    }

    const response = await res.json();
    const data = response?.data ?? response;

    // ============================================
    // 🔄 ADAPTER: Detecta formato da resposta
    // ============================================

    // Caso 1: Backend retorna array simples (FORMATO ATUAL)
    if (Array.isArray(data)) {
      // ⚠️ TEMPORÁRIO: Faz paginação/filtro/ordenação local
      return processReportsLocally(data, filters);
    }

    // Caso 2: Backend FUTURO retorna formato paginado
    if (data && typeof data === 'object' && 'items' in data) {
      return data as ReportListResponse;
    }

    // Caso 3: Formato inesperado - retorna vazio
    console.warn('⚠️ Formato de resposta inesperado:', data);
    return {
      items: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  } catch (error) {
    console.error('Erro ao buscar relatórios, retornando mock:', error);
    return processReportsLocally(mockReports, filters);
  }
}

/**
 * Busca relatório por ID
 */
export async function getReportById(id: string): Promise<SavedReport | null> {
  console.log('🔍 getReportById chamado com ID:', id);
  await delay(300);
  
  try {
    const url = `/api/relatorios/${id}`;
    console.log('📡 Fazendo requisição para:', url);
    
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Resposta recebida - Status:', res.status, res.ok);

    if (!res.ok) {
      if (res.status === 404) {
        console.log('⚠️ Relatório não encontrado no backend, buscando no mock');
        const mockReport = mockReports.find((r: SavedReport) => r.id === id) || null;
        console.log('📦 Mock encontrado:', mockReport ? 'SIM' : 'NÃO');
        return mockReport;
      }
      throw new Error('Falha ao carregar relatório');
    }

    const report = (await res.json()) as SavedReport;
    console.log('✅ Relatório carregado do backend:', report.id);
    return report;
  } catch (error) {
    console.error('❌ Erro ao buscar relatório, usando mock:', error);
    const mockReport = mockReports.find((r: SavedReport) => r.id === id) || null;
    console.log('📦 Mock encontrado:', mockReport ? `SIM (${mockReport.id})` : 'NÃO');
    return mockReport;
  }
}

/**
 * Cria novo relatório
 */
export async function createReport(input: CreateReportInput): Promise<SavedReport> {
  await delay(800);
  
  try {
    const res = await fetch('/api/relatorios', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao criar relatório';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const createdReport = (await res.json()) as SavedReport;
    mockReports.push(createdReport);
    return createdReport;
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error;
    }

    console.log('⚠️ Backend não disponível, criando relatório localmente');
    
    // Fallback: criar mock local
    const newReport: SavedReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      type: input.type,
      patientId: input.patientId,
      therapistId: input.therapistId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      filters: input.filters,
      clinicalObservations: input.clinicalObservations,
      generatedData: input.generatedData,
      status: input.status || 'final',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockReports.push(newReport);
    return newReport;
  }
}

/**
 * Arquiva relatório (status='archived')
 */
export async function archiveReport(id: string): Promise<void> {
  await delay(400);
  
  try {
    const res = await fetch(`/api/reports/${id}/archive`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao arquivar relatório';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const archivedReport = (await res.json()) as SavedReport;
    const reportIndex = mockReports.findIndex((r: SavedReport) => r.id === archivedReport.id);
    if (reportIndex !== -1) {
      mockReports[reportIndex] = archivedReport;
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error;
    }

    console.log('⚠️ Backend não disponível, arquivando relatório localmente');
    
    const reportIndex = mockReports.findIndex((r: SavedReport) => r.id === id);
    if (reportIndex === -1) {
      throw new Error('Relatório não encontrado');
    }
    
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status: 'archived',
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Gera PDF do relatório
 */
export async function generateReportPdf(id: string): Promise<string> {
  await delay(1500);
  
  try {
    const res = await fetch(`/api/reports/${id}/pdf`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao gerar PDF');
    }

    const result = (await res.json()) as { pdfUrl: string };
    
    // Atualiza o relatório com a URL do PDF
    const reportIndex = mockReports.findIndex((r: SavedReport) => r.id === id);
    if (reportIndex !== -1) {
      mockReports[reportIndex].pdfUrl = result.pdfUrl;
    }
    
    return result.pdfUrl;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar PDF do relatório');
  }
}

/**
 * Busca dados para gerar relatório (KPIs, gráficos, etc)
 * Reutiliza a lógica existente de programas/relatorio-geral
 */
export async function fetchReportData(filters: ReportFiltersApplied): Promise<ReportGeneratedData> {
  await delay(800);
  
  try {
    const filtersParam = encodeURIComponent(JSON.stringify(filters));
    const res = await fetch(`/api/ocp/reports/kpis/${filtersParam}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Falha ao gerar dados do relatório');
    }

    const data = await res.json();
    
    return {
      kpis: data.cards,
      graphic: data.graphic,
      programDeadline: data.programDeadline,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do relatório:', error);
    throw new Error('Erro ao carregar dados para o relatório');
  }
}

/**
 * Busca todos os pacientes (para formulários/filtros)
 */
export async function getAllPatients(): Promise<Paciente[]> {
  try {
    const res = await fetch('/api/links/getAllClients', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao carregar clientes');
    }

    const clients = (await res.json()) as Paciente[];
    
    const clientsWithAvatar = await Promise.all(
      clients.map(async (p) => {
        try {
          const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${p.id}&type=client`, {
            credentials: 'include',
          });
          const data = await avatarRes.json();
          return { ...p, avatarUrl: data.avatarUrl ?? '' };
        } catch {
          return { ...p, avatarUrl: '' };
        }
      })
    );
    
    if (clientsWithAvatar.length === 0) {
      console.log('⚠️ Backend retornou 0 clientes, usando mocks');
      await delay(200);
      return [...mockPatients];
    }
    
    return clientsWithAvatar;
  } catch (error) {
    console.error('Erro ao buscar clientes, retornando mock:', error);
    await delay(200);
    return [...mockPatients];
  }
}

/**
 * Busca todos os terapeutas (para formulários/filtros)
 */
export async function getAllTherapists(): Promise<Terapeuta[]> {
  try {
    const res = await fetch('/api/links/getAllTherapists', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao carregar terapeutas');
    }
    
    const therapists = (await res.json()) as Terapeuta[];

    const therapistsWithAvatar = await Promise.all(
      therapists.map(async (t) => {
        try {
          const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${t.id}&type=therapist`, {
            credentials: 'include',
          });
          const data = await avatarRes.json();
          return { ...t, avatarUrl: data.avatarUrl ?? '' };
        } catch {
          return { ...t, avatarUrl: '' };
        }
      })
    );
    
    if (therapistsWithAvatar.length === 0) {
      console.log('⚠️ Backend retornou 0 terapeutas, usando mocks');
      await delay(200);
      return [...mockTherapists];
    }
    
    return therapistsWithAvatar;
  } catch (error) {
    console.error('Erro ao buscar terapeutas, retornando mock:', error);
    await delay(200);
    return [...mockTherapists];
  }
}

// ==================== FUNÇÕES AUXILIARES (FILTROS LOCAIS) ====================

/**
 * ⚠️ FUNÇÃO TEMPORÁRIA: Processa filtros/ordenação/paginação localmente
 * 
 * Esta função será REMOVIDA quando o backend implementar paginação server-side.
 * Permite que o frontend funcione AGORA com URL params, sem quebrar quando o backend evoluir.
 */
function processReportsLocally(reports: SavedReport[], filters?: ReportListFilters): ReportListResponse {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  
  let filtered = [...reports];
  
  // 🔥 POPULA patient e therapist nos relatórios (se ainda não estiverem)
  filtered = filtered.map(report => {
    if (!report.patient) {
      const patient = mockPatients.find(p => p.id === report.patientId);
      if (patient) {
        return { ...report, patient };
      }
    }
    if (!report.therapist) {
      const therapist = mockTherapists.find(t => t.id === report.therapistId);
      if (therapist) {
        return { ...report, therapist };
      }
    }
    return report;
  });
  
  if (!filters) {
    // Sem filtros, apenas pagina
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
  
  // Busca textual
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(query)
    );
  }
  
  // Filtro por cliente
  if (filters.patientId) {
    filtered = filtered.filter(r => r.patientId === filters.patientId);
  }
  
  // Filtro por terapeuta
  if (filters.therapistId) {
    filtered = filtered.filter(r => r.therapistId === filters.therapistId);
  }
  
  // Filtro por tipo
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(r => r.type === filters.type);
  }
  
  // Filtro por status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  
  // Filtro por data de criação
  if (filters.dateFrom) {
    filtered = filtered.filter(r => r.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter(r => r.createdAt <= filters.dateTo!);
  }
  
  // Filtro por período analisado
  if (filters.periodFrom) {
    filtered = filtered.filter(r => r.periodEnd >= filters.periodFrom!);
  }
  if (filters.periodTo) {
    filtered = filtered.filter(r => r.periodStart <= filters.periodTo!);
  }
  
  // Ordenação
  if (filters.orderBy === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (filters.orderBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (filters.orderBy === 'alpha') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.orderBy === 'patient') {
    filtered.sort((a, b) => a.patientId.localeCompare(b.patientId));
  }
  
  // Paginação
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = filtered.slice(startIndex, endIndex);
  
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}
