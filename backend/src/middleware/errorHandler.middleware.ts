import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        }));

        console.error('ZodError:', {
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.id,
            errors,
        })

        return res.status(422).json({
            success: false,
            message: error.issues[0]?.message,
            errors,
        });
    }

    if (error instanceof AppError) {
        return res.status(error.status).json({
            success: false,
            code: error.code,
            message: error.message,
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            const targetStr =
                Array.isArray(target) ? target.join(',') : typeof target === 'string' ? target : '';

            // TERAPEUTA
            if (targetStr.includes('terapeuta_email_key')) {
                return res.status(409).json({
                    success: false,
                    code: 'THERAPIST_EMAIL_ALREADY_EXISTS',
                    message: 'Já existe um terapeuta cadastrado com este email.',
                });
            }

            if (targetStr.includes('terapeuta_cpf_key')) {
                return res.status(409).json({
                    success: false,
                    code: 'THERAPIST_CPF_ALREADY_EXISTS',
                    message: 'Já existe um terapeuta cadastrado com este CPF.',
                });
            }

            // CLIENTE
            if (targetStr.includes('cliente_emailContato_key')) {
                return res.status(409).json({
                success: false,
                code: 'CLIENT_EMAIL_ALREADY_EXISTS',
                message: 'Já existe um cliente cadastrado com este email.',
                });
            }

            if (targetStr.includes('cliente_cpf_key')) {
                return res.status(409).json({
                success: false,
                code: 'CLIENT_CPF_ALREADY_EXISTS',
                message: 'Já existe um cliente cadastrado com este CPF.',
                });
            }

            return res.status(409).json({
                success: false,
                code: 'UNIQUE_CONSTRAINT_FAILED',
                message: 'Já existe um registro com estes dados.',
            });
        }

        return res.status(500).json({
            success: false,
            code: 'PRISMA_KNOWN_ERROR',
            message: 'Database error',
        });
    }

    if (
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
