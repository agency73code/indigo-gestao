import type { sessao, sessao_trial, estimulo_ocp } from "@prisma/client";

export interface PhysioTrial extends sessao_trial {
    estimulosOcp: estimulo_ocp | null;
}

export interface PhysioSession extends sessao {
    trials: PhysioTrial[];
}