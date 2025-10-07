import { z } from 'zod';

import { cpf } from "cpf-cnpj-validator";

const strip = (val: string) => val.replace(/[^\dA-Za-z]/g, "");

export const ClientSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().transform(strip).refine((val) => cpf.isValid(val), { message: 'CPF inválido' }),
  dataNascimento: z.coerce.date(),
  emailContato: z.email({ message: 'E-mail inválido' }),
  dataEntrada: z.coerce.date(),
  dataSaida: z.coerce.date().optional().nullable().default(null),

  cuidadores: z.array(
    z.object({
      relacao: z.string().min(1, 'Relação é obrigatória'),
      descricaoRelacao: z.string().optional().nullable().default(null),
      nome: z.string().min(1, 'Nome é obrigatório'),
      cpf: z.string().transform(strip).refine((val) => cpf.isValid(val), { message: 'CPF inválido' }),
      profissao: z.string().optional().nullable().default(null),
      escolaridade: z.string().optional().nullable().default(null),
      telefone: z.string().transform(strip),
      email: z.email({ message: 'E-mail inválido' }),

      endereco: z.object({
        cep: z.string().transform(strip),
        logradouro: z.string().min(1, 'Rua é obrigatório'),
        numero: z.string().min(1, 'Numero é obrigatório'),
        bairro: z.string().min(1, 'Bairro é obrigatório'),
        cidade: z.string().min(1, 'Cidade é obrigatório'),
        uf: z.string().min(1, 'Estado é obrigatório'),
        complemento: z.string().optional().nullable().default(null),
      }),
    }),
  ).min(1, 'Deve haver pelo menos um cuidador'),

  enderecos: z.array(
    z.object({
      cep: z.string().transform(strip),
      logradouro: z.string().min(1, 'Rua é obrigatório'),
      numero: z.string().min(1, 'Numero é obrigatório'),
      bairro: z.string().min(1, 'Bairro é obrigatório'),
      cidade: z.string().min(1, 'Cidade é obrigatório'),
      uf: z.string().min(1, 'Estado é obrigatório'),
      complemento: z.string().optional().nullable().default(null),
      residenciaDe: z.string().optional().nullable().default(null),
      outroResidencia: z.string().optional().nullable().default(null),
    }),
  ).min(1, 'Deve haver pelo menos um endereço'),

  dadosPagamento: z.object({
    nomeTitular: z.string().min(1, 'Nome do titular é obrigatório'),
    numeroCarteirinha: z.string().transform(strip).optional().nullable().default(null),
    telefone1: z.string().transform(strip),
    telefone2: z.string().transform(strip).optional().nullable().default(null),
    telefone3: z.string().transform(strip).optional().nullable().default(null),
    email1: z.email({ message: 'E-mail de pagamento inválido' }),
    email2: z.email({ message: 'E-mail de pagamento 2 inválido' }).optional().nullable().default(null),
    email3: z.email({ message: 'E-mail de pagamento 3 inválido' }).optional().nullable().default(null),
    sistemaPagamento: z.enum(['reembolso', 'liminar', 'particular']),
    numeroProcesso: z.string().transform(strip).optional().nullable().default(null),
    nomeAdvogado: z.string().optional().nullable().default(null),
    telefoneAdvogado1: z.string().transform(strip).optional().nullable().default(null),
    telefoneAdvogado2: z.string().transform(strip).optional().nullable().default(null),
    telefoneAdvogado3: z.string().transform(strip).optional().nullable().default(null),
    emailAdvogado1: z.email({ message: 'E-mail do advogado inválido' }).optional().nullable().default(null),
    emailAdvogado2: z.email({ message: 'E-mail do advogado 2 inválido' }).optional().nullable().default(null),
    emailAdvogado3: z.email({ message: 'E-mail do advogado 3 inválido' }).optional().nullable().default(null),
    houveNegociacao: z.enum(['sim', 'nao']),
    valorAcordado: z.string().optional().nullable().default(null),
  }),

  dadosEscola: z.object({
    tipoEscola: z.enum(['particular', 'publica', 'afastado', 'clinica-escola']),
    nome: z.string().optional().nullable().default(null),
    telefone: z.string().transform(strip).optional().nullable().default(null),
    email: z.string().email({ message: 'E-mail da escola inválido' }).optional().nullable().default(null),
    endereco: z.object({
      cep: z.string().transform(strip),
      logradouro: z.string().min(1, 'Rua é obrigatório'),
      numero: z.string().min(1, 'Numero é obrigatório'),
      bairro: z.string().min(1, 'Bairro é obrigatório'),
      cidade: z.string().min(1, 'Cidade é obrigatório'),
      uf: z.string().min(1, 'Estado é obrigatório'),
      complemento: z.string().optional().nullable().default(null),
    }),

    contatos: z.array(
      z.object({
        nome: z.string().min(1, 'Nome de contanto da escola é obrigatório'),
        telefone: z.string().transform(strip),
        email: z.string().email({ message: 'E-mail de contato da escola inválido' }).optional().nullable().default(null),
        funcao: z.string().min(1, 'Funcao é obrigatória'),
      })
    ),
  }),

  arquivos: z.array(
    z.object({
      tipo: z.string().nullable().default(null),
      arquivo_id: z.string().nullable().default(null),
      mime_type: z.string().nullable().default(null),
      tamanho: z.number().nullable().default(null),
      data_upload: z.coerce.date(), 
    })
  ).optional().default([]),
});