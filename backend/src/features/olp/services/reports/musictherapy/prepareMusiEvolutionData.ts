import { ptBR } from "date-fns/locale";
import type { MusicSession } from "./types.js";
import { format } from "date-fns";

export function prepareMusiEvolutionData(sessions: MusicSession[]) {
    const result = [];
    
    for (const session of sessions) {
        let activities = 0;
        let supportSum = 0;
        let participationSum = 0;

        for (const trial of session.trials) {
            activities += 1;
            supportSum += trial.suporte ?? 0;
            participationSum += trial.participacao ?? 0;
        }

        supportSum = supportSum / activities;
        participationSum = participationSum / activities;

        result.push({
            x: format(new Date(session.data_criacao), "dd/MM", { locale: ptBR }),
            participacao: participationSum,
            suporte: supportSum,
        });
    }
    return result;
}