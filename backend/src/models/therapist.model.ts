import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import type { terapeuta } from '@prisma/client';

export interface TherapistResponse
    extends Omit<terapeuta, 'senha' | 'token_redefinicao' | 'validade_token'> {}

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
        const therapist = await prisma.$transaction(async (tx) => {
            const newTherapist = await tx.terapeuta.create({
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
                    chave_pix: data.chave_pix || null,
                    cnpj_empresa: data.cnpj_empresa || null,
                    data_entrada: data.data_entrada,
                    data_saida: null,
                    perfil_acesso: data.perfil_acesso,
                    atividade: 'ativo',
                    senha: null,
                    token_redefinicao: token,
                    validade_token: expiry,
                },
            });
        
            if (data.enderecos && data.enderecos.length > 0) {
                for (const enderecoData of data.enderecos) {
                    const endereco = await tx.endereco.create({
                        data: {
                            cep: enderecoData.cep,
                            logradouro: enderecoData.logradouro,
                            numero: enderecoData.numero,
                            bairro: enderecoData.bairro,
                            cidade: enderecoData.cidade,
                            uf: enderecoData.uf,
                            complemento: enderecoData.complemento || null,
                        },
                    });

                    await tx.terapeuta_endereco.create({
                        data: {
                            terapeuta_id: id,
                            endereco_id: endereco.id,
                            tipo_endereco_id: enderecoData.tipo_endereco_id,
                            principal: enderecoData.principal || 0
                        },
                    });
                }
            }

            if (data.areas_atuacao && data.areas_atuacao.length > 0) {
                await tx.terapeuta_area_atuacao.createMany({
                    data: data.areas_atuacao.map(areaId => ({
                        terapeuta_id: id,
                        area_atuacao_id: areaId,
                    })),
                });
            }

            if (data.cargos && data.cargos.length > 0) {
                await tx.terapeuta_cargo.createMany({
                    data: data.cargos.map(cargo => ({
                        terapeuta_id: id,
                        cargo_id: cargo.cargo_id,
                        numero_conselho: cargo.numero_conselho || null,
                        data_entrada: cargo.data_entrada,
                        data_saida: null,
                    })),
                });
            }

            return newTherapist;            
        });

        return therapist;
    } catch (error: any) {
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'campo';
            const fieldMap: Record<string, string> = {
                'cpf': 'CPF',
                'email': 'Email',
                'email_indigo': 'Email Indigo',
                'cnpj_empresa': 'CNPJ da empresa',
            };
            const friendlyField = fieldMap[field] || field;
            throw new Error(`${friendlyField} já está em uso.`);
        }
        throw error;
    }
}

export interface TherapistCreateData {
    // Dados pessoais básicos
    nome: string;
    cpf: string;
    data_nascimento: string;
    telefone?: string;
    celular: string;
    foto_perfil?: string;
    email: string;
    email_indigo: string;
    
    // Dados do veículo
    possui_veiculo: 'sim' | 'nao';
    placa_veiculo?: string;
    modelo_veiculo?: string;
    
    // Dados bancários
    banco: string;
    agencia: string;
    conta: string;
    chave_pix?: string;
    
    // Dados da empresa (opcional)
    cnpj_empresa?: string;
    
    // Dados administrativos
    data_entrada: string;
    perfil_acesso: string;
    
    // Relacionamentos
    enderecos?: {
        cep: string;
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        uf: string;
        complemento?: string;
        tipo_endereco_id: number;
        principal?: number;
    }[];
    
    areas_atuacao?: number[]; // IDs das áreas de atuação
    
    cargos?: {
        cargo_id: number;
        numero_conselho?: string;
        data_entrada: Date;
    }[];
}