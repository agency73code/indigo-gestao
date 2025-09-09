import z from 'zod';
import { cpf, cnpj } from 'cpf-cnpj-validator';

// helpers
const coerceDate = z.preprocess((v) => (typeof v === 'string' || v instanceof Date ? new Date(v) : v), z.date());
const cpfField = z.string().refine((val) => cpf.isValid(val), { message: 'CPF inválido' });
const cnpjOptionalField = z.string().refine((val) => cnpj.isValid(val), { message: 'CNPJ inválido' });
const phone11orLess = z.string().length(11, 'Telefone/Celular deve ter 11 dígitos');
const emailField = z.string().email();

// --- Schemas de blocos ---
const personalSchema = z.object({
  nome: z.string().min(3).max(255),
  cpf: cpfField,
  data_nascimento: coerceDate,
  telefone: phone11orLess.optional(),
  celular: phone11orLess,
  foto_perfil: z.string().url().optional(),
  email: emailField,
  email_indigo: emailField,
  possui_veiculo: z.enum(['sim', 'nao']),
  placa_veiculo: z.string().max(20).optional(),
  modelo_veiculo: z.string().max(50).optional(),
});

const bankSchema = z.object({
  banco: z.string().max(50),
  agencia: z.string().max(20),
  conta: z.string().max(50),
  chave_pix: z.string().max(255).optional(),
});

const addressItemSchema = z.object({
  cep: z.string().length(8),
  logradouro: z.string().max(255),
  numero: z.string().max(10),
  bairro: z.string().max(100),
  cidade: z.string().max(100),
  uf: z.string().toUpperCase().length(2),
  complemento: z.string().max(100).optional(),
  tipo_endereco_id: z.number().int().positive(),
  principal: z.number().default(1),
});

const cnpjAddressSchema = z.object({
  cep: z.string().length(8),
  rua: z.string().max(255),
  numero: z.string().max(10),
  bairro: z.string().max(100),
  cidade: z.string().max(100),
  estado: z.string().toUpperCase().length(2),
  complemento: z.string().max(100).optional(),
});

const companySchema = z.object({
  cnpj: z
    .object({
      numero: cnpjOptionalField,
      razaoSocial: z.string().max(255),
      nomeFantasia: z.string().max(255),
      endereco: cnpjAddressSchema,
    })
    .optional(),
});

const jobSchema = z.object({
  data_entrada: coerceDate,
  perfil_acesso: z.string().max(20),
});

const relationsSchema = z.object({
  enderecos: z.array(addressItemSchema).min(1, 'Informe pelo menos um endereço').optional(),
  areas_atuacao: z.number().optional(),
  cargos: z
    .array(
      z.object({
        cargo_id: z.number().int().positive(),
        numero_conselho: z.string().max(50).optional(),
        data_entrada: coerceDate,
      }),
    )
    .optional(),
});

export const therapistSchema = personalSchema
  .merge(bankSchema)
  .merge(companySchema)
  .merge(jobSchema)
  .merge(relationsSchema);

export const therapistIdSchema = z.object({
  id: z.string().uuid({ message: 'ID deve ser um UUID válido' }),
});

export const therapistUpdateSchema = therapistSchema.partial();