import type { AreaType } from '@/contexts/AreaContext';
import { fonoConfig } from './fonoConfig';
import { toConfig } from './toConfig';
import { fisioConfig } from './fisioConfig';
import { movimentoConfig } from './movimentoConfig';
import type { AreaConfigMap, RelatorioAreaConfig } from './types';

/**
 * Mapa de configurações de relatório por área terapêutica
 * 
 * Centraliza todas as configurações de áreas em um único lugar.
 * Para adicionar uma nova área:
 * 1. Crie um arquivo de config (ex: psicopedagogiaConfig.ts)
 * 2. Importe e adicione aqui no AREA_CONFIGS
 */
export const AREA_CONFIGS: AreaConfigMap = {
  'fonoaudiologia': fonoConfig,
  'terapia-ocupacional': toConfig,
  'fisioterapia': fisioConfig,
  'psicomotricidade': movimentoConfig,
  'educacao-fisica': movimentoConfig,
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
