import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * Tipos de gráficos disponíveis no sistema
 */
export type ChartType = 
  | 'dual-line-progress'     // Fono: Acerto + Independência
  | 'performance-bars'       // TO: Barras de desempenho por atividade
  | 'evolution-area'         // Movimento: Área de evolução motora
  | 'comparative-radar';     // Psico: Radar comparativo

/**
 * Tipos de KPI cards disponíveis
 */
export type KpiType =
  | 'acerto-geral'
  | 'independencia'
  | 'tentativas'
  | 'sessoes'
  | 'desempenhou'           // TO específico
  | 'desempenhou-ajuda'     // TO específico
  | 'nao-desempenhou'       // TO específico
  | 'amplitude-movimento'   // Movimento específico
  | 'coordenacao';          // Movimento específico

/**
 * Configuração de um KPI card
 */
export interface KpiConfig {
  type: KpiType;
  label: string;
  icon: LucideIcon;
  colorClass?: string;
  dataKey: string; // chave nos dados retornados da API
}

/**
 * Configuração de um gráfico
 */
export interface ChartConfig {
  type: ChartType;
  title: string;
  component: ComponentType<any>;
  dataKey: string; // chave nos dados retornados da API
  height?: number;
}

/**
 * Configuração de filtros disponíveis por área
 */
export interface FilterConfig {
  programa: boolean;
  estimulo: boolean;
  terapeuta: boolean;
  periodo: boolean;
  comparar?: boolean;
  // TO e Movimento podem ter filtros específicos
  customFilters?: {
    id: string;
    label: string;
    type: 'select' | 'multiselect' | 'toggle';
  }[];
}

/**
 * Configuração completa de uma área terapêutica
 */
export interface RelatorioAreaConfig {
  /** Identificador único da área */
  id: string;
  
  /** Nome de exibição */
  label: string;
  
  /** Ícone da área */
  icon: LucideIcon;
  
  /** Cards KPI a serem exibidos */
  kpis: KpiConfig[];
  
  /** Gráficos a serem exibidos */
  charts: ChartConfig[];
  
  /** Configuração de filtros disponíveis */
  filters: FilterConfig;
  
  /** Endpoint base da API para dados */
  apiEndpoint: string;
  
  /** Componente de "atenção" (como AttentionStimuliCard) */
  attentionComponent?: ComponentType<any>;
  
  /** Componente de prazo/deadline */
  deadlineComponent?: ComponentType<any>;
  
  /** Função para adaptar dados da API para o formato esperado pelos componentes */
  dataAdapter?: (rawData: any) => any;
}

/**
 * Mapa de todas as configurações de área
 */
export type AreaConfigMap = Record<string, RelatorioAreaConfig>;
