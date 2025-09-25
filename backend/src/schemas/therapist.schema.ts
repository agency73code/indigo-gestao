import z from "zod";
import { cpf, cnpj } from "cpf-cnpj-validator";

const strip = (val: string) => val.replace(/[^\dA-Za-z]/g, "");

export const therapistSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  emailIndigo: z.string().email(),
  telefone: z.string().transform(strip).optional().nullable().default(null),
  celular: z.string().transform(strip),
  cpf: z
    .string()
    .transform(strip)
    .refine((val) => cpf.isValid(val), "CPF inválido"),
  dataNascimento: z.coerce.date(),
  possuiVeiculo: z.enum(["sim", "nao"]),
  placaVeiculo: z.string().regex(/^[A-Z]{3}-\d{4}$/).nullable().optional().default(null),
  modeloVeiculo: z.string().min(2).nullable().optional().default(null),
  banco: z.string().min(2),
  agencia: z.string().transform(strip),
  conta: z.string().transform(strip),
  chavePix: z.string().transform(strip),
  valorHoraAcordado: z.string(),
  professorUnindigo: z.enum(["sim", "nao"]),
  disciplinaUniindigo: z.string().nullable().optional().default(null),

  endereco: z.object({
    cep: z.string().transform(strip),
    rua: z.string(),
    numero: z.string(),
    complemento: z.string().nullable().optional(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string().length(2),
  }),

  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable().default(null),

  formacao: z.object({
    graduacao: z.string(),
    instituicaoGraduacao: z.string(),
    anoFormatura: z.string().regex(/^\d{4}$/),
    posGraduacoes: z.array(
      z.object({
        tipo: z.enum(["lato", "stricto"]),
        curso: z.string(),
        instituicao: z.string(),
        conclusao: z.string().regex(/^\d{4}-\d{2}$/),
      })
    ).default([]),
    participacaoCongressosDescricao: z.string().nullable().optional().default(null),
    publicacoesLivrosDescricao: z.string().nullable().optional().default(null),
  }),

  arquivos: z.object({
    fotoPerfil: z.string().url().nullable(),
    diplomaGraduacao: z.string().url().nullable(),
    diplomaPosGraduacao: z.string().url().nullable(),
    registroCRP: z.string().url().nullable(),
    comprovanteEndereco: z.string().url().nullable(),
  }),

  cnpj: z.object({
    numero: z.string()
      .nullable()
      .default(null)
      .refine(
        (val) => val === null || cnpj.isValid(val),
        { message: "CNPJ inválido" }
      ),
    razaoSocial: z.string().nullable().default(null),
    endereco: z.object({
      cep: z.string().nullable().default(null),
      rua: z.string().nullable().default(null),
      numero: z.string().nullable().default(null),
      complemento: z.string().nullable().default(null),
      bairro: z.string().nullable().default(null),
      cidade: z.string().nullable().default(null),
      estado: z.string().nullable().default(null),
    }).nullable().default(null),
  }).nullable().default(null),

  dadosProfissionais: z.array(
    z.object({
      areaAtuacao: z.string(),
      cargo: z.string(),
      numeroConselho: z.string(),
    })
  ),

  documentos: z
  .array(z.object({
    tipo_documento: z.string(),
    view_url: z.string(),
    download_url: z.string(),
    data_upload: z.coerce.date(),
  }))
  .default([]),
});