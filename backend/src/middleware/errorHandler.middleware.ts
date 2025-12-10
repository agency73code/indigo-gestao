import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', error); // Log detalhado do erro para debugging

    if (error instanceof ZodError) {
        const formatted = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: 'VALIDATION_ERROR',
            message: issue.message,
        }));

        return res.status(422).json({
            success: false,
            code: 'VALIDATION_ERROR',
            errors: formatted,
        });
    }

    if (error instanceof AppError) {
        return res.status(error.status).json({
            success: false,
            code: error.code,
            message: error.message,
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
