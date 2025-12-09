import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type JwtPayload = { sub: string; perfil_acesso?: string; iat?: number; exp?: number };

export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    const [scheme, bearerToken] = header.split(' ');

    const cookieToken = req.cookies?.token as string | undefined;

    let token: string | undefined;
    if (scheme === 'Bearer' && bearerToken) {
        token = bearerToken;
    } else if (cookieToken) {
        token = cookieToken;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Missing authentication token' });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        const baseUser = { id: decoded.sub } as Express.UserPayload;
        if (decoded.perfil_acesso) baseUser.perfil_acesso = decoded.perfil_acesso;
        req.user = baseUser;

        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
    }
}
