import type { Sessao } from '@/features/programas/consulta-sessao/types';
import type { SerieLinha } from '@/features/relatorios/gerar-relatorio/types';
import type { FisioActivityLoadData } from '../components/fisio/FisioActivityDurationChart';
import type { FisioAttentionActivityItem } from '../components/fisio/FisioAttentionActivitiesCard';
import type { FisioPerformanceRateData } from '../components/fisio/FisioAutonomyByCategoryChart';

export interface FisioKpisData {
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  atividadesTotal: number;
  compensacaoTotal: number;
  desconfortoTotal: number;
}

/**
 * Calcula KPIs para relatório de Fisioterapia a partir das sessões
 */
export function calculateFisioKpis(sessoes: Sessao[]): FisioKpisData {
  // Dados mockados para demonstração
  if (!sessoes || sessoes.length === 0) {
    return {
      desempenhou: 11,
      desempenhouComAjuda: 10,
      naoDesempenhou: 8,
      atividadesTotal: 3,
      compensacaoTotal: 2,
      desconfortoTotal: 1,
    };
  }

  let desempenhou = 0;
  let desempenhouComAjuda = 0;
  let naoDesempenhou = 0;
  const atividadesUnicas = new Set<string>();
  const atividadesComCompensacao = new Set<string>();
  const atividadesComDesconforto = new Set<string>();

  sessoes.forEach((sessao) => {
    sessao.registros.forEach((registro) => {
      if (registro.resultado === 'acerto') {
        desempenhou++;
      } else if (registro.resultado === 'ajuda') {
        desempenhouComAjuda++;
      } else if (registro.resultado === 'erro') {
        naoDesempenhou++;
      }

      // Contar atividades únicas
      if (registro.stimulusId) {
        atividadesUnicas.add(registro.stimulusId);
      }

      // Verificar metadata de compensação e desconforto
      if (registro.metadata) {
        const metadata = typeof registro.metadata === 'string' 
          ? JSON.parse(registro.metadata) 
          : registro.metadata;

        if (metadata.hadCompensation && registro.stimulusId) {
          atividadesComCompensacao.add(registro.stimulusId);
        }

        if (metadata.hadDiscomfort && registro.stimulusId) {
          atividadesComDesconforto.add(registro.stimulusId);
        }
      }
    });
  });

  return {
    desempenhou,
    desempenhouComAjuda,
    naoDesempenhou,
    atividadesTotal: atividadesUnicas.size,
    compensacaoTotal: atividadesComCompensacao.size,
    desconfortoTotal: atividadesComDesconforto.size,
  };
}

/**
 * Prepara dados para gráfico de linhas (desempenho por sessão)
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
export function prepareFisioPerformanceLineData(sessoes: Sessao[]): SerieLinha[] {
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

/**
 * Prepara dados para gráfico de carga por atividade
 */
export function prepareFisioActivityDurationData(sessoes: Sessao[]): FisioActivityLoadData[] {
  // Dados mockados para demonstração
  if (!sessoes || sessoes.length === 0) {
    return [
      { atividade: 'Agachamento', carga: 15 },
      { atividade: 'Leg Press', carga: 12 },
      { atividade: 'Extensão de Joelho', carga: 10 },
      { atividade: 'Flexão de Cotovelo', carga: 8 },
      { atividade: 'Abdução de Ombro', carga: 6 },
      { atividade: 'Rosca Direta', carga: 5 },
      { atividade: 'Tríceps Testa', carga: 4 },
      { atividade: 'Elevação Lateral', carga: 3 },
    ];
  }

  // Mapear atividades e suas cargas
  const atividadeCargas = new Map<string, { nome: string; cargas: number[] }>();

  sessoes.forEach((sessao) => {
    sessao.registros.forEach((registro) => {
      if (!registro.stimulusId || !registro.metadata) return;

      const metadata = typeof registro.metadata === 'string' 
        ? JSON.parse(registro.metadata) 
        : registro.metadata;

      if (!metadata.usedLoad || !metadata.loadValue) return;

      // Extrair número do loadValue (ex: "2kg" -> 2, "5 kg" -> 5, "3.5kg" -> 3.5)
      const cargaStr = metadata.loadValue.replace(/[^0-9.]/g, '');
      const carga = parseFloat(cargaStr);

      if (isNaN(carga)) return;

      const key = registro.stimulusId;
      if (!atividadeCargas.has(key)) {
        atividadeCargas.set(key, {
          nome: registro.stimulusLabel || 'Atividade sem nome',
          cargas: [],
        });
      }
      atividadeCargas.get(key)!.cargas.push(carga);
    });
  });

  // Calcular média de carga para cada atividade
  const result: FisioActivityLoadData[] = [];
  atividadeCargas.forEach(({ nome, cargas }) => {
    const media = cargas.reduce((acc, val) => acc + val, 0) / cargas.length;
    result.push({
      atividade: nome,
      carga: Math.round(media * 10) / 10, // Arredondar para 1 casa decimal
    });
  });

  // Ordenar por carga (maior primeiro)
  return result.sort((a, b) => b.carga - a.carga);
}

/**
 * Identifica atividades que precisam de atenção
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
 * Prepara dados para gráfico de taxa de desempenho por atividade
 * Calcula o percentual de execução independente (sem ajuda) por atividade
 */
export function prepareFisioAutonomyByCategory(sessoes: Sessao[]): FisioPerformanceRateData[] {
  // Dados mockados para demonstração
  if (!sessoes || sessoes.length === 0) {
    return [
      { atividade: 'Extensão de Joelho', desempenho: 85 },
      { atividade: 'Flexão de Cotovelo', desempenho: 78 },
      { atividade: 'Agachamento', desempenho: 72 },
      { atividade: 'Abdução de Ombro', desempenho: 65 },
      { atividade: 'Leg Press', desempenho: 60 },
      { atividade: 'Rosca Direta', desempenho: 55 },
    ];
  }

  // Mapear atividades e suas contagens
  const atividadeStats = new Map<
    string,
    {
      nome: string;
      total: number;
      independente: number; // Desempenhou sem ajuda
    }
  >();

  sessoes.forEach((sessao) => {
    sessao.registros.forEach((registro) => {
      if (!registro.stimulusId) return;

      const key = registro.stimulusId;
      if (!atividadeStats.has(key)) {
        atividadeStats.set(key, {
          nome: registro.stimulusLabel || 'Atividade sem nome',
          total: 0,
          independente: 0,
        });
      }

      const stats = atividadeStats.get(key)!;
      stats.total++;

      // Contar apenas desempenho independente (sem ajuda)
      if (registro.resultado === 'acerto') {
        stats.independente++;
      }
    });
  });

  // Converter para array e calcular percentuais
  const result: FisioPerformanceRateData[] = [];
  atividadeStats.forEach((stats) => {
    const desempenho = stats.total > 0 ? Math.round((stats.independente / stats.total) * 100) : 0;
    result.push({ atividade: stats.nome, desempenho });
  });

  // Ordenar por desempenho (maior primeiro)
  return result.sort((a, b) => b.desempenho - a.desempenho).slice(0, 8); // Top 8 atividades
}
