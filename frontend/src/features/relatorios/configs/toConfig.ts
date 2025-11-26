import { Activity, CheckCircle, HelpCircle, XCircle, Calendar } from 'lucide-react';
import type { RelatorioAreaConfig } from './types';

/**
 * Configuração de relatórios para Terapia Ocupacional
 * 
 * Características:
 * - Foco em desempenho (Desempenhou, Com Ajuda, Não Desempenhou)
 * - Gráficos de barras por atividade
 * - Análise de independência funcional
 */
export const toConfig: RelatorioAreaConfig = {
  id: 'terapia-ocupacional',
  label: 'Terapia Ocupacional',
  icon: Activity,
  
  kpis: [
    {
      type: 'desempenhou',
      label: 'Desempenhou',
      icon: CheckCircle,
      colorClass: 'text-green-600',
      dataKey: 'desempenhou',
    },
    {
      type: 'desempenhou-ajuda',
      label: 'Desempenhou com Ajuda',
      icon: HelpCircle,
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
      type: 'sessoes',
      label: 'Sessões',
      icon: Calendar,
      colorClass: 'text-blue-600',
      dataKey: 'sessoes',
    },
  ],
  
  charts: [
    {
      type: 'performance-bars',
      title: 'Desempenho por Atividade',
      component: null as any, // Será criado
      dataKey: 'performanceByActivity',
      height: 400,
    },
  ],
  
  filters: {
    programa: true,
    estimulo: true, // Na TO, "estímulos" são "atividades"
    terapeuta: true,
    periodo: true,
    comparar: false, // TO não usa comparação de períodos
  },
  
  apiEndpoint: '/api/to/reports',
  
  // TO não tem componente de atenção ainda (pode ser adicionado depois)
  attentionComponent: undefined,
  
  // TO não usa prazo de programa da mesma forma que Fono
  deadlineComponent: undefined,
  
  // Adapter para formatar dados específicos de TO
  dataAdapter: (rawData: any) => ({
    kpis: {
      desempenhou: rawData.kpis?.desempenhou || 0,
      desempenhouComAjuda: rawData.kpis?.desempenhouComAjuda || 0,
      naoDesempenhou: rawData.kpis?.naoDesempenhou || 0,
      sessoes: rawData.kpis?.sessoes || 0,
    },
    performanceByActivity: rawData.performanceByActivity || [],
  }),
};
