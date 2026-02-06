import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PhysioSession } from "./types.js";

export function calcPerformanceLine(sessions: PhysioSession[]) {
  const result = [];

  for (const session of sessions) {
    const trials = session.trials;

    if (trials.length === 0) continue;

    const totalTrials = trials.length;
    const independentCount = trials.filter(t => t.resultado === 'independent').length;
    const promptedCount = trials.filter(t => t.resultado === 'prompted').length;
    const failedCount = trials.filter(t => t.resultado === 'error').length;

    const performancePercent = Math.round(((independentCount + promptedCount) / totalTrials) * 100);
    const promptedPercent = Math.round((promptedCount / totalTrials) * 100);
    const failedPercent = Math.round((failedCount / totalTrials) * 100);

    result.push({
        x: format(new Date(session.data_criacao), "dd/MM", { locale: ptBR }),
        acerto: performancePercent,
        independencia: promptedPercent,
        ajuda: promptedPercent,
        erro: failedPercent,
    });
  }

  return result;
}