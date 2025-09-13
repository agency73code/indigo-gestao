import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string
        email: string
        nome: string
        perfil_acesso?: string
    }
}