import type { MusicSession } from "./types.js";

export function prepareMusiAttentionActivities(sessions: MusicSession[]) {
    const statsMap: Record<number, {
        id: string,
        nome: string,
        order: number,
        counts: {
            desempenhou: number,
            comAjuda: number,
            naoDesempenhou: number,
        },
        total: number,
        participacao: number,
        suporte: number,
    }> = {};

    for (const session of sessions) {
        for (const trial of session.trials) {
            const stimId = trial.estimulos_ocp_id;
            const name = trial.estimulosOcp?.nome || "Atividade sem nome";

            if (!statsMap[stimId]) {
                statsMap[stimId] = {
                    id: stimId.toString(),
                    nome: name,
                    order: 0,
                    counts: {
                        desempenhou: 0,
                        comAjuda: 0,
                        naoDesempenhou: 0,
                    },
                    total: 0,
                    participacao: 0,
                    suporte: 0,
                };
            }

            const item = statsMap[stimId];

            if (trial.resultado === 'independent') item.counts.desempenhou++;
            else if (trial.resultado === 'prompted') item.counts.comAjuda++;
            else if (trial.resultado === 'error') item.counts.naoDesempenhou++;

            item.participacao += trial.participacao ?? 0;
            item.suporte += trial.suporte ?? 0;
        }
    }

    const result = [];
    let order = 0;

    for (const [id, s] of Object.entries(statsMap)) {
        if (s.counts.naoDesempenhou === 0) continue; // somente atividades com erro

        const total = s.counts.desempenhou + s.counts.comAjuda + s.counts.naoDesempenhou;

        result.push({
            id,
            nome: s.nome,
            order: order,
            counts: {
                desempenhou: s.counts.desempenhou,
                comAjuda: s.counts.comAjuda,
                naoDesempenhou: s.counts.naoDesempenhou,
            },
            total,
            participacao: s.participacao / total, // 0-5
            suporte: s.suporte / total, // 1-5
        })
        order++;
    }

    return result;
}