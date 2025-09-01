import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js'
import { findUserByResetToken, newPassword, loginUserByAccessInformation } from '../models/auth.model.js';
import { comparePassword } from '../utils/hash.util.js';
import jwt from 'jsonwebtoken';

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

        return res.status(200).json({
                success: true,
                message: 'Token validado com sucesso!',
            });
    } catch (error) {
        next(error);
    }
}

export async function definePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        await newPassword(token!, password, 'terapeuta');
        res.status(200).json({ success: true, message: "Senha definida com sucesso" }); //K4$eJ#8dGpL1M
    } catch (error) {
        next(error);
    }
}

export async function validateLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { accessInfo, password } = req.body;

        const user = await loginUserByAccessInformation(accessInfo, 'terapeuta');
        if(!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        
        const isValid = await comparePassword(password, user!.senha!);
        if (!isValid) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        const token = jwt.sign(
            { sub: user.id, role: 'terapeuta' },
            env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // res.cookie('token', token, { 
        //     httpOnly: true, 
        //     sameSite: 'lax', 
        //     secure: env.NODE_ENV === 'production', 
        //     maxAge: 86_400_00 
        // });

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            user: { id: user.id, name: user.nome, email: user.email }
        });
    } catch (error) {
        next(error);
    }
}