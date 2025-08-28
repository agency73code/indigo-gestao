/*

Captura todos os erros da aplicação
Padroniza respostas de erro
Evita crashes do servidor
Logs organizados para debugging

*/

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error); // Log detalhado do erro para debugging

    if (error instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.issues
        });
    }

    if (error.message.includes('Prisma')) {
        return res.status(500).json({
            error: 'Database Error',
            message: 'Internal server error'
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
    });
}