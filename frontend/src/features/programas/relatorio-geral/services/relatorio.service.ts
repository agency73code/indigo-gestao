import type { 
  Filters,
  KpisRelatorio, 
  SerieLinha, 
  PrazoPrograma,
  AttentionStimuliParams,
  AttentionStimuliResponse
} from '../types';
import { mockAttentionStimuliByWindow } from '../mocks/relatorio.mock';

const USE_MOCK = false; // Trocar para false quando backend estiver pronto


async function callKpiReportsApi(_filtros: Filters) {
  const filtersParam = encodeURIComponent(JSON.stringify(_filtros));
  return await fetch(`/api/ocp/reports/kpis/${filtersParam}`, {
    method: 'GET', 
    credentials: 'include' 
  });
}

export async function fetchKpis(_filtros: Filters): Promise<KpisRelatorio> {
  const res = await callKpiReportsApi(_filtros);
  const data = await res.json();
  return data.cards;
}

export async function fetchSerieLinha(_filtros: Filters): Promise<SerieLinha[]> {
  const res = await callKpiReportsApi(_filtros);
  const data = await res.json();
  return data.graphic;
}

export async function fetchPrazoPrograma(_filtros: Filters): Promise<PrazoPrograma> {
  const res = await callKpiReportsApi(_filtros);
  const data = await res.json();
  return data.programDeadline;
}

/**
 * Busca estímulos que precisam de atenção
 * 
 * Backend deve implementar:
 * - Filtrar sessões pelo pacienteId, programaId (opcional), terapeutaId (opcional), e período
 * - Pegar as últimas N sessões conforme params.lastSessions (1, 3 ou 5)
 * - Agregar tentativas por estímulo
 * - Calcular % de independência (indep / total)
 * - Classificar status: atencao (<= 60%), mediano (> 60% e <= 80%), positivo (> 80%), insuficiente (< 5 tentativas)
 * - Filtrar apenas estímulos com status "atencao"
 * - Ordenar por independência crescente (pior primeiro)
 * - Retornar hasSufficientData: true se algum estímulo tem >= 5 tentativas
 */
export async function fetchAttentionStimuli(
  params: AttentionStimuliParams
): Promise<AttentionStimuliResponse> {
  // Mock temporário - remover quando backend estiver pronto
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simula latência
    
    // Retorna dados específicos baseados no lastSessions
    const mockData = mockAttentionStimuliByWindow[params.lastSessions] || mockAttentionStimuliByWindow[5];
    
    return {
      items: mockData,
      total: mockData.length,
      hasSufficientData: true
    };
  }

  const queryParams = new URLSearchParams({
    pacienteId: params.pacienteId,
    lastSessions: String(params.lastSessions),
  });

  if (params.programaId) queryParams.append('programaId', params.programaId);
  if (params.terapeutaId) queryParams.append('terapeutaId', params.terapeutaId);
  
  if (params.periodo) {
    queryParams.append('periodoMode', params.periodo.mode);
    if (params.periodo.start) queryParams.append('periodoStart', params.periodo.start);
    if (params.periodo.end) queryParams.append('periodoEnd', params.periodo.end);
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ocp/reports/attention-stimuli?${queryParams.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!res.ok) {
    throw new Error('Erro ao buscar estímulos de atenção');
  }

  return await res.json();
}
