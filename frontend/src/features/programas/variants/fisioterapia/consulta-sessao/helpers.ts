import type { Counts } from '@/features/programas/consulta-sessao/pages/helpers';

export type FisioStatus = 'desempenhou' | 'nao-desempenhou' | 'desempenhou-com-ajuda';

/**
 * Determina o status predominante baseado nas contagens de TO
 * Retorna qual tipo de desempenho foi mais frequente
 */
export function getFisioStatus(counts: Counts): FisioStatus {
  const { erro, ajuda, indep } = counts;
  
  // Encontrar o maior valor
  const max = Math.max(erro, ajuda, indep);
  
  // Retornar o status correspondente ao maior valor
  // Em caso de empate, prioriza: desempenhou > desempenhou-com-ajuda > não-desempenhou
  if (indep === max) return 'desempenhou';
  if (ajuda === max) return 'desempenhou-com-ajuda';
  return 'nao-desempenhou';
}

/**
 * Configuração de status específica para Fisioterapia
 * Baseado no desempenho predominante da atividade
 */
export function getFisioStatusConfig(status: FisioStatus) {
  const configs = {
    'desempenhou': {
      label: 'Desempenhou',
      color: '#22c55e', // green-500
      cls: 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    },
    'desempenhou-com-ajuda': {
      label: 'Desempenhou com Ajuda',
      color: '#f59e0b', // amber-500
      cls: 'text-amber-700 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
    },
    'nao-desempenhou': {
      label: 'Não Desempenhou',
      color: '#ef4444', // red-500
      cls: 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    },
  };
  return configs[status];
}
