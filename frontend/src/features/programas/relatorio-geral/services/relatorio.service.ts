import type { 
  Filters,
  KpisRelatorio, 
  SerieLinha, 
  PrazoPrograma 
} from '../types';

import { 
  mockKpis,
  mockSerieLinha,
  mockPrazoPrograma
} from '../mocks/relatorio.mock';

// Por enquanto usando mocks, mas no jeito para integração com API - Diga se é assim que gosta ;)
export async function fetchKpis(_filtros: Filters): Promise<KpisRelatorio> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/kpis', { params: _filtros });
  // return response.data;
  
  // Simula delay da API
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockKpis;
}

export async function fetchSerieLinha(_filtros: Filters): Promise<SerieLinha[]> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/serie-linha', { params: _filtros });
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockSerieLinha;
}





export async function fetchPrazoPrograma(_filtros: Filters): Promise<PrazoPrograma> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/prazo-programa', { params: _filtros });
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPrazoPrograma;
}