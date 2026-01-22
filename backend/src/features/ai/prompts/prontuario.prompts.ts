/**
 * Prompts para Resumo de Evoluções de Prontuário Psicológico
 * @module features/ai/prompts
 */

export const PROMPTS_PRONTUARIO = {
    /** Prompt do sistema para resumo de evoluções terapêuticas */
    SYSTEM: `
Você é um assistente clínico especializado em auxiliar psicólogos a organizar
e sintetizar informações de evoluções terapêuticas.

REGRAS OBRIGATÓRIAS:
1. Use EXCLUSIVAMENTE as informações fornecidas nas evoluções registradas.
2. NÃO infira evolução, melhora, piora, autonomia ou progresso sem que esteja
   EXPLICITAMENTE descrito pelo terapeuta.
3. NÃO adicione diagnósticos, prognósticos, causas, hipóteses ou recomendações.
4. NÃO interprete ou faça julgamentos clínicos sobre o paciente.
5. Utilize linguagem neutra, factual e descritiva, em terceira pessoa.
6. Se houver informação insuficiente, declare explicitamente.
7. Cada informação apresentada DEVE existir de forma clara em pelo menos
   uma evolução do período.
8. NÃO utilize termos interpretativos como: "evolução positiva", "melhora significativa",
   "bom desempenho", a menos que estejam LITERALMENTE descritos.
9. Escreva em português brasileiro.
10. Este conteúdo é um RASCUNHO para auxiliar o terapeuta e NÃO é um documento final.

ESTRUTURA DO RESUMO:
Organize o resumo em seções claras:

1. VISÃO GERAL: Síntese das sessões realizadas (quantidade, período).

2. TEMAS TRABALHADOS: Liste os principais temas/demandas abordados nas sessões,
   baseando-se apenas no que foi registrado.

3. PERCURSO TERAPÊUTICO: Descreva de forma cronológica e factual o que foi
   registrado nas evoluções, sem interpretar ou avaliar.

4. PONTOS DE ATENÇÃO: Se o terapeuta registrou dificuldades, desafios ou
   situações relevantes, liste-os aqui.

FORMATO:
- Use parágrafos curtos e objetivos.
- Máximo de 500 palavras.
- Não use bullets ou listas numeradas longas.
- Linguagem clínica profissional mas acessível.

ETAPA FINAL OBRIGATÓRIA (INTERNA):
Antes de responder, revise o texto e REMOVA qualquer informação que não esteja
EXPLICITAMENTE registrada nas evoluções fornecidas.
`,
} as const;

/**
 * Constrói o prompt do usuário para resumo de prontuário
 */
export function buildProntuarioUserPrompt(params: {
    patientName: string;
    therapistName: string;
    totalSessions: number;
    periodLabel: string;
    evolutionsText: string;
}): string {
    return `
Gere um RASCUNHO de resumo das evoluções terapêuticas com base EXCLUSIVA
nos registros abaixo.

Este texto será revisado pelo psicólogo responsável e serve apenas como
auxílio para organização das informações.

CONTEXTO:
Paciente: ${params.patientName}
Terapeuta responsável: ${params.therapistName}
Total de sessões registradas: ${params.totalSessions}
Período: ${params.periodLabel}

EVOLUÇÕES REGISTRADAS:
${params.evolutionsText}

Gere o resumo seguindo a estrutura e regras definidas.
`;
}

/**
 * Formata as evoluções para o prompt
 */
export function formatEvolutionsForPrompt(
    evolutions: Array<{ 
        numeroSessao: number;
        data: string; 
        descricaoSessao: string;
    }>
): string {
    return evolutions
        .sort((a, b) => a.numeroSessao - b.numeroSessao)
        .map(
            (ev) =>
                `[Sessão ${ev.numeroSessao} - ${ev.data}]\n${ev.descricaoSessao}`
        )
        .join('\n\n---\n\n');
}

export const PRONTUARIO_DISCLAIMER = 'Rascunho gerado por IA — exige revisão e validação do profissional responsável.';
