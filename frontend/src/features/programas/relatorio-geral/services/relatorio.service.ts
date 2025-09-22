import type { 
  Filters,
  KpisRelatorio, 
  SerieLinha, 
  LinhaBarras, 
  HeatmapData, 
  SparkItem, 
  PrazoPrograma 
} from '../types';

import { 
  mockKpis,
  mockSerieLinha,
  mockBarras,
  mockHeatmap,
  mockSparklines,
  mockPrazoPrograma
} from '../mocks/relatorio.mock';

// Por enquanto usando mocks, mas preparado para integração com API
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

export async function fetchBarrasDistribuicao(_filtros: Filters): Promise<LinhaBarras[]> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/barras-distribuicao', { params: _filtros });
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockBarras;
}

export async function fetchHeatmap(_filtros: Filters): Promise<HeatmapData> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/heatmap', { params: _filtros });
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockHeatmap;
}

export async function fetchSparklines(_filtros: Filters): Promise<SparkItem[]> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/sparklines', { params: _filtros });
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSparklines;
}

export async function fetchPrazoPrograma(_filtros: Filters): Promise<PrazoPrograma> {
  // TODO: integrar com endpoint real
  // const response = await api.get('/relatorios/prazo-programa', { params: _filtros });
  // return response.data;
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPrazoPrograma;
}