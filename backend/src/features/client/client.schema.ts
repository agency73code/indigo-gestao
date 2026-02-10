import { z } from 'zod';
import { cpfDigits } from '../../schemas/utils/cpfDigits.js';
import { dateStringToDate, nullableDateStringToDate } from '../../schemas/utils/dateStringToDate.js';
import { phoneSchema, phoneSchemaNullable } from '../../schemas/utils/phone.js';
import { optionalIdParam } from '../../schemas/utils/id.js';

const addressSchema = z.object({
    cep: z.string().trim().min(1, 'Informe o CEP').transform((value) => value.replace(/\D/g, '')),
    logradouro: z.string().trim().min(1, 'Informe a rua'),
    numero: z.string().trim().min(1, 'Informe o numero'),
    complemento: z.string().nullable().default(''),
    bairro: z.string().trim().min(1, 'Informe o bairro'),
    cidade: z.string().trim().min(1, 'Informe a cidade'),
    uf: z.string().trim().min(1, 'Informe o estado'),
})

const addressClientSchema = addressSchema.extend({
    residenciaDe: z.string().trim().min(1, 'Informe de quem é a residencia'),
    outroResidencia: z.string().trim().nullable().default(null),
})

export const clientUpdateSchema = z.object({
    nome: z.string().trim().min(1, 'Informe o nome do cliente'),
    emailContato: z.email('Informe um email de contato válido'),
    cpf: cpfDigits,
    dataNascimento: dateStringToDate,
    dataEntrada: dateStringToDate,
    dataSaida: nullableDateStringToDate,

    cuidadores: z.array(
        z.object({
            id: optionalIdParam,
            relacao: z.string().trim().min(1, 'Informe a relação do cuidador com o cliente'),
            descricaoRelacao: z.string().nullable().default(null),
            dataNascimento: dateStringToDate,
            nome: z.string().trim().min(1, 'Informe o nome do cuidador'),
            cpf: cpfDigits,
            profissao: z.string().nullable().default(null),
            escolaridade: z.string().nullable().default(null),
            telefone: phoneSchema('telefone de contato do cuidador'),
            email: z.email('Informe um email de contato do cuidador válido'),
            endereco: addressSchema,
            isNew: z.boolean().optional(),
            remove: z.boolean().optional(),
        })
    ),

    enderecos: z.array(addressClientSchema),

    dadosPagamento: z.object({
        nomeTitular: z.string().trim().min(1, 'Informe o nome do titular'),
        numeroCarteirinha: z.string().nullable().default(null),
        telefone1: phoneSchema('telefone de contato principal para pagamento'),
        telefone2: phoneSchemaNullable('telefone de contato alternativo para pagamento'),
        telefone3: phoneSchemaNullable('telefone de contato alternativo para pagamento'),
        email1: z.email('Informe um email de contato principal para pagamento válido'),
        email2: z.email('Informe um email de contato alternativo para pagamento válido').nullable().default(null),
        email3: z.email('Informe um email de contato alternativo para pagamento válido').nullable().default(null),
        sistemaPagamento: z.enum(['reembolso', 'liminar', 'particular'], 'Informe um sistema de pagamento válido'),
        prazoReembolso: z.string().nullable().default(null),
        numeroProcesso: z.string().nullable().default(null),
        nomeAdvogado:z.string().nullable().default(null),
        telefoneAdvogado1: phoneSchemaNullable('telefone de contato principal do advogado'),
        telefoneAdvogado2: phoneSchemaNullable('telefone de contato alternativo do advogado'),
        telefoneAdvogado3: phoneSchemaNullable('telefone de contato alternativo do advogado'),
        emailAdvogado1: z.email('Informe um e-mail de contato principal do advogado válido').nullable().default(null),
        emailAdvogado2: z.email('Informe um e-mail de contato alternativo do advogado válido').nullable().default(null),
        emailAdvogado3: z.email('Informe um e-mail de contato alternativo do advogado válido').nullable().default(null),
        houveNegociacao: z.enum(['sim', 'nao'], 'Informe se houve negociacao').default('nao'),
        valorAcordado: z.string().nullable().default(null),
    }),

    dadosEscola: z.object({
        tipoEscola: z.enum(['particular', 'publica', 'afastado', 'clinica-escola'], 'Informe um tipo válido de escola do cliente'),
        nome: z.string().nullable().default(null),
        telefone: phoneSchema('telefone de contato da escola'),
        email: z.string().nullable().default(null),
        endereco: addressSchema,
        contatos: z.array(
            z.object({
                nome: z.string().nullable().default(null),
                telefone: phoneSchema('telefone do contato da escola'),
                email: z.email('Informe um e-mail do contato da escola válido').nullable().default(null),
                funcao: z.string().nullable().default(null),
            }),
        ),
    }),
});

export type clientUpdatePayload = z.infer<typeof clientUpdateSchema>;