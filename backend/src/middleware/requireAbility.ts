import type { RequestHandler } from 'express';
import { defineAbilityFor, type Actions, type Subjects } from '../abilities/defineAbility.js';
import type { AuthenticatedRequest } from '../types/authenticatedRequest.js';

export function requireAbility(action: Actions, subject: Subjects): RequestHandler {
    return (req, res, next) => {
        const authReq = req as AuthenticatedRequest;

        if (!authReq.user) {
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        }

        const ability = defineAbilityFor(authReq.user.perfil_acesso);

        if (!ability.can(action, subject)) {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }

        next();
    };
}
