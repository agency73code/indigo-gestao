import { Activity, CheckCircle, HandHelping, XCircle, Calendar, Clock } from 'lucide-react';
import type { RelatorioAreaConfig } from './types';

/**
 * Configuração de relatórios para Terapia Ocupacional
 * 
 * Características:
 * - Foco em desempenho (Desempenhou, Com Ajuda, Não Desempenhou)
 * - Gráficos de barras empilhadas por sessão
 * - Gráfico de duração por atividade
 * - Análise de independência funcional
 */
export const toConfig: RelatorioAreaConfig = {
  id: 'terapia-ocupacional',
  label: 'Terapia Ocupacional',
  icon: Activity,
  
  kpis: [
    {
      type: 'sessoes', // Tipo válido reutilizado para "atividades"
      label: 'Atividades',
      icon: Activity,
      colorClass: 'text-blue-600',
      dataKey: 'atividadesTotal',
    },
    {
      type: 'desempenhou',
      label: 'Desempenhou',
      icon: CheckCircle,
      colorClass: 'text-green-600',
      dataKey: 'desempenhou',
    },
    {
      type: 'desempenhou-ajuda',
      label: 'Com Ajuda',
      icon: HandHelping,
      colorClass: 'text-amber-600',
      dataKey: 'desempenhouComAjuda',
    },
    {
      type: 'nao-desempenhou',
      label: 'Não Desempenhou',
      icon: XCircle,
      colorClass: 'text-red-600',
      dataKey: 'naoDesempenhou',
    },
    {
      type: 'tentativas', // Tipo válido reutilizado para "tempo total"
      label: 'Tempo Total',
      icon: Clock,
      colorClass: 'text-indigo-600',
      dataKey: 'tempoTotal',
    },
    {
      type: 'sessoes',
      label: 'Sessões',
      icon: Calendar,
      colorClass: 'text-purple-600',
      dataKey: 'sessoesTotal',
    },
  ],
  
  charts: [],
  
  filters: {
    programa: true,
    estimulo: true,
    terapeuta: true,
    periodo: true,
    comparar: false,
  },
  
  apiEndpoint: '/api/to/reports',
  
  // attentionComponent e deadlineComponent removidos - lógica no GerarRelatorioPage
  
  dataAdapter: (rawData: any) => ({
    kpis: {
      atividadesTotal: rawData.kpis?.atividadesTotal || 0,
      desempenhou: rawData.kpis?.desempenhou || 0,
      desempenhouComAjuda: rawData.kpis?.desempenhouComAjuda || 0,
      naoDesempenhou: rawData.kpis?.naoDesempenhou || 0,
      tempoTotal: rawData.kpis?.tempoTotal || 0,
      sessoesTotal: rawData.kpis?.sessoesTotal || 0,
    },
    sessionData: rawData.sessionData || [],
    activityDuration: rawData.activityDuration || [],
    attentionActivities: rawData.attentionActivities || [],
  }),
};
