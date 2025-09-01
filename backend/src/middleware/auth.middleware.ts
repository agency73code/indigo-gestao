/*

Este middleware:
lê Authorization: Bearer <token>;
valida com env.JWT_SECRET;
coloca req.user = { id, role };
retorna 401 se faltar/invalidar.

*/

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type JwtPayload = { sub: string; role?: string; iat?: number; exp?: number };

export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' })
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        const baseUser = { id: decoded.sub } as Express.UserPayload;
        if (decoded.role) baseUser.role = decoded.role;
        req.user = baseUser;

        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado' })
    }
}