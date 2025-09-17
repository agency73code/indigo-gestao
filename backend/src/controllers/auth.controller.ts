import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js'
import { comparePassword } from '../utils/hash.util.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '../utils/mail.util.js';
import { normalizeAccessInfo } from '../utils/normalize.util.js';
import {
    findUserById, 
    findUserByEmail, 
    findUserByResetToken, 
    loginUserByAccessInformation, 
    newPassword, 
    passwordResetToken
} from '../features/auth/auth.repository.js';

const RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000;

export async function me(req: Request, res: Response) {
    const userCtx = req.user;
    if (!userCtx) {
        return res.status(401).json({ success: false, message: 'Não autenticado' })
    }

    const user = 
        await findUserById(userCtx.id, 'terapeuta') ??
        await findUserById(userCtx.id, 'cliente');

    if(!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    return res.json({
        success: true,
        user: {
            id: user.id,
            name: user.nome,
            email: user.email,
            perfil_acesso: user.perfil_acesso,
        },
    });
}

export async function logout(req: Request, res: Response) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
    });

    return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
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

        const user = 
            await findUserByResetToken(token, 'terapeuta') ??
            await findUserByResetToken(token, 'cliente');

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

        let result =  await newPassword(token!, password, 'terapeuta');
        if (result.count === 0) {
            result = await newPassword(token!, password, 'cliente');
        }
            

        if (!result || result.count === 0) {
            return res.status(404).json({ success: false, message: 'Token não encontrado ou expirado' });
        }

        return res.status(200).json({ success: true, message: "Senha definida com sucesso" });
    } catch (error) {
        next(error);
    }
}

export async function validateLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { accessInfo, password } = req.body;
        const normalized = normalizeAccessInfo(accessInfo);

        const user = 
            await loginUserByAccessInformation(normalized, 'terapeuta') ??
            await loginUserByAccessInformation(normalized, 'cliente');

        if (!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        if (!user.senha) return res.status(400).json({ seccess: false, message: 'Você não possui uma senha cadastrada.' });
        
        const ok = await comparePassword(password, user.senha!);
        if (!ok) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

        const token = jwt.sign(
            { sub: user.id, perfil_acesso: user.perfil_acesso },
            env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            sameSite: 'lax', 
            secure: env.NODE_ENV === 'production', 
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: { id: user.id, name: user.nome, email: user.email, perfil_acesso: user.perfil_acesso }
        });
    } catch (error) {
        next(error);
    }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body as { email: string };

        const user = 
            await findUserByEmail(email, 'terapeuta') ?? 
            await findUserByEmail(email, 'cliente');

        if (!user) {
            return res.status(200).json({ success: true, message: 'Se o e-mail existir, enviaremos as instruções de recuperação.' });
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS);

        await passwordResetToken(user.id, token, expiresAt, user.table);

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