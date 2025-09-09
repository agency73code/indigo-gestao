/*

Valida dados automaticamente antes da rota
Reutilizável em múltiplas rotas
Padroniza validação em toda aplicação

*/

import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: error,
                });
            } else if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: error.message,
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: String(error),
                });
            }
        }
    };
};

export function validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedParams = schema.parse(req.params);
            Object.assign(req.params, validatedParams);
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Parâmetros inválidos',
                    details: error,
                });
            } else if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: 'Parâmetros inválidos',
                    details: error.message,
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Parâmetros inválidos',
                    details: String(error),
                });
            }
        }
    };
}

export function validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedQuery = schema.parse(req.query);
            Object.assign(req.query, validatedQuery);
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Query inválida',
                    details: error,
                });
            } else if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    error: 'Query inválida',
                    details: error.message,
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Query inválida',
                    details: String(error),
                });
            }
        }
    };
}
