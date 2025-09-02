import nodemailer from 'nodemailer';

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
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const FRONTEND_URL = process.env.FRONTEND_URL;
    const mailOptions = {
        from: `"Indigo Gestão" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Bem-vindo à Indigo Gestão! Configure sua senha',
        html: `
            <h2>Bem-vindo, ${name}!</h2>
            <p>Você foi cadastrado no sistema. Para definir sua senha, clique no link abaixo:</p>
            <a href="${FRONTEND_URL}/reset-password?token=${token}">Configurar minha senha</a>
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
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    
    const FRONTEND_URL = process.env.FRONTEND_URL;

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject: 'Redefinição de senha',
        html: `
        <p>Olá, ${name ?? 'usuário(a)'}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Para continuar, clique no link abaixo:</p>
        <a href="${FRONTEND_URL}/reset-password?token=${token}">Redefinir minha senha</a>
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
