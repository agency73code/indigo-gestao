import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function baseUrl() {
  if (env.NODE_ENV === 'production') return 'https://gestao.indigoinstituto.com.br';
  return env.FRONTEND_URL || 'http://localhost:5173';
}

function buildResetUrl(token: string) {
  return new URL(`/reset-password?token=${token}`, baseUrl()).toString();
}

export async function sendWelcomeEmail({
    to,
    name,
    token,
}: {
    to: string;
    name: string;
    token: string;
}) {
    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

    const resetUrl = buildResetUrl(token);

    const mailOptions = {
        from: `"Indigo Gestão" <${env.SMTP_USER}>`,
        to,
        subject: 'Bem-vindo à Indigo Gestão! Configure sua senha',
        text: `Defina sua senha: ${resetUrl}\nSe não foi você, ignore este e-mail.`,
        html: `
            <h2>Bem-vindo, ${name}!</h2>
            <p>Você foi cadastrado no sistema. Para definir sua senha, clique no link abaixo:</p>
            <a href="${resetUrl}">Redefinir minha senha</a>
            <p>O link expira em 24 horas.</p>
            <p>Equipe Indigo Gestão</p>
        `,
    };

    try {
        console.log(`Enviando e-mail para ${to}`);
        return transporter.sendMail(mailOptions);
    } catch (err: any) {
        console.error('Erro ao enviar e-mail:', err.message);
    }
}

export async function sendPasswordResetEmail({ to, name, token, }: { to: string, name: string, token: string }) {
    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

    const resetUrl = buildResetUrl(token);

    const mailOptions = {
        from: `"Indigo Gestão" <${env.SMTP_USER}>`,
        to,
        subject: 'Redefinição de senha',
        text: `Defina sua senha: ${resetUrl}\nSe não foi você, ignore este e-mail.`,
        html: `
        <p>Olá, ${name ?? 'usuário(a)'}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Para continuar, clique no link abaixo:</p>
        <a href="${resetUrl}">Redefinir minha senha</a>
        <p>Este link expira em <strong>60 minutos</strong>. Se você não fez esta solicitação, ignore este e-mail.</p>
        <p>Equipe Indigo Gestão</p>`,
    };

    try {
        console.log(`Enviando e-mail de reset para ${to}`);
        return transporter.sendMail(mailOptions);
    } catch (err: any) {
        console.error('erro ao enviar e-mail de reset:', err.message);
    }
}
