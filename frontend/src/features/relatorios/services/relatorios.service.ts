import type {
  SavedReport,
  CreateReportInput,
  ReportListFilters,
  Paciente,
  Terapeuta,
  ReportGeneratedData,
  ReportFiltersApplied,
} from '../types';

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
 * 🔧 PREPARADO: Envia filtro 'area' quando backend estiver pronto
 */
export async function getAllReports(filters?: ReportListFilters): Promise<ReportListResponse> {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;

  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.q) queryParams.append('q', filters.q);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.patientId) queryParams.append('patientId', filters.patientId);
      if (filters.therapistId) queryParams.append('therapistId', filters.therapistId);
      if (filters.area) queryParams.append('area', filters.area);
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
    console.error('Erro ao buscar relatórios:', error);
    throw error;
  }
}

/**
 * Busca relatório por ID
 */
export async function getReportById(id: string): Promise<SavedReport | null> {
  const url = `/api/relatorios/${id}`;
  
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Falha ao carregar relatório');
  }

  const report = (await res.json()) as SavedReport;
  return report;
}

/**
 * Cria novo relatório
 */
export async function createReport(input: CreateReportInput): Promise<SavedReport> {
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
  return createdReport;
}

/**
 * Arquiva relatório (status='archived')
 */
export async function archiveReport(id: string): Promise<void> {
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
}

/**
 * Gera PDF do relatório
 */
export async function generateReportPdf(id: string): Promise<string> {
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
  return result.pdfUrl;
}

/**
 * Busca dados para gerar relatório (KPIs, gráficos, etc)
 * Reutiliza a lógica existente de programas/relatorio-geral
 */
export async function fetchReportData(filters: ReportFiltersApplied): Promise<ReportGeneratedData> {
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
    const res = await fetch('/api/links/clients?includeResponsavel=true', {
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

    const clientsWithViewFields = clients.map((p) => {
      return {
        ...p,
        photoUrl: p.avatarUrl ?? null,
      };
    });
    
    return clientsWithViewFields;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}

/**
 * Busca todos os terapeutas (para formulários/filtros)
 */
export async function getAllTherapists(): Promise<Terapeuta[]> {
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

  const therapistsWithViewFields = therapists.map((t) => {
    return {
      ...t,
      photoUrl: t.avatarUrl ?? null,
    };
  });

  return therapistsWithViewFields;
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
  
  // 🔧 PREPARADO PARA BACKEND: Filtro por área terapêutica
  // Por enquanto usa fallback 'fonoaudiologia' para relatórios sem área
  if (filters.area) {
    filtered = filtered.filter(r => (r.area || 'fonoaudiologia') === filters.area);
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
