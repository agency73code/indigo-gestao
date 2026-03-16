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

    result.push({
        x: format(new Date(session.data_criacao), "dd/MM", { locale: ptBR }),
        acerto: performancePercent,
        ajuda: promptedPercent,
        erro: errorPercent,
    });
  }

  return result;
}