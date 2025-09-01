import type { NextFunction, Request, Response } from 'express';
import { findUserByResetToken, newPassword, loginUserByAccessInformation } from '../models/auth.model.js';
import { comparePassword } from '../utils/hash.util.js';
import { error } from 'console';

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

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function definePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        await newPassword(token!, password, 'terapeuta');
        res.status(200).json({ success: true, message: "Senha definida com sucesso" });
    } catch (error) {
        next(error);
    }
}

export async function validateLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { accessInfo, password } = req.body;
        const user = await loginUserByAccessInformation(accessInfo, 'terapeuta');

        if(!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
        
        const isValid = await comparePassword(password, user!.senha!);

        if (isValid) {
            return res.status(200).json({ success: true, message: 'Login realizado com sucesso' });
        } else {
            return res.status(401).json({ success: false, error: 'Senha incorreta' });
        }
    } catch (error) {
        next(error);
    }
}