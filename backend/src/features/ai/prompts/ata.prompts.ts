/**
 * Prompts para Atas de Reunião
 * @module features/ai/prompts
 */

export const PROMPTS_ATA = {
    /** Resumo completo estruturado para registro interno */
    RESUMO_COMPLETO: `
Você é um assistente de uma clínica de terapia infantil.
Gere um RESUMO CONCISO da ata de reunião.

REGRAS CRÍTICAS:
1. O resumo DEVE ser MENOR que o conteúdo original
2. MÁXIMO 200 palavras
3. Se o conteúdo já for curto, resuma em 2-3 frases apenas
4. Use APENAS informações do conteúdo fornecido
5. Linguagem profissional em terceira pessoa
6. Escreva em português brasileiro

FORMATO:
- 1 parágrafo contextual (quem, quando, objetivo)
- Lista com 2-4 pontos principais (apenas os mais relevantes)
- Lista com 1-3 encaminhamentos (se houver)

Se o conteúdo original já for simples, NÃO expanda - apenas sintetize.

DADOS:
Finalidade: {finalidade}
Data: {data}
Participantes: {participantes}

CONTEÚDO:
{conteudo}
`,

    /** Mensagem estruturada para WhatsApp - envio aos pais/responsáveis */
    RESUMO_WHATSAPP: `
Você é um assistente de uma clínica de terapia infantil.
Gere uma mensagem ESTRUTURADA para enviar aos pais via WhatsApp.

A mensagem deve servir como REGISTRO FORMAL da reunião, facilitando:
- Comunicação clara com os pais
- Documentação para eventuais dúvidas futuras
- Transparência sobre o que foi discutido

FORMATO OBRIGATÓRIO (use exatamente esta estrutura):

📋 *REGISTRO DE REUNIÃO*
━━━━━━━━━━━━━━━━━━━━

👤 *Cliente:* {cliente}
📅 *Data:* {data}
⏰ *Horário:* {horario}
⏱️ *Duração:* {duracao}
🎯 *Tipo:* {finalidade}

━━━━━━━━━━━━━━━━━━━━
📝 *RESUMO DA REUNIÃO*

(Gere aqui 2-4 frases resumindo os PRINCIPAIS pontos discutidos. Seja objetivo e claro.)

━━━━━━━━━━━━━━━━━━━━
✅ *ORIENTAÇÕES/ENCAMINHAMENTOS*

(Liste aqui 2-4 orientações ou próximos passos acordados, usando bullet points com •)

━━━━━━━━━━━━━━━━━━━━

Qualquer dúvida, estou à disposição! 💙

*{terapeuta}*
{profissao}
{conselho}

REGRAS:
1. Use APENAS informações do conteúdo fornecido
2. Linguagem acolhedora mas profissional
3. NÃO inclua diagnósticos ou informações sensíveis
4. Mantenha o formato com os emojis e separadores
5. Se não houver encaminhamentos claros, escreva "Seguiremos com o plano terapêutico atual."

CONTEÚDO DA REUNIÃO:
{conteudo}
`,
} as const;

/** Helper para substituir placeholders no prompt */
export function buildAtaPrompt(
    template: string,
    params: Record<string, string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}
