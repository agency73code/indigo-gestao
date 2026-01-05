/**
 * Validação de dados do Cadastro de Anamnese
 * Utiliza Zod para validação de schema
 */

import { z } from 'zod';
import type { Anamnese, ValidationError } from '../types/anamnese.types';

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

// Schema para campos Sim/Não
const simNaoSchema = z.enum(['sim', 'nao']).nullable();

// Schema para campos Sim/Não/Com Ajuda
const simNaoComAjudaSchema = z.enum(['sim', 'nao', 'com_ajuda']).nullable();

// Schema para Cabeçalho
const cabecalhoSchema = z.object({
    dataEntrevista: z.string().min(1, 'Data da entrevista é obrigatória'),
    clienteId: z.string().min(1, 'Cliente é obrigatório'),
    clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
    dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
    idade: z.string(),
    informante: z.string().min(1, 'Informante é obrigatório'),
    parentesco: z.string().min(1, 'Parentesco é obrigatório'),
    parentescoDescricao: z.string().optional(),
    quemIndicou: z.string().optional(),
    profissionalId: z.string().min(1, 'Profissional responsável é obrigatório'),
    profissionalNome: z.string().min(1, 'Nome do profissional é obrigatório'),
    cuidadores: z.array(z.object({
        id: z.string(),
        nome: z.string(),
        relacao: z.string(),
        descricaoRelacao: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().optional(),
        profissao: z.string().optional(),
        escolaridade: z.string().optional(),
        dataNascimento: z.string().optional(),
    })).optional(),
});

// Schema para Especialidade Consultada
const especialidadeConsultadaSchema = z.object({
    id: z.string(),
    especialidade: z.string(),
    nome: z.string(),
    data: z.string(),
    observacao: z.string().optional(),
    ativo: z.boolean(),
});

// Schema para Medicamento
const medicamentoSchema = z.object({
    id: z.string(),
    nome: z.string().min(1, 'Nome do medicamento é obrigatório'),
    dosagem: z.string(),
    dataInicio: z.string(),
    motivo: z.string(),
});

// Schema para Arquivo Anexo
const arquivoAnexoSchema = z.object({
    id: z.string(),
    nome: z.string(),
    tipo: z.string(),
    tamanho: z.number(),
    url: z.string().optional(),
});

// Schema para Exame Prévio
const examePrevioSchema = z.object({
    id: z.string(),
    nome: z.string(),
    data: z.string(),
    resultado: z.string(),
    arquivos: z.array(arquivoAnexoSchema).optional(),
});

// Schema para Terapia Prévia
const terapiaPreviaSchema = z.object({
    id: z.string(),
    profissional: z.string(),
    especialidadeAbordagem: z.string(),
    tempoIntervencao: z.string(),
    observacao: z.string().optional(),
    ativo: z.boolean(),
});

// Schema para Queixa e Diagnóstico
const queixaDiagnosticoSchema = z.object({
    queixaPrincipal: z.string().min(1, 'Queixa principal é obrigatória'),
    diagnosticoPrevio: z.string(),
    suspeitaCondicaoAssociada: z.string(),
    especialidadesConsultadas: z.array(especialidadeConsultadaSchema),
    medicamentosEmUso: z.array(medicamentoSchema),
    examesPrevios: z.array(examePrevioSchema),
    terapiasPrevias: z.array(terapiaPreviaSchema),
});

// Schema para Histórico Familiar
const historicoFamiliarSchema = z.object({
    id: z.string(),
    condicaoDiagnostico: z.string(),
    parentesco: z.string(),
    observacao: z.string(),
});

// Schema para Atividade de Rotina
const atividadeRotinaSchema = z.object({
    id: z.string(),
    atividade: z.string(),
    horario: z.string(),
    responsavel: z.string(),
    frequencia: z.string(),
    observacao: z.string(),
});

// Schema para Contexto Familiar
const contextoFamiliarRotinaSchema = z.object({
    historicosFamiliares: z.array(historicoFamiliarSchema),
    atividadesRotina: z.array(atividadeRotinaSchema),
});

// Schema para marco de desenvolvimento
const marcoDesenvolvimentoSchema = z.object({
    meses: z.string(),
    naoRealiza: z.boolean(),
    naoSoubeInformar: z.boolean(),
});

// Schema para marco de fala/linguagem
const marcoFalaSchema = z.object({
    meses: z.string(),
    nao: z.boolean(),
    naoSoubeInformar: z.boolean(),
});

// Schema para Gestação e Parto
const gestacaoPartoSchema = z.object({
    tipoParto: z.enum(['cesarea', 'natural']).nullable(),
    semanas: z.number().nullable(),
    apgar1min: z.number().nullable(),
    apgar5min: z.number().nullable(),
    intercorrencias: z.string(),
});

// Schema para Neuropsicomotor
const neuropsicomotorSchema = z.object({
    sustentouCabeca: marcoDesenvolvimentoSchema,
    rolou: marcoDesenvolvimentoSchema,
    sentou: marcoDesenvolvimentoSchema,
    engatinhou: marcoDesenvolvimentoSchema,
    andouComApoio: marcoDesenvolvimentoSchema,
    andouSemApoio: marcoDesenvolvimentoSchema,
    correu: marcoDesenvolvimentoSchema,
    andouDeMotoca: marcoDesenvolvimentoSchema,
    andouDeBicicleta: marcoDesenvolvimentoSchema,
    subiuEscadasSozinho: marcoDesenvolvimentoSchema,
    motricidadeFina: z.string(),
});

// Schema para Fala e Linguagem
const falaLinguagemSchema = z.object({
    balbuciou: marcoFalaSchema,
    primeirasPalavras: marcoFalaSchema,
    primeirasFrases: marcoFalaSchema,
    apontouParaFazerPedidos: marcoFalaSchema,
    fazUsoDeGestos: simNaoSchema,
    fazUsoDeGestosQuais: z.string(),
    audicao: z.enum(['boa', 'ruim']).nullable(),
    teveOtiteDeRepeticao: simNaoSchema,
    otiteVezes: z.number().nullable(),
    otitePeriodoMeses: z.number().nullable(),
    otiteFrequencia: z.string(),
    fazOuFezUsoTuboVentilacao: simNaoSchema,
    tuboVentilacaoObservacao: z.string(),
    fazOuFezUsoObjetoOral: simNaoSchema,
    objetoOralEspecificar: z.string(),
    usaMamadeira: simNaoSchema,
    mamadeiraHa: z.string(),
    mamadeiraVezesAoDia: z.number().nullable(),
    comunicacaoAtual: z.string(),
});

// Schema para Desenvolvimento Inicial
const desenvolvimentoInicialSchema = z.object({
    gestacaoParto: gestacaoPartoSchema,
    neuropsicomotor: neuropsicomotorSchema,
    falaLinguagem: falaLinguagemSchema,
});

// Schema para item de desfralde
const desfraldeItemSchema = z.object({
    anos: z.string(),
    meses: z.string(),
    utilizaFralda: z.boolean(),
});

// Schema para Desfralde
const desfraldeSchema = z.object({
    desfraldeDiurnoUrina: desfraldeItemSchema,
    desfraldeNoturnoUrina: desfraldeItemSchema,
    desfraldeFezes: desfraldeItemSchema,
    seLimpaSozinhoUrinar: simNaoSchema,
    seLimpaSozinhoDefecar: simNaoSchema,
    lavaAsMaosAposUsoBanheiro: simNaoSchema,
    apresentaAlteracaoHabitoIntestinal: simNaoSchema,
    observacoes: z.string(),
});

// Schema para Sono
const sonoSchema = z.object({
    dormemMediaHorasNoite: z.string(),
    dormemMediaHorasDia: z.string(),
    periodoSonoDia: z.enum(['manha', 'tarde']).nullable(),
    temDificuldadeIniciarSono: simNaoSchema,
    acordaDeMadrugada: simNaoSchema,
    dormeNaPropriaCama: simNaoSchema,
    dormeNoProprioQuarto: simNaoSchema,
    apresentaSonoAgitado: simNaoSchema,
    eSonambulo: simNaoSchema,
    observacoes: z.string(),
});

// Schema para Hábitos de Higiene
const habitosHigieneSchema = z.object({
    tomaBanhoLavaCorpoTodo: simNaoComAjudaSchema,
    secaCorpoTodo: simNaoComAjudaSchema,
    retiraTodasPecasRoupa: simNaoComAjudaSchema,
    colocaTodasPecasRoupa: simNaoComAjudaSchema,
    poeCalcadosSemCadarco: simNaoComAjudaSchema,
    poeCalcadosComCadarco: simNaoComAjudaSchema,
    escovaOsDentes: simNaoComAjudaSchema,
    penteiaOCabelo: simNaoComAjudaSchema,
    observacoes: z.string(),
});

// Schema para Alimentação
const alimentacaoSchema = z.object({
    apresentaQueixaAlimentacao: simNaoSchema,
    seAlimentaSozinho: simNaoSchema,
    eSeletivoQuantoAlimentos: simNaoSchema,
    passaDiaInteiroSemComer: simNaoSchema,
    apresentaRituaisParaAlimentar: simNaoSchema,
    estaAbaixoOuAcimaPeso: simNaoSchema,
    estaAbaixoOuAcimaPesoDescricao: z.string(),
    temHistoricoAnemia: simNaoSchema,
    temHistoricoAnemiaDescricao: z.string(),
    rotinaAlimentarEProblemaFamilia: simNaoSchema,
    rotinaAlimentarEProblemaFamiliaDescricao: z.string(),
    observacoes: z.string(),
});

// Schema para Atividades de Vida Diária
const atividadesVidaDiariaSchema = z.object({
    desfralde: desfraldeSchema,
    sono: sonoSchema,
    habitosHigiene: habitosHigieneSchema,
    alimentacao: alimentacaoSchema,
});

// Schema para Desenvolvimento Social
const desenvolvimentoSocialSchema = z.object({
    possuiAmigosMesmaIdadeEscola: simNaoSchema,
    possuiAmigosMesmaIdadeForaEscola: simNaoSchema,
    fazUsoFuncionalBrinquedos: simNaoSchema,
    brincaProximoAosColegas: simNaoSchema,
    brincaConjuntaComColegas: simNaoSchema,
    procuraColegasEspontaneamente: simNaoSchema,
    seVerbalIniciaConversa: simNaoSchema,
    seVerbalRespondePerguntasSimples: simNaoSchema,
    fazPedidosQuandoNecessario: simNaoSchema,
    estabeleceContatoVisualAdultos: simNaoSchema,
    estabeleceContatoVisualCriancas: simNaoSchema,
    observacoes: z.string(),
});

// Schema para Desenvolvimento Acadêmico
const desenvolvimentoAcademicoSchema = z.object({
    escola: z.string(),
    ano: z.number().nullable(),
    periodo: z.string(),
    direcao: z.string(),
    coordenacao: z.string(),
    professoraPrincipal: z.string(),
    professoraAssistente: z.string(),
    frequentaEscolaRegular: simNaoSchema,
    frequentaEscolaEspecial: simNaoSchema,
    acompanhaTurmaDemandasPedagogicas: simNaoSchema,
    segueRegrasRotinaSalaAula: simNaoSchema,
    necessitaApoioAT: simNaoSchema,
    necessitaAdaptacaoMateriais: simNaoSchema,
    necessitaAdaptacaoCurricular: simNaoSchema,
    houveReprovacaoRetencao: simNaoSchema,
    escolaPossuiEquipeInclusao: simNaoSchema,
    haIndicativoDeficienciaIntelectual: simNaoSchema,
    escolaApresentaQueixaComportamental: simNaoSchema,
    adaptacaoEscolar: z.string(),
    dificuldadesEscolares: z.string(),
    relacionamentoComColegas: z.string(),
    observacoes: z.string(),
});

// Schema para Social e Acadêmico
const socialAcademicoSchema = z.object({
    desenvolvimentoSocial: desenvolvimentoSocialSchema,
    desenvolvimentoAcademico: desenvolvimentoAcademicoSchema,
});

// Schema para Estereotipias e Rituais
const estereotipiasRituaisSchema = z.object({
    balancaMaosLadoCorpoOuFrente: simNaoSchema,
    balancaCorpoFrenteParaTras: simNaoSchema,
    pulaOuGiraEmTornoDeSi: simNaoSchema,
    repeteSonsSemFuncaoComunicativa: simNaoSchema,
    repeteMovimentosContinuos: simNaoSchema,
    exploraAmbienteLambendoTocando: simNaoSchema,
    procuraObservarObjetosCantoOlho: simNaoSchema,
    organizaObjetosLadoALado: simNaoSchema,
    realizaTarefasSempreMesmaOrdem: simNaoSchema,
    apresentaRituaisDiarios: simNaoSchema,
    observacoesTopografias: z.string(),
});

// Schema para Problemas de Comportamento
const problemasComportamentoSchema = z.object({
    apresentaComportamentosAutoLesivos: simNaoSchema,
    autoLesivosQuais: z.string(),
    apresentaComportamentosHeteroagressivos: simNaoSchema,
    heteroagressivosQuais: z.string(),
    apresentaDestruicaoPropriedade: simNaoSchema,
    destruicaoDescrever: z.string(),
    necessitouContencaoMecanica: simNaoSchema,
    observacoesTopografias: z.string(),
});

// Schema para Comportamento
const comportamentoSchema = z.object({
    estereotipiasRituais: estereotipiasRituaisSchema,
    problemasComportamento: problemasComportamentoSchema,
});

// Schema para Finalização
const finalizacaoSchema = z.object({
    outrasInformacoesRelevantes: z.string(),
    observacoesImpressoesTerapeuta: z.string(),
    expectativasFamilia: z.string().optional(),
});

// ============================================
// SCHEMA PRINCIPAL DA ANAMNESE
// ============================================

export const anamneseSchema = z.object({
    id: z.string().optional(),
    cabecalho: cabecalhoSchema,
    queixaDiagnostico: queixaDiagnosticoSchema,
    contextoFamiliarRotina: contextoFamiliarRotinaSchema,
    desenvolvimentoInicial: desenvolvimentoInicialSchema,
    atividadesVidaDiaria: atividadesVidaDiariaSchema,
    socialAcademico: socialAcademicoSchema,
    comportamento: comportamentoSchema,
    finalizacao: finalizacaoSchema,
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

// ============================================
// TIPOS INFERIDOS
// ============================================

export type AnamneseValidada = z.infer<typeof anamneseSchema>;

// ============================================
// INTERFACE DE RESULTADO DE VALIDAÇÃO
// ============================================

export interface ValidationResult {
    success: boolean;
    errors: ValidationError[];
    data?: AnamneseValidada;
}

// ============================================
// FUNÇÃO DE VALIDAÇÃO
// ============================================

/**
 * Valida os dados da anamnese
 * @param data Dados da anamnese a serem validados
 * @returns Resultado da validação com erros formatados
 */
export function validateAnamnese(data: unknown): ValidationResult {
    const result = anamneseSchema.safeParse(data);
    
    if (result.success) {
        return {
            success: true,
            errors: [],
            data: result.data,
        };
    }
    
    // Formatar erros do Zod para formato amigável
    const errors: ValidationError[] = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
    
    return {
        success: false,
        errors,
    };
}

/**
 * Valida apenas campos obrigatórios mínimos
 * Útil para salvar rascunho
 */
export function validateAnamneseMinimal(data: Partial<Anamnese>): ValidationResult {
    const minimalSchema = z.object({
        cabecalho: z.object({
            clienteId: z.string().min(1, 'Cliente é obrigatório'),
            profissionalId: z.string().min(1, 'Profissional é obrigatório'),
            dataEntrevista: z.string().min(1, 'Data da entrevista é obrigatória'),
        }),
    });
    
    const result = minimalSchema.safeParse(data);
    
    if (result.success) {
        return {
            success: true,
            errors: [],
        };
    }
    
    const errors: ValidationError[] = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
    
    return {
        success: false,
        errors,
    };
}

/**
 * Obtém erros de validação formatados para exibição
 */
export function getValidationErrorMessages(errors: ValidationError[]): string[] {
    return errors.map((err) => {
        // Traduzir nomes de campos para português
        const fieldTranslations: Record<string, string> = {
            'cabecalho.clienteId': 'Cliente',
            'cabecalho.profissionalId': 'Profissional responsável',
            'cabecalho.dataEntrevista': 'Data da entrevista',
            'cabecalho.informante': 'Informante',
            'cabecalho.parentesco': 'Parentesco',
            'queixaDiagnostico.queixaPrincipal': 'Queixa principal',
        };
        
        const fieldName = fieldTranslations[err.field] || err.field;
        return `${fieldName}: ${err.message}`;
    });
}
