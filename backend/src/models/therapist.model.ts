import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/db.util.js';

// Isso aqui é o modelo de dados do terapeuta
export interface TherapistData {
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
    data_saida?: Date;
    perfil_acesso: string;
    atividade?: "ativo" | "inativo";
    senha?: string;
    token_redefinicao?: string;
    validade_token?: Date;
}


export async function saveTherapist(data: TherapistData) {
    const id = uuidv4();
    const token = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 1); // Token válido por 24 horas
    
    const created = await prisma.terapeuta.create({
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
            data_saida: data.data_saida || null,
            perfil_acesso: data.perfil_acesso,
            atividade: data.atividade || 'ativo',
            token_redefinicao: token,
            validade_token: tokenExpiry,
        }
    });

    return created;
}