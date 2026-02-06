import type { PhysioSession } from "./types.js";

export function calcAttentionActivities(sessions: PhysioSession[]) {
    // Mapa por estímulo
    const statsMap: Record<number, {
        name: string;
        independent: number;
        prompted: number;
        error: number;
        durations: number[];
        metadata: {
            usedLoad?: boolean;
            loadValue?: number | undefined;
            hadDiscomfort?: boolean;
            discomfortDescription?: string | undefined;
            hadCompensation?: boolean;
            compensationDescription?: string | undefined;
        };
    }> = {};

    for (const session of sessions) {
        for (const trial of session.trials) {
            const stimId = trial.estimulos_ocp_id;
            const name = trial.estimulosOcp?.nome || "Atividade sem nome";

            if (!statsMap[stimId]) {
                statsMap[stimId] = {
                    name,
                    independent: 0,
                    prompted: 0,
                    error: 0,
                    durations: [],
                    metadata: {}
                };
            }

            const s = statsMap[stimId];

            // Contagens
            if (trial.resultado === "independent") s.independent++;
            else if (trial.resultado === "prompted") s.prompted++;
            else if (trial.resultado === "error") s.error++;

            // duração
            if (trial.duracao_minutos != null) {
                s.durations.push(trial.duracao_minutos);
            }

            // Metadata
            if (trial.utilizou_carga) {
                s.metadata.usedLoad = true;
                s.metadata.loadValue = trial.valor_carga ?? undefined;
            }
            if (trial.teve_desconforto) {
                s.metadata.hadDiscomfort = true;
                s.metadata.discomfortDescription = trial.descricao_desconforto ?? undefined;
            }
            if (trial.teve_compensacao) {
                s.metadata.hadCompensation = true;
                s.metadata.compensationDescription = trial.descricao_compensacao ?? undefined;
            }
        }
    }

    // Montar resultado final
    const result = [];

    for (const [id, s] of Object.entries(statsMap)) {
        if (s.error === 0) continue; // somente atividades com erro

        const total = s.independent + s.prompted + s.error;
        const avgDuration =
            s.durations.length > 0
                ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length)
                : null;

        // status predominante
        const status =
            s.error > s.prompted && s.error > s.independent
                ? "nao-desempenhou"
                : s.prompted > s.independent
                ? "desempenhou-com-ajuda"
                : "desempenhou";

        result.push({
            id: Number(id),
            nome: s.name,
            counts: {
                desempenhou: s.independent,
                comAjuda: s.prompted,
                naoDesempenhou: s.error,
            },
            total,
            durationMinutes: avgDuration,
            status,
            metadata: Object.keys(s.metadata).length > 0 ? s.metadata : undefined
        });
    }

    return result;
}