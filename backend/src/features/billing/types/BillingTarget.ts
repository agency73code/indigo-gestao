export type BillingTarget =
    | { sessionId: number; evolutionId?: never; ataId?: never }
    | { evolutionId: number; sessionId?: never; ataId?: never }
    | { ataId: number; evolutionId?: never; sessionId?: never };