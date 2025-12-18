import type { sessao, sessao_trial, estimulo_ocp } from "@prisma/client";

export interface MusicTrial extends sessao_trial {
    estimulosOcp: estimulo_ocp | null;
}

export interface MusicSession extends sessao {
    trials: MusicTrial[];
}