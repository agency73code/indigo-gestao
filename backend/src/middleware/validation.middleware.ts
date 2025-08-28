/*

Valida dados automaticamente antes da rota
Reutilizável em múltiplas rotas
Padroniza validação em toda aplicação

*/

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({
                error: 'Dados inválidos',
                details: error.errors || error.message
            });
        }
    };
};

export function validateParams(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedParams = schema.parse(req.params);
            Object.assign(req.params, validatedParams);
            next();
        } catch (error: any) {
            res.status(400).json({
                error: 'Parâmetros inválidos',
                details: error.errors || error.message
            });
        }
    };
}

export function validateQuery(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedQuery = schema.parse(req.query);
            Object.assign(req.query, validatedQuery);
            next();
        } catch (error: any) {
            res.status(400).json({
                error: 'Query inválida',
                details: error.errors || error.message
            });
        }
    };
}