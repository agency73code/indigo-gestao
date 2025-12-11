import type { AreaType } from '@/contexts/AreaContext';
import { fonoConfig } from './fonoConfig';
import { toConfig } from './toConfig';
import { fisioConfig } from './fisioConfig';
import { musiConfig } from './musiConfig';
import type { AreaConfigMap, RelatorioAreaConfig } from './types';

/**
 * Mapa de configurações de relatório por área terapêutica
 * 
 * Centraliza todas as configurações de áreas em um único lugar.
 * Para adicionar uma nova área:
 * 1. Crie um arquivo de config (ex: psicopedagogiaConfig.ts)
 * 2. Importe e adicione aqui no AREA_CONFIGS
 * 
 * NOTA: Psicomotricidade e Educação Física usam o mesmo modelo de Fisioterapia
 * NOTA: Psicopedagogia e Terapia ABA usam o mesmo modelo de Fonoaudiologia
 */
export const AREA_CONFIGS: AreaConfigMap = {
  'fonoaudiologia': fonoConfig,
  'terapia-ocupacional': toConfig,
  'fisioterapia': fisioConfig,
  'psicomotricidade': fisioConfig,  // Usa modelo Fisio
  'educacao-fisica': fisioConfig,   // Usa modelo Fisio
  'musicoterapia': musiConfig,
  'psicopedagogia': fonoConfig,     // Usa modelo Fono
  'terapia-aba': fonoConfig,        // Usa modelo Fono
};

/**
 * Obtém a configuração de relatório para uma área específica
 * 
 * @param area - Área terapêutica
 * @returns Configuração da área ou config padrão (Fono) se não encontrada
 */
export function getAreaConfig(area: AreaType | null | undefined): RelatorioAreaConfig {
  if (!area) {
    return fonoConfig; // Fallback padrão
  }
  
  return AREA_CONFIGS[area] || fonoConfig;
}

/**
 * Verifica se uma área tem configuração de relatório
 */
export function hasReportConfig(area: AreaType | null | undefined): boolean {
  if (!area) return false;
  return area in AREA_CONFIGS;
}

/**
 * Lista todas as áreas com configuração de relatório disponível
 */
export function getAvailableReportAreas(): AreaType[] {
  return Object.keys(AREA_CONFIGS) as AreaType[];
}

// Re-exporta tipos para conveniência
export type { RelatorioAreaConfig, KpiConfig, ChartConfig, FilterConfig } from './types';
