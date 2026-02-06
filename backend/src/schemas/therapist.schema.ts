import z from 'zod';
import { makeEmailSchema } from './utils/email.js';
import { cnpjDigits, cpfDigits } from './utils/cpfDigits.js';
import { dateStringToDate, nullableDateStringToDate } from './utils/dateStringToDate.js';
import { removeNonAlphanumeric } from './utils/removeNonAlphanumeric.js';
import { addressSchema } from './utils/address.js';
import { idParam } from './utils/id.js';

const placaRegex = /^([A-Z]{3}-\d{4}|[A-Z]{3}-?\d[A-Z]\d{2})$/;

export const therapistSchema = z.object({
    nome: z.string().trim().min(1, 'Nome é obrigatório'),
    email: makeEmailSchema({ required: "E-mail pessoal é obrigatório" }),
    emailIndigo: makeEmailSchema({ required: "E-mail indigo é obrigatório" }),
    telefone: z.string().trim().transform(removeNonAlphanumeric).nullable().default(null),
    celular: z.string().trim().min(1, 'Celular é obrigatório').transform(removeNonAlphanumeric),
    cpf: cpfDigits,
    dataNascimento: dateStringToDate,
    possuiVeiculo: z
        .enum(['sim', 'nao'])
        .transform((v) => v === 'sim'),
    placaVeiculo: z
        .string()
        .trim()
        .toUpperCase()
        .regex(placaRegex, 'Placa inválida. Use o formato ABC-1234 ou ABC-1D23.')
        .transform(removeNonAlphanumeric)
        .nullable()
        .default(null),
    modeloVeiculo: z.string().trim().nullable().default(null),
    banco: z.string().trim().min(1, 'Banco é obrigatório'),
    agencia: z.string().trim().min(1, 'Agencia é obrigatório').transform(removeNonAlphanumeric),
    conta: z.string().trim().min(1, 'A conta é obrigatória').transform(removeNonAlphanumeric),
    pixTipo: z.enum(['email', 'telefone', 'cpf', 'cnpj', 'aleatoria']),
    chavePix: z.string(),
    valorSessaoConsultorio: z
        .coerce.number()
        .positive()
        .min(1, { message: 'Informe o valor da sessão em consultório' }),
    valorSessaoHomecare: z
        .coerce.number()
        .positive()
        .min(1, { message: 'Informe o valor da sessão em home care' }),
    valorHoraDesenvolvimentoMateriais: z
        .coerce.number()
        .positive()
        .min(1, { message: 'Informe o valor por hora de desenvolvimento de materiais' }),
    valorHoraSupervisaoRecebida: z
        .coerce.number()
        .positive()
        .min(1, { message: 'Informe o valor por hora da supervisão recebida' }),
    valorHoraSupervisaoDada: z
        .coerce.number()
        .positive()
        .min(1, { message: 'Informe o valor por hora da supervisão prestada' }),
    valorHoraReuniao: z
        .coerce.number()
        .positive()
        .min(1, { message: 'Informe o valor por hora de reunião' }),
    professorUnindigo: z
        .enum(['sim', 'nao'])
        .transform((v) => v === 'sim'),
    disciplinaUniindigo: z.string().trim().nullable().default(null),

    endereco: addressSchema,
    dataInicio: dateStringToDate,
    dataFim: nullableDateStringToDate,

    formacao: z.object({
        graduacao: z.string().trim().min(1, 'Informe a graduação'),
        instituicaoGraduacao: z.string().trim().min(1, 'Informe a instituição da graduação'),
        anoFormatura: z
            .string()
            .trim()
            .regex(/^\d{4}$/, { message: 'Informe um ano válido (AAAA)' })
            .transform((v) => Number(v)),
        posGraduacoes: z
            .array(
                z.object({
                    tipo: z.enum(['lato', 'stricto'], {
                        message: 'Informe o tipo de pós-graduação'
                    }),
                    curso: z.string().trim().min(1, 'Informe o curso'),
                    instituicao: z.string().trim().min(1, 'Informe a instituição'),
                    conclusao: z.string().trim().min(1, 'Informe a data de conclusão'),
                }),
            )
            .default([]),
        participacaoCongressosDescricao: z.string().trim().nullable().default(null),
        publicacoesLivrosDescricao: z.string().trim().nullable().default(null),
    }),

    cnpj: z
        .object({
            numero: cnpjDigits,
            razaoSocial: z.string().trim().nullable().default(null),
            endereco: addressSchema,
        })
        .nullable()
        .default(null),

    dadosProfissionais: z.array(
        z.object({
            areaAtuacao: z.string().trim().min(1, 'Informe a área de atuação'),
            areaAtuacaoId: idParam,
            cargo: z.string().trim().min(1, 'Informe o cargo'),
            cargoId: idParam,
            numeroConselho: z.string().trim().min(1, 'Informe o número do conselho'),
        }),
    ),

    arquivos: z .array(
        z.object({
            tipo: z.string().nullable().default(null),
            arquivo_id: z.string().nullable().default(null),
            mime_type: z.string().nullable().default(null),
            tamanho: z.number().nullable().default(null),
            data_upload: dateStringToDate,
        }),
    )
    .default([]),
});

export type TherapistSchemaInput = z.infer<typeof therapistSchema>;
