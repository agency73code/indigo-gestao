import { z } from 'zod';
import { cpf } from 'cpf-cnpj-validator';

const strip = (val: string) => val.replace(/[^\dA-Za-z]/g, '');

const caregiverAddressSchema = z.object({
    cep: z.string().min(1, 'CEP é obrigatório').transform(strip),
    logradouro: z.string().min(1, 'Rua é obrigatório'),
    numero: z.string().min(1, 'Numero é obrigatório'),
    complemento: z.string().optional().nullable().default(''),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatório'),
    uf: z.string().min(1, 'Estado é obrigatório'),
});

const caregiverSchema = z.object({
    relacao: z.string().min(1, 'Relação é obrigatória'),
    descricaoRelacao: z.string().optional().nullable().default(null),
    nome: z.string().min(1, 'Nome é obrigatório'),
    cpf: z
        .string()
        .transform(strip)
        .refine((val) => cpf.isValid(val), { message: 'CPF do responsável inválido' }),
    profissao: z.string().optional().nullable().default(null),
    escolaridade: z.string().min(1, 'Escolaridade é obrigatório'),
    telefone: z.string().min(1, 'Telefone do responsável é obrigatório').transform(strip),
    email: z.email({ message: 'E-mail inválido' }),
    dataNascimento: z.coerce
        .date({ error: 'Data de nascimento do cuidador é obrigatória' })
        .refine((d) => !Number.isNaN(d.getTime()), {
            error: 'Data de nascimento do cuidador inválida',
        }),
    endereco: caregiverAddressSchema,
});

const clientAddressSchema = z.object({
    cep: z.string().min(1, 'CEP é obrigatório').transform(strip),
    logradouro: z.string().min(1, 'Rua é obrigatório'),
    numero: z.string().min(1, 'Numero é obrigatório'),
    complemento: z.string().optional().nullable().default(''),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatório'),
    uf: z.string().min(1, 'Estado é obrigatório'),
    residenciaDe: z.string().optional().nullable().default(null),
    outroResidencia: z.string().optional().nullable().default(null),
});

const paymentSchema = z.object({
    nomeTitular: z.string().min(1, 'Nome do titular é obrigatório'),
    numeroCarteirinha: z.string().transform(strip).optional().nullable().default(null),
    telefone1: z.string().min(1, 'Ao menos 1 telefone de pagamento é obrigatório').transform(strip),
    telefone2: z.string().transform(strip).optional().nullable().default(null),
    telefone3: z.string().transform(strip).optional().nullable().default(null),
    email1: z
        .email({ message: 'E-mail de pagamento inválido' })
        .min(1, 'Ao menos 1 e-mail de pagamento é obrigatório'),
    email2: z
        .email({ message: 'E-mail de pagamento 2 inválido' })
        .optional()
        .nullable()
        .default(null),
    email3: z
        .email({ message: 'E-mail de pagamento 3 inválido' })
        .optional()
        .nullable()
        .default(null),
    sistemaPagamento: z.enum(['reembolso', 'liminar', 'particular']),
    prazoReembolso: z.string().optional().nullable().default(null),
    numeroProcesso: z.string().transform(strip).optional().nullable().default(null),
    nomeAdvogado: z.string().optional().nullable().default(null),
    telefoneAdvogado1: z.string().transform(strip).optional().nullable().default(null),
    telefoneAdvogado2: z.string().transform(strip).optional().nullable().default(null),
    telefoneAdvogado3: z.string().transform(strip).optional().nullable().default(null),
    emailAdvogado1: z
        .email({ message: 'E-mail do advogado inválido' })
        .optional()
        .nullable()
        .default(null),
    emailAdvogado2: z
        .email({ message: 'E-mail do advogado 2 inválido' })
        .optional()
        .nullable()
        .default(null),
    emailAdvogado3: z
        .email({ message: 'E-mail do advogado 3 inválido' })
        .optional()
        .nullable()
        .default(null),
    houveNegociacao: z.preprocess(
        (v) => (v === null ? undefined : v),
        z.enum(['sim', 'nao']).default('nao'),
    ),
    valorAcordado: z.string().optional().nullable().default(null),
});

const schoolAddressSchema = z.object({
    cep: z.string().min(1, 'CEP é obrigatório').transform(strip),
    logradouro: z.string().min(1, 'Rua é obrigatório'),
    numero: z.string().min(1, 'Numero é obrigatório'),
    complemento: z.string().optional().nullable().default(''),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatório'),
    uf: z.string().min(1, 'Estado é obrigatório'),
});

const schoolContactSchema = z.object({
    nome: z.string().min(1, 'Nome de contanto da escola é obrigatório'),
    telefone: z.string().min(1, 'Telefone de contanto da escola é obrigatório').transform(strip),
    email: z
        .string()
        .email({ message: 'E-mail de contato da escola inválido' })
        .optional()
        .nullable()
        .default(null),
    funcao: z.string().nullable(),
});

const schoolSchema = z.object({
    tipoEscola: z.enum(['particular', 'publica', 'afastado', 'clinica-escola']),
    nome: z.string().optional().nullable().default(null),
    telefone: z.string().transform(strip).optional().nullable().default(null),
    email: z
        .string()
        .email({ message: 'E-mail da escola inválido' })
        .optional()
        .nullable()
        .default(null),
    endereco: schoolAddressSchema,
    contatos: z.array(schoolContactSchema),
});

const fileSchema = z.object({
    tipo: z.string().nullable().default(null),
    arquivo_id: z.string().nullable().default(null),
    mime_type: z.string().nullable().default(null),
    tamanho: z.number().nullable().default(null),
    data_upload: z.coerce.date(),
});

export const ClientSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    cpf: z
        .string()
        .transform(strip)
        .refine((val) => cpf.isValid(val), { message: 'CPF inválido' }),
    dataNascimento: z.coerce.date(),
    emailContato: z.email({ message: 'E-mail inválido' }),
    dataEntrada: z.coerce.date(),
    dataSaida: z.coerce.date().optional().nullable().default(null),

    cuidadores: z.array(caregiverSchema).min(1, 'Deve haver pelo menos um cuidador'),
    enderecos: z.array(clientAddressSchema).min(1, 'Deve haver pelo menos um endereço'),
    dadosPagamento: paymentSchema,
    dadosEscola: schoolSchema,
    arquivos: z.array(fileSchema).optional().default([]),
});

const nullableDate = z.preprocess((val) => {
    if (val === null || val === '') return null;
    if (typeof val === 'string' || typeof val === 'number') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }
    return val;
}, z.date().nullable());

const optionalFileSchema = fileSchema.partial();

export const UpdateClientSchema = z
    .object({
        nome: z.string().min(1, 'Nome é obrigatório'),
        cpf: z
            .string()
            .transform(strip)
            .refine((val) => cpf.isValid(val), { message: 'CPF principal inválido' }),
        dataNascimento: z.coerce.date({ message: 'Data de nascimento é obrigatória' }),
        emailContato: z.email({ message: 'E-mail inválido' }),
        dataEntrada: z.coerce.date({ message: 'Data de entrada é obrigatória' }),
        dataSaida: nullableDate.default(null),
        cuidadores: z.array(caregiverSchema),
        enderecos: z.array(clientAddressSchema),
        dadosPagamento: paymentSchema,
        dadosEscola: schoolSchema,
        arquivos: z.array(optionalFileSchema).optional(),
    })
    .strict()
    .refine((data) => !data.dataSaida || data.dataSaida >= data.dataEntrada, {
        message: 'A data de saída não pode ser anterior à data de entrada',
        path: ['dataSaida'],
    });

export type ClientSchemaInput = z.infer<typeof ClientSchema>;
export type UpdateClientSchemaInput = z.infer<typeof UpdateClientSchema>;
