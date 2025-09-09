import type { Request, Response, NextFunction } from 'express';
import { normalizer } from '../features/therapist/therapist.normalizer.js';
import { createTherapistBase } from '../features/therapist/therapist.mapper.js';
import { prisma } from '../config/database.js';
import { sendWelcomeEmail } from '../utils/mail.util.js';

export async function listTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const therapist = await prisma.terapeuta.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                celular: true,
                foto_perfil: true,
                atividade: true,
                cnpj_empresa: true,
                terapeuta_area_atuacao: {
                    select: {
                        area_atuacao: {
                            select: { nome: true },
                        },
                    },
                },
                terapeuta_cargo: {
                    select: {
                        cargo: { select: { nome: true } },
                        numero_conselho: true,
                    },
                },
            },
        });

        const formatted = therapist.map((t) => ({
            id: t.id,
            nome: t.nome,
            email: t.email ?? undefined,
            telefone: t.telefone ?? t.celular ?? undefined,
            status: t.atividade === 'ativo' ? 'ATIVO' : 'INATIVO',
            especialidade: t.terapeuta_area_atuacao[0]?.area_atuacao.nome,
            conselho: t.terapeuta_cargo[0]?.numero_conselho ?? undefined,
            avatarUrl: t.foto_perfil ?? undefined,
            cnpj: t.cnpj_empresa ?? undefined,
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        next(error);
    }
}

export async function createTherapist(req: Request, res: Response, next: NextFunction) {
    try {
        const normalized = await normalizer(req.body);
        const therapist = await createTherapistBase(prisma, normalized);
        
        await sendWelcomeEmail({
            to: therapist.email,
            name: therapist.nome,
            token: therapist.token_redefinicao!,
        }).catch((error) => {
            console.error('Erro ao enviar email de boas-vindas:', error);
        });

        res.status(201).json({
            success: true,
            message: 'Terapeuta cadastrado com sucesso!'
        });
    } catch (error) {
        next(error);
    }
}
