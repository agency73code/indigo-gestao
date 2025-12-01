import { Activity, TrendingUp, Zap, Calendar } from 'lucide-react';
import type { RelatorioAreaConfig } from './types';

/**
 * Configuração de relatórios para áreas de Movimento
 * (Fisioterapia, Psicomotricidade, Educação Física)
 * 
 * Características:
 * - Foco em amplitude de movimento e coordenação
 * - Gráficos de área/evolução motora
 * - Análise de progresso funcional
 */
export const movimentoConfig: RelatorioAreaConfig = {
  id: 'movimento',
  label: 'Movimento',
  icon: Activity,
  
  kpis: [
    {
      type: 'amplitude-movimento',
      label: 'Amplitude de Movimento',
      icon: TrendingUp,
      colorClass: 'text-blue-600',
      dataKey: 'amplitudeMovimento',
    },
    {
      type: 'coordenacao',
      label: 'Coordenação',
      icon: Zap,
      colorClass: 'text-purple-600',
      dataKey: 'coordenacao',
    },
    {
      type: 'tentativas',
      label: 'Tentativas',
      icon: Activity,
      colorClass: 'text-green-600',
      dataKey: 'tentativas',
    },
    {
      type: 'sessoes',
      label: 'Sessões',
      icon: Calendar,
      colorClass: 'text-pink-600',
      dataKey: 'sessoes',
    },
  ],
  
  charts: [
    {
      type: 'evolution-area',
      title: 'Evolução Motora',
      component: null as any, // Será criado
      dataKey: 'evolutionData',
      height: 400,
    },
  ],
  
  filters: {
    programa: true,
    estimulo: true,
    terapeuta: true,
    periodo: true,
    comparar: false,
  },
  
  apiEndpoint: '/api/movimento/reports',
  
  attentionComponent: undefined,
  deadlineComponent: undefined,
  
  dataAdapter: (rawData: any) => ({
    kpis: {
      amplitudeMovimento: rawData.kpis?.amplitudeMovimento || 0,
      coordenacao: rawData.kpis?.coordenacao || 0,
      tentativas: rawData.kpis?.tentativas || 0,
      sessoes: rawData.kpis?.sessoes || 0,
    },
    evolutionData: rawData.evolutionData || [],
  }),
};
