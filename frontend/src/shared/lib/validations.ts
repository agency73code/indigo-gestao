import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

export const signUpSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome não pode ter mais de 50 caracteres'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Nova senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Validações para cliente
import * as mask from '@/common/utils/mask';

export const cuidadorSchema = z.object({
  relacao: z.string().min(1, 'Relação é obrigatória'),
  descricaoRelacao: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório').refine(mask.isValidCPF, 'CPF inválido'),
  dataNascimento: z.string().optional(),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').refine(mask.isValidEmail, 'E-mail inválido'),
  profissao: z.string().optional(),
  escolaridade: z.string().optional(),
});

export const enderecoSchema = z.object({
  residenciaDe: z.string().min(1, 'Residência de é obrigatório'),
  outroResidencia: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
});

export const contatoEscolaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().optional().refine((val) => !val || mask.isValidEmail(val), 'E-mail inválido'),
  funcao: z.string().min(1, 'Função é obrigatória'),
});

export const dadosEscolaSchema = z.object({
  tipoEscola: z.string().min(1, 'Tipo de escola é obrigatório'),
  nome: z.string().min(1, 'Nome da escola é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().optional().refine((val) => !val || mask.isValidEmail(val), 'E-mail inválido'),
  contatos: z.array(contatoEscolaSchema).optional(),
});

export const dadosPagamentoSchema = z.object({
  sistemaPagamento: z.string().min(1, 'Sistema de pagamento é obrigatório'),
  houveNegociacao: z.string().optional(),
  valorAcordado: z.string().optional(),
});

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  emailContato: z.string().min(1, 'E-mail de contato é obrigatório').refine(mask.isValidEmail, 'E-mail inválido'),
  dataEntrada: z.string().min(1, 'Data de entrada é obrigatória'),
  dataSaida: z.string().optional(),
  cuidadores: z.array(cuidadorSchema).min(1, 'Pelo menos um cuidador é obrigatório'),
  enderecos: z.array(enderecoSchema).min(1, 'Pelo menos um endereço é obrigatório'),
  dadosPagamento: dadosPagamentoSchema,
  dadosEscola: dadosEscolaSchema,
});
