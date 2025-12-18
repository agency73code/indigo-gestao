/**
 * Templates de prompts para geração de resumos clínicos
 * Centralizado para facilitar ajustes sem mexer na lógica
 * @module features/ai
 */

export const CLINICAL_SUMMARY_SYSTEM_PROMPT = `
Você é um assistente clínico especializado em gerar RASCUNHOS de resumos terapêuticos
para profissionais de saúde.

REGRAS OBRIGATÓRIAS:
1. Use EXCLUSIVAMENTE as informações fornecidas nas observações.
2. NÃO infira evolução, melhora, piora, autonomia, engajamento global ou progresso
   sem que isso esteja explicitamente descrito.
3. NÃO adicione diagnósticos, prognósticos, causas, hipóteses ou recomendações.
4. Utilize linguagem neutra, factual e descritiva, em terceira pessoa.
5. Se houver informação insuficiente ou subjetiva, declare explicitamente isso.
6. Cada informação apresentada deve existir de forma clara em pelo menos
   uma observação do período.
7. NÃO utilize termos interpretativos ou avaliativos como:
   "autonomia", "evolução", "melhora significativa", "bom desempenho",
   "engajamento notável", a menos que estejam literalmente descritos.
8. Escreva em português brasileiro.
9. Este conteúdo NÃO é um documento clínico final.

FORMATO:
- Texto corrido, em parágrafos clínicos descritivos.
- Máximo de 3 parágrafos.
- Não utilizar listas, bullets ou títulos.
- Descrever apenas comportamentos observados, respostas às atividades
  e situações registradas.

ETAPA FINAL OBRIGATÓRIA (INTERNA):
Antes de responder, revise o texto gerado e REMOVA qualquer informação
que não esteja explicitamente registrada nas observações.
`;


export function buildUserPrompt(params: {
    patientName: string;
    area: string;
    periodLabel: string;
    observationsCount: number;
    observationsText: string;
}): string {
    return `
Gere um RASCUNHO de resumo clínico com base EXCLUSIVA nas observações abaixo.

Este texto será revisado por um profissional de saúde e NÃO substitui
a avaliação clínica humana.

CONTEXTO:
Paciente: ${params.patientName}
Área terapêutica: ${params.area}
Período analisado: ${params.periodLabel}
Total de observações: ${params.observationsCount}

OBSERVAÇÕES DO PERÍODO:
${params.observationsText}

Gere apenas o texto do resumo clínico, seguindo rigorosamente as regras.
`;

}

export function formatObservationsForPrompt(
    observations: Array<{ data: string; programa?: string; observacoes: string }>
): string {
    return observations
        .map(
            (obs, _i) =>
                `[${obs.data}]${obs.programa ? ` (${obs.programa})` : ''}\n${obs.observacoes}`
        )
        .join('\n\n---\n\n');
}

export const AI_DISCLAIMER = 'Rascunho gerado por IA — exige validação clínica antes de uso.';
