import z from 'zod';
import { cpf, cnpj } from 'cpf-cnpj-validator';
const personalSchema = z.object({
    nome: z.string().min(10).max(255),
    cpf: z.string().refine((val) => cpf.isValid(val), { message: 'CPF inválido' }),
    data_nascimento: z.string().transform((val) => new Date(val)),
    telefone: z.string().length(11).default(""),
    celular: z.string().length(11),
    foto_perfil: z.string().url().default(""),
    email: z.string().email(),
    email_indigo: z.string().email(),
    possui_veiculo: z.enum(['sim', 'nao']),
    placa_veiculo: z.string().max(20).default(""),
    modelo_veiculo: z.string().max(50).default(""),
});
const bankSchema = z.object({
    banco: z.string().max(50),
    agencia: z.string().max(20),
    conta: z.string().max(50),
    chave_pix: z.string().max(255),
});
const addressSchema = z.object({
    cep_endereco: z.string().length(8),
    logradouro_endereco: z.string().max(255),
    numero_endereco: z.string().max(10),
    bairro_endereco: z.string().max(100),
    cidade_endereco: z.string().max(100),
    uf_endereco: z.string().length(2),
    complemento_endereco: z.string().max(100).default(""),
});
const companySchema = z.object({
    cnpj_empresa: z.string().refine((val) => cnpj.isValid(val), { message: 'CNPJ inválido' }).default(""),
    cep_empresa: z.string().length(8).default(""),
    logradouro_empresa: z.string().max(255).default(""),
    numero_empresa: z.string().max(10).default(""),
    bairro_empresa: z.string().max(100).default(""),
    cidade_empresa: z.string().max(100).default(""),
    uf_empresa: z.string().length(2).default(""),
    complemento_empresa: z.string().max(100).default(""),
});
const jobSchema = z.object({
    data_entrada: z.string().transform((val) => new Date(val)),
    perfil_acesso: z.string().max(20),
});
const baseSchema = personalSchema
    .merge(bankSchema)
    .merge(addressSchema)
    .merge(companySchema)
    .merge(jobSchema);
export const therapistSchema = baseSchema;
//# sourceMappingURL=therapist.schema.js.map