import type { NextFunction, Request, Response } from 'express';
import { findUserByResetToken, newPassword } from '../models/auth.model.js';

export async function validateToken(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token é obrigatório',
            });
        }

        const user = await findUserByResetToken(token, 'terapeuta');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado, entre em contato com a administração',
            });
        }

        res.json({
            success: true,
            message: 'Usuário encontrado',
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

export async function definePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        const user = await newPassword(token!, password, 'terapeuta');

        res.status(200).json({
            success: true,
            message: 'Senha definida com sucesso!',
        });
    } catch (error) {
        next(error);
    }
}