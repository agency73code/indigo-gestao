import type { 
  Filters,
  KpisRelatorio, 
  SerieLinha, 
  PrazoPrograma 
} from '../types';

import { 
  // mockKpis,
  // mockSerieLinha,
  mockPrazoPrograma
} from '../mocks/relatorio.mock';


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

  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(mockPrazoPrograma, _filtros);
  return mockPrazoPrograma;
}