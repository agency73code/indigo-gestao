import type { Sessao } from '@/features/programas/consulta-sessao/types';
import type { SerieLinha } from '@/features/relatorios/gerar-relatorio/types';
import type { ToActivityDurationData } from '../components/to/ToActivityDurationChart';
import type { ToAttentionActivityItem } from '../components/to/ToAttentionActivitiesCard';
import type { ToAutonomyData } from '../components/to/ToAutonomyByCategoryChart';

export interface ToKpisData {
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  tempoTotal: number;
  atividadesTotal: number;
  sessoesTotal: number;
}

/**
 * Calcula KPIs para relatório de TO a partir das sessões
 */
export function calculateToKpis(sessoes: Sessao[]): ToKpisData {
  let desempenhou = 0;
  let desempenhouComAjuda = 0;
  let naoDesempenhou = 0;
  let tempoTotal = 0;
  const atividadesUnicas = new Set<string>();

  sessoes.forEach((sessao) => {
    const countedStimuli = new Set<string>();
    sessao.registros.forEach((registro) => {
      // 1) Contar resultados e atividades
      if (registro.resultado === 'acerto') {
        desempenhou++;
      } else if (registro.resultado === 'ajuda') {
        desempenhouComAjuda++;
      } else if (registro.resultado === 'erro') {
        naoDesempenhou++;
      }

      // 2) Somar o tempo apenas uma vez por estímulo (ou sessão quando sem stimulusId)
      if (registro.durationMinutes) {
        const key = registro.stimulusId ?? `sessao-${sessao.id}`;

        if (!countedStimuli.has(key)) {
          tempoTotal += registro.durationMinutes;
          countedStimuli.add(key);
        }
      }

      // Contar atividades únicas
      if (registro.stimulusId) {
        atividadesUnicas.add(registro.stimulusId);
      }
    });
  });

  return {
    desempenhou,
    desempenhouComAjuda,
    naoDesempenhou,
    tempoTotal: Math.round(tempoTotal),
    atividadesTotal: atividadesUnicas.size,
    sessoesTotal: sessoes.length,
  };
}

/**
 * Prepara dados para gráfico de linhas (desempenho por sessão)
 * Formato compatível com ToPerformanceChart (SerieLinha[])
 * 
 * IMPORTANTE: TO não usa terminologia "acerto/erro" - usamos "desempenhou/não desempenhou"
 * 
 * Mapeamento de dados TO (dataKeys do backend são reutilizados de Fono):
 * - acerto (dataKey) → Desempenhou: Paciente realizou a atividade de forma independente, sem ajuda
 * - independencia (dataKey) → Desempenhou com Ajuda: Paciente realizou a atividade com suporte do terapeuta
 * - erro (calculado) → Não Desempenhou: Paciente não conseguiu realizar a atividade = 100% - (acerto + independencia)
 * 
 * Tipos de resultado nas sessões TO (backend):
 * - resultado === 'acerto' → Interpretado como DESEMPENHOU (independente)
 * - resultado === 'ajuda' → Interpretado como DESEMPENHOU COM AJUDA
 * - resultado === 'erro' → Interpretado como NÃO DESEMPENHOU
 */
export function prepareToPerformanceLineData(sessoes: Sessao[]): SerieLinha[] {
  // Agrupar registros por sessão (data)
  const sessoesPorData = new Map<
    string,
    { total: number; desempenhou: number; comAjuda: number }
  >();

  sessoes.forEach((sessao) => {
    const data = new Date(sessao.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    if (!sessoesPorData.has(data)) {
      sessoesPorData.set(data, { total: 0, desempenhou: 0, comAjuda: 0 });
    }

    const stats = sessoesPorData.get(data)!;

    sessao.registros.forEach((registro) => {
      stats.total++;
      
      // DESEMPENHOU: Paciente realizou a atividade de forma independente, sem ajuda do terapeuta
      // Backend retorna resultado === 'acerto', mas para TO interpretamos como "Desempenhou"
      if (registro.resultado === 'acerto') {
        stats.desempenhou++;
      } 
      // DESEMPENHOU COM AJUDA: Paciente realizou a atividade, mas precisou de suporte do terapeuta
      // Backend retorna resultado === 'ajuda'
      else if (registro.resultado === 'ajuda') {
        stats.comAjuda++;
      }
      // NÃO DESEMPENHOU: Paciente não conseguiu realizar a atividade
      // Backend retorna resultado === 'erro', mas para TO interpretamos como "Não Desempenhou"
      // Não precisa contar explicitamente, será calculado como 100% - desempenhou
    });
  });

  // Converter para formato SerieLinha
  // NOTA: dataKeys 'acerto' e 'independencia' são reutilizados do backend de Fono
  // mas em TO representam "Desempenhou" e "Desempenhou com Ajuda"
  const result: SerieLinha[] = [];
  sessoesPorData.forEach((stats, data) => {
    // acerto (dataKey) = % de atividades DESEMPENHADAS (sem ajuda, independente)
    const acerto = stats.total > 0 ? Math.round((stats.desempenhou / stats.total) * 100) : 0;

    // independencia (dataKey) = % de atividades DESEMPENHADAS COM AJUDA (com suporte do terapeuta)
    const independencia =
      stats.total > 0 ? Math.round((stats.comAjuda / stats.total) * 100) : 0;

      result.push({
        x: data,
        acerto, // → Será exibido como "Desempenhou" (linha verde no gráfico)
        independencia, // → Será exibido como "Desempenhou com Ajuda" (linha azul no gráfico)
        // erro (calculado no componente) = 100 - (acerto + independencia) → Será exibido como "Não Desempenhou" (linha vermelha)
      });
  });

  return result;
}

/**
 * Prepara dados para gráfico de duração por atividade
 */
export function prepareToActivityDurationData(sessoes: Sessao[]): ToActivityDurationData[] {
  // Mapear atividades e suas durações
  const atividadeDuracoes = new Map<string, { nome: string; duracoes: number[] }>();

  sessoes.forEach((sessao) => {
    sessao.registros.forEach((registro) => {
      if (!registro.stimulusId || !registro.durationMinutes) return;

      const key = registro.stimulusId;
      if (!atividadeDuracoes.has(key)) {
        atividadeDuracoes.set(key, {
          nome: registro.stimulusLabel || 'Atividade sem nome',
          duracoes: [],
        });
      }
      atividadeDuracoes.get(key)!.duracoes.push(registro.durationMinutes);
    });
  });

  // Calcular média de duração para cada atividade
  const result: ToActivityDurationData[] = [];
  atividadeDuracoes.forEach(({ nome, duracoes }) => {
    const media = duracoes.reduce((acc, val) => acc + val, 0) / duracoes.length;
    result.push({
      atividade: nome,
      duracao: Math.round(media),
    });
  });

  // Ordenar por duração (maior primeiro)
  return result.sort((a, b) => b.duracao - a.duracao);
}

/**
 * Identifica atividades que precisam de atenção
 * Critério: atividades com "não desempenhou" > 0
 */
export function prepareToAttentionActivities(sessoes: Sessao[]): ToAttentionActivityItem[] {
  // Mapear atividades e suas contagens
  const atividadeStats = new Map<
    string,
    {
      nome: string;
      desempenhou: number;
      comAjuda: number;
      naoDesempenhou: number;
      duracoes: number[];
    }
  >();

  sessoes.forEach((sessao) => {
    sessao.registros.forEach((registro) => {
      if (!registro.stimulusId) return;

      const key = registro.stimulusId;
      if (!atividadeStats.has(key)) {
        atividadeStats.set(key, {
          nome: registro.stimulusLabel || 'Atividade sem nome',
          desempenhou: 0,
          comAjuda: 0,
          naoDesempenhou: 0,
          duracoes: [],
        });
      }

      const stats = atividadeStats.get(key)!;
      if (registro.resultado === 'acerto') {
        stats.desempenhou++;
      } else if (registro.resultado === 'ajuda') {
        stats.comAjuda++;
      } else if (registro.resultado === 'erro') {
        stats.naoDesempenhou++;
      }

      if (registro.durationMinutes) {
        stats.duracoes.push(registro.durationMinutes);
      }
    });
  });

  // Converter para array e calcular totais
  const result: ToAttentionActivityItem[] = [];
  atividadeStats.forEach((stats, id) => {
    const total = stats.desempenhou + stats.comAjuda + stats.naoDesempenhou;
    const mediaDuracao =
      stats.duracoes.length > 0
        ? Math.round(stats.duracoes.reduce((acc, val) => acc + val, 0) / stats.duracoes.length)
        : null;

    result.push({
      id,
      nome: stats.nome,
      counts: {
        desempenhou: stats.desempenhou,
        comAjuda: stats.comAjuda,
        naoDesempenhou: stats.naoDesempenhou,
      },
      total,
      durationMinutes: mediaDuracao,
    });
  });

  return result;
}

/**
 * Prepara dados para gráfico de autonomia por categoria
 * Calcula o percentual de desempenho independente (sem ajuda) por categoria
 */
export function prepareToAutonomyByCategory(sessoes: Sessao[]): ToAutonomyData[] {
  // Mapear categorias e suas contagens
  const categoriaStats = new Map<
    string,
    {
      total: number;
      independente: number; // Desempenhou sem ajuda
    }
  >();

  sessoes.forEach((sessao) => {
    sessao.registros.forEach((registro) => {
      // Usar o stimulusLabel como categoria (pode ser ajustado conforme estrutura real)
      const categoria = registro.stimulusLabel || 'Sem categoria';

      if (!categoriaStats.has(categoria)) {
        categoriaStats.set(categoria, { total: 0, independente: 0 });
      }

      const stats = categoriaStats.get(categoria)!;
      stats.total++;

      // Contar apenas desempenho independente (sem ajuda)
      if (registro.resultado === 'acerto') {
        stats.independente++;
      }
    });
  });

  // Converter para array e calcular percentuais
  const result: ToAutonomyData[] = [];
  categoriaStats.forEach((stats, categoria) => {
    const autonomia = stats.total > 0 ? Math.round((stats.independente / stats.total) * 100) : 0;
    result.push({ categoria, autonomia });
  });

  // Ordenar por autonomia (maior primeiro)
  return result.sort((a, b) => b.autonomia - a.autonomia).slice(0, 8); // Top 8 categorias
}
