/**
 * Schema de validação para Atas de Reunião
 * @module features/atas-reuniao
 */

import { z } from 'zod';
import { FINALIDADE_REUNIAO, MODALIDADE_REUNIAO } from './ata.types.js';

const finalidadeValues = Object.values(FINALIDADE_REUNIAO) as [string, ...string[]];
const modalidadeValues = Object.values(MODALIDADE_REUNIAO) as [string, ...string[]];

export const gerarResumoSchema = z.object({
    conteudo: z
        .string()
        .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
        .max(50000, 'Conteúdo muito longo'),
    finalidade: z.enum(finalidadeValues),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    participantes: z.array(z.string()).optional(),
    terapeuta: z.string().min(2, 'Nome do terapeuta é obrigatório'),
    profissao: z.string().min(2, 'Profissão é obrigatória'),
    cliente: z.string().optional(),
    // Campos extras para WhatsApp
    horarioInicio: z.string().optional(),
    horarioFim: z.string().optional(),
    duracao: z.string().optional(),
    conselho: z.string().optional(),
    // Links de recomendação
    links: z.array(z.object({
        titulo: z.string(),
        url: z.string(),
    })).optional(),
});

export type GerarResumoInput = z.infer<typeof gerarResumoSchema>;
