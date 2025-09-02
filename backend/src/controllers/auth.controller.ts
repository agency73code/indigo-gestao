import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js'
import { findUserByResetToken, newPassword, loginUserByAccessInformation, findUserByEmail, passwordResetToken } from '../models/auth.model.js';
import { comparePassword } from '../utils/hash.util.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '../utils/mail.util.js';
import { normalizeAccessInfo } from '../utils/normalize.util.js';

const RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000;

export async function me(req: Request, res: Response, next: NextFunction) {
    const userCtx = req.user;
    if (!userCtx) {
        return res.status(401).json({ success: false, message: 'Não autenticado' })
    }

    const user = await prisma.terapeuta.findUnique({
        where: { id: userCtx.id as string },
        select: { id: true, nome: true, email_indigo: true, email: true },
    });

    if(!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    return res.json({
        success: true,
        user: {
            id: user.id,
            name: user.nome,
            email: user.email_indigo ?? user.email ?? null
        },
    });
}

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
        const user = await loginUserByAccessInformation(normalizeAccessInfo(accessInfo), 'terapeuta');
        if(!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        
        const ok = await comparePassword(password, user.senha!);
        if (!ok) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

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
            token,
            user: { id: user.id, name: user.nome, email: user.email }
        });
    } catch (error) {
        next(error);
    }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body as { email: string };

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Se o e-mail existir, enviaremos as instruções de recuperação.',
            });
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS);

        await passwordResetToken(user.id, token, expiresAt);

        await sendPasswordResetEmail({
            to: user.email,
            name: user.nome,
            token,
        });

        return res.status(200).json({
            success: true,
            message: 'Se o e-mail existir, enviaremos as instruções de recuperação.'
        });
    } catch (error) {
        next(error);
    }
}