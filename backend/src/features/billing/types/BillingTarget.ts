export type BillingTarget =
    | { sessionId: number; evolutionId?: never }
    | { evolutionId: number; sessionId?: never };