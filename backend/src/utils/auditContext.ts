import { AsyncLocalStorage } from "async_hooks";
import type { NextFunction, Request, Response } from "express";
import { unauthenticated } from "../errors/unauthenticated.js";

type AuditContext = { usuarioId: string };

export const auditStorage = new AsyncLocalStorage<AuditContext>();

export function getAuditUserId(): string | undefined {
    return auditStorage.getStore()?.usuarioId
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    if (!userId) throw unauthenticated();

    auditStorage.run({ usuarioId: userId }, next)
}