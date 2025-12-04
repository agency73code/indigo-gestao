import { buildApiUrl } from '@/lib/api';
import type { 
  Filters,
  KpisRelatorio, 
  SerieLinha, 
  PrazoPrograma,
  AttentionStimuliParams,
  AttentionStimuliResponse
} from '../types';

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
  const url = buildApiUrl('/api/ocp/reports/attention-stimuli', {
      programId: params.programaId,
      clientId: params.pacienteId,
      therapistId: params.terapeutaId,
      periodMode: params.periodo?.mode,
      periodStart: params.periodo?.start,
      periodEnd: params.periodo?.end,
      lastSessions: String(params.lastSessions),
      area: params.area
  });

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Erro ao buscar estímulos de atenção');
  }

  return await res.json();
}
