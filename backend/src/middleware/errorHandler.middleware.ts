/*

Captura todos os erros da aplicação
Padroniza respostas de erro
Evita crashes do servidor
Logs organizados para debugging

*/

import { Prisma } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error); // Log detalhado do erro para debugging

    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: error.issues,
        });
    }

    if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientValidationError ||
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
    ) {
        return res.status(500).json({
            success: false,
            error: 'Database Error',
            message: 'Internal server error',
            code: 'PRISMA_ERROR',
        });
    }

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
    });
};
