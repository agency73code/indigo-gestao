/**
 * Serviço de Atas de Reunião - Geração de Resumos via IA
 * @module features/atas-reuniao
 */

import OpenAI from 'openai';
import { PROMPTS_ATA, buildAtaPrompt } from '../ai/prompts/index.js';
import { AIServiceError } from '../ai/ai.errors.js';
import type { GerarResumoInput } from './ata.schema.js';

// Labels para exibição
const FINALIDADE_LABELS: Record<string, string> = {
    orientacao_parental: 'Orientação Parental',
    reuniao_equipe: 'Reunião de Equipe',
    reuniao_escola: 'Reunião com Escola',
    supervisao_terapeuta: 'Supervisão de Terapeuta',
    planejamento_terapeutico: 'Planejamento Terapêutico',
    devolutiva: 'Devolutiva',
    outros: 'Outros',
};

// Cliente OpenAI (singleton)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!process.env.OPENAI_API_KEY) {
        throw new AIServiceError('AI_CONFIG_ERROR', 'OPENAI_API_KEY não configurada');
    }
    
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    return openaiClient;
}

/**
 * Gera resumo completo da ata via OpenAI
 */
export async function gerarResumoCompleto(params: GerarResumoInput): Promise<string> {
    const openai = getOpenAIClient();
    
    const prompt = buildAtaPrompt(PROMPTS_ATA.RESUMO_COMPLETO, {
        finalidade: FINALIDADE_LABELS[params.finalidade] || params.finalidade,
        data: params.data,
        participantes: params.participantes?.join(', ') || 'Não informados',
        conteudo: stripHtml(params.conteudo),
    });
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500, // Limita para forçar resumos concisos
    });
    
    const summary = completion.choices[0]?.message?.content;
    
    if (!summary) {
        throw new AIServiceError('AI_EMPTY_RESPONSE', 'Resposta vazia da IA');
    }
    
    return summary.trim();
}

/**
 * Gera mensagem estruturada para WhatsApp via OpenAI
 */
export async function gerarResumoWhatsApp(params: GerarResumoInput): Promise<string> {
    const openai = getOpenAIClient();
    
    // Monta horário formatado
    const horario = params.horarioInicio && params.horarioFim
        ? `${params.horarioInicio} - ${params.horarioFim}`
        : 'Não informado';
    
    // Monta seção de links
    const linksFormatados = params.links && params.links.length > 0
        ? params.links.map(l => `• ${l.titulo}: ${l.url}`).join('\n')
        : '';
    
    // Seção de links para incluir na mensagem (vazia se não houver links)
    const secaoLinks = params.links && params.links.length > 0
        ? `━━━━━━━━━━━━━━━━━━━━
🔗 *LINKS RECOMENDADOS*

${params.links.map(l => `• ${l.titulo}\n  ${l.url}`).join('\n\n')}`
        : '';
    
    const prompt = buildAtaPrompt(PROMPTS_ATA.RESUMO_WHATSAPP, {
        terapeuta: params.terapeuta,
        profissao: params.profissao,
        conselho: params.conselho || '',
        finalidade: FINALIDADE_LABELS[params.finalidade] || params.finalidade,
        data: formatarData(params.data),
        horario: horario,
        duracao: params.duracao || 'Não informada',
        cliente: params.cliente || 'Não informado',
        conteudo: stripHtml(params.conteudo),
        links: linksFormatados,
        secao_links: secaoLinks,
    });
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 800, // Aumentado para formato estruturado
    });
    
    const summary = completion.choices[0]?.message?.content;
    
    if (!summary) {
        throw new AIServiceError('AI_EMPTY_RESPONSE', 'Resposta vazia da IA');
    }
    
    return summary.trim();
}

// ============================================
// HELPERS
// ============================================

/**
 * Remove tags HTML do conteúdo
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
function formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}
