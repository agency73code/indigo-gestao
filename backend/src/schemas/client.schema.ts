import { z } from 'zod';

const addressSchema = z.object({
    cep: z.string().length(8),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string().length(2),
});

const schoolAddressSchema = z.object({
    cep: z.string().length(8).optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().length(2).optional(),
});

const schoolSchema = z.object({
  tipoEscola: z.enum(['particular', 'publica']),
  nome: z.string(),
  telefone: z.string(),
  email: z.string().email().optional(),
  endereco: schoolAddressSchema.optional(),
});

const pagamentoSchema = z.object({
  nomeTitular: z.string(),
  numeroCarteirinha: z.string().optional(),
  telefone1: z.string(),
  mostrarTelefone2: z.boolean().optional(),
  telefone2: z.string().optional(),
  mostrarTelefone3: z.boolean().optional(),
  telefone3: z.string().optional(),
  email1: z.string().email(),
  mostrarEmail2: z.boolean().optional(),
  email2: z.string().email().optional(),
  mostrarEmail3: z.boolean().optional(),
  email3: z.string().email().optional(),
  sistemaPagamento: z.enum(['reembolso', 'liminar', 'particular']),
  prazoReembolso: z.string().optional(),
  numeroProcesso: z.string().optional(),
  nomeAdvogado: z.string().optional(),
  telefoneAdvogado1: z.string().optional(),
  mostrarTelefoneAdvogado2: z.boolean().optional(),
  telefoneAdvogado2: z.string().optional(),
  mostrarTelefoneAdvogado3: z.boolean().optional(),
  telefoneAdvogado3: z.string().optional(),
  emailAdvogado1: z.string().email().optional(),
  mostrarEmailAdvogado2: z.boolean().optional(),
  emailAdvogado2: z.string().email().optional(),
  mostrarEmailAdvogado3: z.boolean().optional(),
  emailAdvogado3: z.string().email().optional(),
  houveNegociacao: z.enum(['sim', 'nao']).optional(),
  valorSessao: z.string().optional(),
});

export const clientSchema = z.object({
  nome: z.string(),
  dataNascimento: z.string(),
  nomeMae: z.string(),
  cpfMae: z.string(),
  nomePai: z.string().optional(),
  cpfPai: z.string().optional(),
  telefonePai: z.string().optional(),
  emailContato: z.string().email(),
  dataEntrada: z.string(),
  dataSaida: z.string().optional(),
  maisDeUmPai: z.enum(['sim', 'nao']),
  nomePai2: z.string().optional(),
  cpfPai2: z.string().optional(),
  telefonePai2: z.string().optional(),
  enderecos: z.array(addressSchema),
  maisDeUmEndereco: z.enum(['sim', 'nao']),
  dadosEscola: schoolSchema.optional(),
  dadosPagamento: pagamentoSchema.optional(),
});

export type ClientSchema = z.infer<typeof clientSchema>;