import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

type MusicSessionForChart = {
  createdAt: Date;
  trials: {
    participacao: number | null;
    suporte: number | null;
  }[];
};

export function mapMusicSessionToChartPoint(session: MusicSessionForChart) {
  let count = 0;
  let suporteTotal = 0;
  let participacaoTotal = 0;

  for (const trial of session.trials) {
    if (trial.suporte == null && trial.participacao == null) continue;

    count++;
    suporteTotal += trial.suporte ?? 0;
    participacaoTotal += trial.participacao ?? 0;
  }

  return {
    x: format(session.createdAt, "dd/MM", { locale: ptBR }),
    suporte: count ? suporteTotal / count : 0,
    participacao: count ? participacaoTotal / count : 0,
  };
}