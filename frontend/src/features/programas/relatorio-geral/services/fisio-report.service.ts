import type { Sessao } from '@/features/programas/consulta-sessao/types';
import type { SerieLinha } from '@/features/relatorios/gerar-relatorio/types';
import type { FisioActivityLoadData } from '../components/fisio/FisioActivityDurationChart';
import type { FisioAttentionActivityItem } from '../components/fisio/FisioAttentionActivitiesCard';
import type { FisioPerformanceRateData } from '../components/fisio/FisioAutonomyByCategoryChart';
import { extractStimulusIds } from '../utils/extractStimulusIds';

export interface FisioKpisData {
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  atividadesTotal: number;
  compensacaoTotal: number;
  desconfortoTotal: number;
}

/**
 * Função principal fazendo uma unica chamada ao backend e devolvendo os valores necessários
 */
export async function fetchPhysioReports(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) {
    return {
      activityDuration: [],
      performance: [],
      autonomyByCategory: [],
      attentionActivities: [],
      kpis: {
        desempenhou: 0,
        desempenhouComAjuda: 0,
        naoDesempenhou: 0,
        atividadesTotal: 0,
        compensacaoTotal: 0,
        desconfortoTotal: 0,
      },
    };
  }

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes)

  const response = await fetch('/api/ocp/physiotherapy/sessions/calculatePhysioKpis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionIds, stimulusIds }),
  });

  if (!response.ok) {
    console.error("Erro buscando relatórios:", await response.text());
    return {
      activityDuration: [],
      performance: [],
      autonomyByCategory: [],
      attentionActivities: [],
      kpis: {
        desempenhou: 0,
        desempenhouComAjuda: 0,
        naoDesempenhou: 0,
        atividadesTotal: 0,
        compensacaoTotal: 0,
        desconfortoTotal: 0,
      },
    };
  }

  return await response.json();
}

/**
 * Calcula KPIs para relatório de Fisioterapia a partir das sessões [feito]
 */
export async function calculateFisioKpis(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) return {};

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes);

  const response = await fetch('/api/ocp/physiotherapy/sessions/calculatePhysioKpis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionIds,
      stimulusIds,
    })
  });

  if (!response.ok) {
    console.error('Erro ao buscar relatório de tempo de atividade:', await response.text());
    return {};
  }

  const data = await response.json();

  return data as FisioKpisData[];
}

/**
 * Prepara dados para gráfico de linhas (desempenho por sessão) [feito]
 * Formato compatível com ToPerformanceChart (SerieLinha[])
 * 
 * IMPORTANTE: Fisio não usa terminologia "acerto/erro" - usamos "desempenhou/não desempenhou"
 * 
 * Mapeamento de dados TO (dataKeys do backend são reutilizados de Fono):
 * - acerto (dataKey) → Desempenhou: Paciente realizou a atividade de forma independente, sem ajuda
 * - independencia (dataKey) → Desempenhou com Ajuda: Paciente realizou a atividade com suporte do terapeuta
 * - erro (calculado) → Não Desempenhou: Paciente não conseguiu realizar a atividade = 100% - acerto
 * 
 * Tipos de resultado nas sessões TO (backend):
 * - resultado === 'acerto' → Interpretado como DESEMPENHOU (independente)
 * - resultado === 'ajuda' → Interpretado como DESEMPENHOU COM AJUDA
 * - resultado === 'erro' → Interpretado como NÃO DESEMPENHOU
 */
export async function prepareFisioPerformanceLineData(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) return [];

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes);

  const response = await fetch('/api/ocp/physiotherapy/sessions/performanceLine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionIds,
      stimulusIds,
    })
  });

  return await response.json() as SerieLinha[];
  {
    if (!response.ok) {
      console.error('Erro ao buscar desempenho por sessão:', await response.text());
      return [];
    }
  
    // Dados mockados para demonstração
    if (!sessoes || sessoes.length === 0) {
      return [
        { x: '07/11', acerto: 75, independencia: 60 },
        { x: '11/11', acerto: 80, independencia: 65 },
        { x: '14/11', acerto: 85, independencia: 70 },
        { x: '18/11', acerto: 78, independencia: 68 },
        { x: '21/11', acerto: 90, independencia: 75 },
        { x: '25/11', acerto: 88, independencia: 73 },
      ];
    }
  
    // Agrupar registros por sessão (data)
    const sessoesPorData = new Map<string, { total: number; desempenhou: number; comAjuda: number }>();
  
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
          stats.comAjuda++; // Quem desempenhou sem ajuda também está no grupo "com ou sem ajuda"
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
      const independencia = stats.total > 0 ? Math.round((stats.comAjuda / stats.total) * 100) : 0;
  
      result.push({
        x: data,
        acerto, // → Será exibido como "Desempenhou" (linha verde no gráfico)
        independencia, // → Será exibido como "Desempenhou com Ajuda" (linha azul no gráfico)
        // erro (calculado no componente) = 100 - acerto → Será exibido como "Não Desempenhou" (linha vermelha)
      });
    });
  
    return result;
  }
}

/**
 * Prepara dados para gráfico de carga por atividade [feito]
 */
export async function prepareFisioActivityDurationData(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) return [];

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes);

  const response = await fetch('/api/ocp/physiotherapy/sessions/activityDurationData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionIds,
      stimulusIds,
    })
  });

  if (!response.ok) {
    console.error('Erro ao buscar relatório de tempo de atividade:', await response.text());
    return [];
  }

  const data = await response.json();
  return data as FisioActivityLoadData[];
}

/**
 * Identifica atividades que precisam de atenção [feito]
 * Critério: atividades com "não desempenhou" > 0
 * Inclui metadata (carga, desconforto, compensação)
 */
export function prepareFisioAttentionActivities(sessoes: Sessao[]): FisioAttentionActivityItem[] {
  // Dados mockados para demonstração
  // IMPORTANTE: Atividades de atenção sempre têm "não desempenhou" como predominante
  if (!sessoes || sessoes.length === 0) {
    return [
      {
        id: '1',
        nome: 'Extensão de Joelho',
        counts: {
          desempenhou: 2,
          comAjuda: 3,
          naoDesempenhou: 10,
        },
        total: 15,
        durationMinutes: 28,
        status: 'nao-desempenhou',
        metadata: {
          usedLoad: true,
          loadValue: '5kg',
          hadDiscomfort: true,
          discomfortDescription: 'Dor leve no joelho direito',
        },
      },
      {
        id: '2',
        nome: 'Agachamento',
        counts: {
          desempenhou: 3,
          comAjuda: 4,
          naoDesempenhou: 8,
        },
        total: 15,
        durationMinutes: 18,
        status: 'nao-desempenhou',
        metadata: {
          usedLoad: true,
          loadValue: '10kg',
          hadCompensation: true,
          compensationDescription: 'Rotação excessiva do ombro direito',
        },
      },
      {
        id: '3',
        nome: 'Leg Press',
        counts: {
          desempenhou: 2,
          comAjuda: 5,
          naoDesempenhou: 8,
        },
        total: 15,
        durationMinutes: 20,
        status: 'nao-desempenhou',
        metadata: {
          usedLoad: true,
          loadValue: '15kg',
        },
      },
    ];
  }

  // Mapear atividades e suas contagens
  const atividadeStats = new Map<
    string,
    {
      nome: string;
      desempenhou: number;
      comAjuda: number;
      naoDesempenhou: number;
      duracoes: number[];
      metadata: {
        usedLoad?: boolean;
        loadValue?: string;
        hadDiscomfort?: boolean;
        discomfortDescription?: string;
        hadCompensation?: boolean;
        compensationDescription?: string;
      };
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
          metadata: {},
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

      // Agregar metadata
      if (registro.metadata) {
        const metadata = typeof registro.metadata === 'string' 
          ? JSON.parse(registro.metadata) 
          : registro.metadata;

        if (metadata.usedLoad) {
          stats.metadata.usedLoad = true;
          stats.metadata.loadValue = metadata.loadValue;
        }
        if (metadata.hadDiscomfort) {
          stats.metadata.hadDiscomfort = true;
          stats.metadata.discomfortDescription = metadata.discomfortDescription;
        }
        if (metadata.hadCompensation) {
          stats.metadata.hadCompensation = true;
          stats.metadata.compensationDescription = metadata.compensationDescription;
        }
      }
    });
  });

  // Converter para array e calcular totais
  // IMPORTANTE: Só incluir atividades onde naoDesempenhou > 0 (que precisam de atenção)
  const result: FisioAttentionActivityItem[] = [];
  atividadeStats.forEach((stats, id) => {
    // Filtrar: só incluir se tiver pelo menos um "não desempenhou"
    if (stats.naoDesempenhou === 0) return;

    const total = stats.desempenhou + stats.comAjuda + stats.naoDesempenhou;
    const mediaDuracao =
      stats.duracoes.length > 0
        ? Math.round(stats.duracoes.reduce((acc, val) => acc + val, 0) / stats.duracoes.length)
        : null;

    // Determinar status predominante
    let status: 'desempenhou' | 'desempenhou-com-ajuda' | 'nao-desempenhou' = 'desempenhou';
    if (stats.naoDesempenhou > stats.desempenhou && stats.naoDesempenhou > stats.comAjuda) {
      status = 'nao-desempenhou';
    } else if (stats.comAjuda > stats.desempenhou) {
      status = 'desempenhou-com-ajuda';
    }

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
      status,
      metadata: Object.keys(stats.metadata).length > 0 ? stats.metadata : undefined,
    });
  });

  return result;
}

/**
 * Prepara dados para gráfico de taxa de desempenho por atividade [feito]
 * Calcula o percentual de execução independente (sem ajuda) por atividade
 */
export async function prepareFisioAutonomyByCategory(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) return [];

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes);

  const response = await fetch('/api/ocp/physiotherapy/sessions/autonomyByCategory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionIds,
      stimulusIds,
    }),
  });

  if (!response.ok) {
    console.error('Erro ao buscar relatório de autonomia por categoria:', await response.text());
    return [];
  }

  return await response.json() as FisioPerformanceRateData[];
}

