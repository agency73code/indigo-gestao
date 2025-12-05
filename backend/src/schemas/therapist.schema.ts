import z from 'zod';
import { cpf, cnpj } from 'cpf-cnpj-validator';

const placaRegex = /^([A-Z]{3}-\d{4}|[A-Z]{3}-?\d[A-Z]\d{2})$/;
const strip = (val: string) => val.replace(/[^\dA-Za-z]/g, '');

export const therapistSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z
        .string()
        .min(1, 'E-mail pessoal é obrigatório')
        .email({ message: 'E-mail pessoal inválido' }),
    emailIndigo: z
        .string()
        .min(1, 'E-mail indigo é obrigatório')
        .email({ message: 'E-mail indigo inválido' }),
    telefone: z.string().transform(strip).optional().nullable().default(null),
    celular: z.string().min(1, 'Celular é obrigatório').transform(strip),
    cpf: z
        .string()
        .transform(strip)
        .refine((val) => cpf.isValid(val), 'CPF inválido'),
    dataNascimento: z.coerce.date({ message: 'Data de nascimento inválida' }),
    possuiVeiculo: z.enum(['sim', 'nao']),
    placaVeiculo: z
        .string()
        .toUpperCase()
        .regex(placaRegex, 'Placa inválida. Use o formato ABC-1234 ou ABC-1D23.')
        .transform(strip)
        .nullable()
        .optional()
        .default(null),
    modeloVeiculo: z.string().min(1).nullable().optional().default(null),
    banco: z.string().min(1, 'Banco é obrigatório'),
    agencia: z.string().min(1, 'Agencia é obrigatório').transform(strip),
    conta: z.string().min(1, 'A conta é obrigatória').transform(strip),
    pixTipo: z.enum(['email', 'telefone', 'cpf', 'cnpj', 'aleatoria']),
    chavePix: z.string(),
    valorHoraAcordado: z.string(),
    professorUnindigo: z.enum(['sim', 'nao']),
    disciplinaUniindigo: z.string().nullable().optional().default(null),

    endereco: z.object({
        cep: z.string().min(1, 'CEP é obrigatório').transform(strip),
        rua: z.string().min(1, 'Rua é obrigatório'),
        numero: z.string().min(1, 'Numero é obrigatório'),
        complemento: z.string(),
        bairro: z.string().min(1, 'Bairro é obrigatório'),
        cidade: z.string().min(1, 'Cidade é obrigatório'),
        estado: z.string().length(2).min(1, 'Estado é obrigatório'),
    }),

    dataInicio: z.coerce.date().min(1, 'Data de inicio é obrigatório'),
    dataFim: z
        .preprocess((val) => (val === '' ? null : val), z.coerce.date().nullable())
        .default(null),

    formacao: z.object({
        graduacao: z.string(),
        instituicaoGraduacao: z.string(),
        anoFormatura: z.string().regex(/^\d{4}$/),
        posGraduacoes: z
            .array(
                z.object({
                    tipo: z.enum(['lato', 'stricto']),
                    curso: z.string(),
                    instituicao: z.string(),
                    conclusao: z.string().regex(/^\d{4}-\d{2}$/),
                }),
            )
            .default([]),
        participacaoCongressosDescricao: z.string().nullable().optional().default(null),
        publicacoesLivrosDescricao: z.string().nullable().optional().default(null),
    }),

    cnpj: z
        .object({
            numero: z
                .string()
                .transform(strip)
                .nullable()
                .default(null)
                .refine((val) => val === null || cnpj.isValid(val), { message: 'CNPJ inválido' }),
            razaoSocial: z.string().nullable().default(null),
            endereco: z
                .object({
                    cep: z.string().transform(strip).nullable().default(null),
                    rua: z.string().nullable().default(null),
                    numero: z.string().nullable().default(null),
                    complemento: z.string().nullable().default(null),
                    bairro: z.string().nullable().default(null),
                    cidade: z.string().nullable().default(null),
                    estado: z.string().nullable().default(null),
                })
                .nullable()
                .default(null),
        })
        .nullable()
        .default(null),

    dadosProfissionais: z.array(
        z.object({
            areaAtuacao: z.string(),
            areaAtuacaoId: z.union([z.number().int().positive(), z.string().min(1)]),
            cargo: z.string(),
            cargoId: z
                .union([z.number().int().positive(), z.string().min(1)])
                .nullable()
                .optional(),
            numeroConselho: z.string(),
        }),
    ),

    arquivos: z
        .array(
            z.object({
                tipo: z.string().nullable().default(null),
                arquivo_id: z.string().nullable().default(null),
                mime_type: z.string().nullable().default(null),
                tamanho: z.number().nullable().default(null),
                data_upload: z.coerce.date(),
            }),
        )
        .optional()
        .default([]),
});

export type TherapistSchemaInput = z.infer<typeof therapistSchema>;
