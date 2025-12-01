import { Activity, Target, TrendingUp, Calendar } from 'lucide-react';
import { DualLineProgress } from '../gerar-relatorio/components/DualLineProgress';
import { AttentionStimuliCard } from '../../programas/relatorio-geral/components/AttentionStimuliCard';
import { OcpDeadlineCard } from '../gerar-relatorio/components/OcpDeadlineCard';
import type { RelatorioAreaConfig } from './types';

/**
 * Configuração de relatórios para Fonoaudiologia
 * 
 * Características:
 * - Foco em acerto vs independência
 * - Gráfico de linha dupla
 * - Estímulos que precisam atenção
 * - Prazo de programa (OCP)
 */
export const fonoConfig: RelatorioAreaConfig = {
  id: 'fonoaudiologia',
  label: 'Fonoaudiologia',
  icon: Activity,
  
  kpis: [
    {
      type: 'acerto-geral',
      label: 'Acerto geral',
      icon: Target,
      colorClass: 'text-green-600',
      dataKey: 'acerto',
    },
    {
      type: 'independencia',
      label: 'Independência',
      icon: TrendingUp,
      colorClass: 'text-blue-600',
      dataKey: 'independencia',
    },
    {
      type: 'tentativas',
      label: 'Tentativas',
      icon: Activity,
      colorClass: 'text-purple-600',
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
      type: 'dual-line-progress',
      title: 'Evolução - Acerto vs Independência',
      component: DualLineProgress,
      dataKey: 'serieLinha',
      height: 400,
    },
  ],
  
  filters: {
    programa: true,
    estimulo: true,
    terapeuta: true,
    periodo: true,
    comparar: true,
  },
  
  apiEndpoint: '/api/ocp/reports',
  
  attentionComponent: AttentionStimuliCard,
  deadlineComponent: OcpDeadlineCard,
  
  // Adapter mantém compatibilidade com estrutura atual
  dataAdapter: (rawData: any) => ({
    kpis: rawData.kpis || {
      acerto: 0,
      independencia: 0,
      tentativas: 0,
      sessoes: 0,
      assiduidade: undefined,
      gapIndependencia: undefined,
    },
    serieLinha: Array.isArray(rawData.graphic) ? rawData.graphic : [],
    prazoPrograma: rawData.programDeadline || null,
  }),
};
