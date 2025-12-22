import type { sessao, sessao_trial, estimulo_ocp } from "@prisma/client";

export interface OccupationalTrial extends sessao_trial {
    estimulosOcp: estimulo_ocp | null;
}

export interface OccupationalSession extends sessao {
    trials: OccupationalTrial[];
}