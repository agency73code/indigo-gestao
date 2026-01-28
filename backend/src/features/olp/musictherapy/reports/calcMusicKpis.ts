import type { MusicSession } from "./types.js";
import { toFixedNumber } from "./utils.js";

export function calcMusicKpis(sessions: MusicSession[]) {
    let independent = 0;
    let prompted = 0;
    let failed = 0;
    let totalSessions = 0;
    let totalActivities = 0;
    let totalSupport = 0;
    let totalParticipation = 0;

    
    for (const session of sessions) {
        totalSessions += 1;
        
        for (const trial of session.trials) {
            totalActivities += 1;
            if (trial.resultado === 'independent') independent += 1;
            else if (trial.resultado === 'prompted') prompted += 1;
            else if (trial.resultado === 'error') failed += 1;
            
            totalSupport += trial.suporte ?? 0;
            totalParticipation += trial.participacao ?? 0;
        }
    }

    totalSupport = totalSupport / totalActivities;
    totalParticipation = totalParticipation / totalActivities;

    return {
        atividadesTotal: totalActivities,
        avgParticipacao: toFixedNumber(totalParticipation),
        avgSuporte: toFixedNumber(totalSupport),
        desempenhou: independent,
        desempenhouComAjuda: prompted,
        naoDesempenhou: failed,
        sessoesTotal: totalSessions,
    };
}