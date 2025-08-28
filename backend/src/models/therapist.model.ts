import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import type { terapeuta } from '@prisma/client';

// Isso aqui é o modelo de dados do terapeuta
export interface TherapistCreateData {
    nome: string;
    cpf: string;
    data_nascimento: Date;
    telefone?: string;
    celular: string;
    foto_perfil?: string;
    email: string;
    email_indigo: string;
    possui_veiculo: "sim" | "nao";
    placa_veiculo?: string;
    modelo_veiculo?: string;
    banco: string;
    agencia: string;
    conta: string;
    chave_pix: string;
    cep_endereco: string;
    logradouro_endereco: string;
    numero_endereco: string;
    bairro_endereco: string;
    cidade_endereco: string;
    uf_endereco: string;
    complemento_endereco?: string;
    cnpj_empresa?: string;
    cep_empresa?: string;
    logradouro_empresa?: string;
    numero_empresa?: string;
    bairro_empresa?: string;
    cidade_empresa?: string;
    uf_empresa?: string;
    complemento_empresa?: string;
    data_entrada: Date;
    perfil_acesso: string;
}

export interface TherapistResponse extends Omit<terapeuta, 'senha' | 'token_redefinicao' | 'validade_token'> {}

function generateResetToken() {
    const token = uuidv4();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // Token válido por 24 horas
    return { token, expiry };
}

export async function saveTherapist(data: TherapistCreateData): Promise<terapeuta> {
    const id = uuidv4();
    const { token, expiry } = generateResetToken();

    try {
        const therapist = await prisma.terapeuta.create({
            data: {
                id,
                nome: data.nome,
                cpf: data.cpf,
                data_nascimento: data.data_nascimento,
                telefone: data.telefone || null,
                celular: data.celular,
                foto_perfil: data.foto_perfil || null,
                email: data.email,
                email_indigo: data.email_indigo,
                possui_veiculo: data.possui_veiculo,
                placa_veiculo: data.placa_veiculo || null,
                modelo_veiculo: data.modelo_veiculo || null,
                banco: data.banco,
                agencia: data.agencia,
                conta: data.conta,
                chave_pix: data.chave_pix,
                cep_endereco: data.cep_endereco,
                logradouro_endereco: data.logradouro_endereco,
                numero_endereco: data.numero_endereco,
                bairro_endereco: data.bairro_endereco,
                cidade_endereco: data.cidade_endereco,
                uf_endereco: data.uf_endereco,
                complemento_endereco: data.complemento_endereco || null,
                cnpj_empresa: data.cnpj_empresa || null,
                cep_empresa: data.cep_empresa || null,
                logradouro_empresa: data.logradouro_empresa || null,
                numero_empresa: data.numero_empresa || null,
                bairro_empresa: data.bairro_empresa || null,
                cidade_empresa: data.cidade_empresa || null,
                uf_empresa: data.uf_empresa || null,
                complemento_empresa: data.complemento_empresa || null,
                data_entrada: data.data_entrada,
                data_saida: null,
                perfil_acesso: data.perfil_acesso,
                atividade: 'ativo',
                token_redefinicao: token,
                validade_token: expiry,
            }
        });

        return therapist;
    } catch (error: any) {
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'campo';
            throw new Error(`${field} já está em uso.`);
        }
        throw error;
    }
}

export async function findTherapistById(id: string) {
    const therapist = await prisma.terapeuta.findUnique({
        where: { id },
        select: {
            id: true,
            nome: true,
            cpf: true,
            data_nascimento: true,
            telefone: true,
            celular: true,
            foto_perfil: true,
            email: true,
            email_indigo: true,
            possui_veiculo: true,
            placa_veiculo: true,
            modelo_veiculo: true,
            banco: true,
            agencia: true,
            conta: true,
            chave_pix: true,
            cep_endereco: true,
            logradouro_endereco: true,
            numero_endereco: true,
            bairro_endereco: true,
            cidade_endereco: true,
            uf_endereco: true,
            complemento_endereco: true,
            cnpj_empresa: true,
            cep_empresa: true,
            logradouro_empresa: true,
            numero_empresa: true,
            bairro_empresa: true,
            cidade_empresa: true,
            uf_empresa: true,
            complemento_empresa: true,
            data_entrada: true,
            data_saida: true,
            perfil_acesso: true,
            atividade: true,
        }
    });

    return therapist;
}

export async function getTherapistsList(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search ? {
        OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search } },
        ]
    } : {};

    const [therapists, total] = await Promise.all([
        prisma.terapeuta.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                nome: true,
                email: true,
                celular: true,
                atividade: true,
                data_entrada: true,
                perfil_acesso: true,
            }, 
            orderBy: { 
                data_entrada: 'desc' 
            }
        }),
        prisma.terapeuta.count({ where })
    ]);

    return {
        therapists,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function updateTherapist(id: string, data: Partial<TherapistCreateData>) {
    try {
        return await prisma.terapeuta.update({
            where: { id },
            data
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'campo';
            throw new Error(`${field} já está em uso.`);
        }
        if (error.code === 'P2025') {
            throw new Error('Terapeuta não encontrado.');

        }
        throw error;
    }
}

export async function deleteTherapist(id: string) {
    try {
        return await prisma.terapeuta.update({
            where: { id },
            data: { 
                atividade: 'inativo', 
                data_saida: new Date() 
            }
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error('Terapeuta não encontrado.');
        }
        throw error;
    }
}

export async function getTherapistsStatistics() {
    const [total, active, inactive, thisMonth] = await Promise.all([
        prisma.terapeuta.count(),
        prisma.terapeuta.count({ where: { atividade: 'ativo' } }),
        prisma.terapeuta.count({ where: { atividade: 'inativo' } }),
        prisma.terapeuta.count({
            where: {
                data_entrada: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        })
    ]);

    return {
        total,
        active,
        inactive,
        thisMonth,
        activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
}