import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OccupationalSession } from "./types.js";

export function calcOcuppationalPerformanceLine(sessions: OccupationalSession[]) {
  const result = [];

  for (const session of sessions) {
    const trials = session.trials;

    if (trials.length === 0) continue;

    const totalTrials = trials.length;
    const independentCount = trials.filter(t => t.resultado === 'independent').length;
    const promptedCount = trials.filter(t => t.resultado === 'prompted').length;
    const errorCount = trials.filter(t => t.resultado === 'error').length;

    const performancePercent = Math.round(((independentCount + promptedCount) / totalTrials) * 100);
    const promptedPercent = Math.round((promptedCount / totalTrials) * 100);
    const errorPercent = Math.round((errorCount / totalTrials) * 100);

    /**
     * COMPATIBILIDADE COM FRONTEND LEGADO
     *
     * O campo `ajuda` representa corretamente o percentual de
     * "Desempenhou com ajuda" (prompted).
     *
     * Gráficos legados no frontend consomem o campo
     * `independencia` como se fosse "Desempenhou com ajuda".
     *
     * Por esse motivo, `independencia` é propositalmente preenchido
     * com o valor de `promptedPercent` neste contexto.
     *
     * Este valor NÃO representa independência clínica real.
     * O campo correto para este dado é `ajuda`.
     * Não alterar este mapeamento sem revisar os gráficos dependentes.
   */

    result.push({
        x: format(new Date(session.data_criacao), "dd/MM", { locale: ptBR }),
        acerto: performancePercent,
        independencia: promptedPercent,
        ajuda: promptedPercent,
        erro: errorPercent,
    });
  }

  return result;
}