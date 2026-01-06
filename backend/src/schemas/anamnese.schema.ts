import { z } from 'zod';

const simNaoSchema = z.enum(['sim', 'nao']);
const simNaoComAjudaSchema = z.enum(["sim", "com_ajuda", "nao"]);

const optionalNumberFromString = z.preprocess(
  (v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    return Number(v);
  },
  z.number().optional()
);

const ArquivoAnexoSchema = z.object({
  nome: z.string().optional().nullable(),
  tipo: z.string().optional().nullable(),
  tamanho: z.number().optional().nullable(),
  file: z.unknown().optional().nullable(),
});

const ExamePrevioSchema = z.object({
  nome: z.string().optional().nullable(),
  data: z.string().optional().nullable(),
  resultado: z.string().optional().nullable(),
  arquivos: z.array(ArquivoAnexoSchema).optional().nullable(),
});

const MedicamentoEmUsoSchema = z.object({
  nome: z.string().optional().nullable(),
  dosagem: z.string().optional().nullable(),
  dataInicio: z.string().optional().nullable(),
  motivo: z.string().optional().nullable(),
});

const TerapiaPreviaSchema = z.object({
  profissional: z.string().optional().nullable(),
  especialidadeAbordagem: z.string().optional().nullable(),
  tempoIntervencao: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
  ativo: z.boolean().optional().nullable(),
});

const EspecialidadeConsultadaSchema = z.object({
  especialidade: z.string().optional().nullable(),
  nome: z.string().optional().nullable(),
  data: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
  ativo: z.boolean().optional().nullable(),
});

const HistoricoFamiliarSchema = z.object({
  condicaoDiagnostico: z.string().optional().nullable(),
  parentesco: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

const AtividadeRotinaSchema = z.object({
  atividade: z.string().optional().nullable(),
  horario: z.string().optional().nullable(),
  responsavel: z.string().optional().nullable(),
  frequencia: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

const MarcoDesenvolvimentoSchema = z.object({
  meses: z.string().optional().nullable(),
  naoRealiza: z.boolean().optional().nullable(),
  naoSoubeInformar: z.boolean().optional().nullable(),
});

const MarcoFalaSchema = z.object({
  meses: z.string().optional().nullable(),
  nao: z.boolean().optional().nullable(),
  naoSoubeInformar: z.boolean().optional().nullable(),
});

const GestacaoPartoSchema = z.object({
  tipoParto: z
    .enum(["natural", "cesarea"], "Tipo de parto é obrigatório."),
  semanas: z.number("Número de semanas da gestação é obrigatório."),
  apgar1min: z.number("Apgar de 1 minuto é obrigatório."),
  apgar5min: z.number("Apgar de 5 minutos é obrigatório."),
  intercorrencias: z.string().optional().nullable(),
});

const NeuropsicomotorSchema = z.object({
  sustentouCabeca: MarcoDesenvolvimentoSchema,
  rolou: MarcoDesenvolvimentoSchema,
  sentou: MarcoDesenvolvimentoSchema,
  engatinhou: MarcoDesenvolvimentoSchema,
  andouComApoio: MarcoDesenvolvimentoSchema,
  andouSemApoio: MarcoDesenvolvimentoSchema,
  correu: MarcoDesenvolvimentoSchema,
  andouDeMotoca: MarcoDesenvolvimentoSchema,
  andouDeBicicleta: MarcoDesenvolvimentoSchema,
  subiuEscadasSozinho: MarcoDesenvolvimentoSchema,
  motricidadeFina: z.string().optional().nullable(),
});

const FalaLinguagemSchema = z.object({
  balbuciou: MarcoFalaSchema,
  primeirasPalavras: MarcoFalaSchema,
  primeirasFrases: MarcoFalaSchema,
  apontouParaFazerPedidos: MarcoFalaSchema,

  fazUsoDeGestos: simNaoSchema.optional().nullable(),
  fazUsoDeGestosQuais: z.string().optional().nullable(),
  
  comunicacaoAtual: z.string().optional().nullable(),

  audicao: z.enum(["boa", "ruim"]).optional().nullable(),

  teveOtiteDeRepeticao: simNaoSchema.optional().nullable(),
  otiteVezes: optionalNumberFromString,
  otitePeriodoMeses: optionalNumberFromString,
  otiteFrequencia: z.string().optional().nullable(),

  fazOuFezUsoTuboVentilacao: simNaoSchema.optional().nullable(),
  tuboVentilacaoObservacao: z.string().optional().nullable(),

  fazOuFezUsoObjetoOral: simNaoSchema.optional().nullable(),
  objetoOralEspecificar: z.string().optional().nullable(),

  usaMamadeira: simNaoSchema.optional().nullable(),
  mamadeiraHa: z.string().optional().nullable(),
  mamadeiraVezesAoDia: optionalNumberFromString,
});

const DesfraldeItemSchema = z.object({
    anos: z.string().optional().nullable(),
    meses: z.string().optional().nullable(),
    utilizaFralda: z.boolean().optional().nullable(),
});

const DesfraldeSchema = z.object({
    desfraldeDiurnoUrina: DesfraldeItemSchema,
    desfraldeNoturnoUrina: DesfraldeItemSchema,
    desfraldeFezes: DesfraldeItemSchema,

    seLimpaSozinhoUrinar: simNaoSchema.optional().nullable(),
    seLimpaSozinhoDefecar: simNaoSchema.optional().nullable(),
    lavaAsMaosAposUsoBanheiro: simNaoSchema.optional().nullable(),
    apresentaAlteracaoHabitoIntestinal: simNaoSchema.optional().nullable(),

    observacoes: z.string().optional().nullable(),
});

const SonoSchema = z.object({
    dormemMediaHorasNoite: z.string().optional().nullable(),
    dormemMediaHorasDia: z.string().optional().nullable(),

    periodoSonoDia: z.enum(["manha", "tarde"]).optional().nullable(),

    temDificuldadeIniciarSono: simNaoSchema.optional().nullable(),
    acordaDeMadrugada: simNaoSchema.optional().nullable(),
    dormeNaPropriaCama: simNaoSchema.optional().nullable(),
    dormeNoProprioQuarto: simNaoSchema.optional().nullable(),
    apresentaSonoAgitado: simNaoSchema.optional().nullable(),
    eSonambulo: simNaoSchema.optional().nullable(),

    observacoes: z.string().optional().nullable(),
});

const HabitosHigieneSchema = z.object({
    tomaBanhoLavaCorpoTodo: simNaoComAjudaSchema.optional().nullable(),
    secaCorpoTodo: simNaoComAjudaSchema.optional().nullable(),
    retiraTodasPecasRoupa: simNaoComAjudaSchema.optional().nullable(),
    colocaTodasPecasRoupa: simNaoComAjudaSchema.optional().nullable(),
    poeCalcadosSemCadarco: simNaoComAjudaSchema.optional().nullable(),
    poeCalcadosComCadarco: simNaoComAjudaSchema.optional().nullable(),
    escovaOsDentes: simNaoComAjudaSchema.optional().nullable(),
    penteiaOCabelo: simNaoComAjudaSchema.optional().nullable(),

    observacoes: z.string().optional().nullable(),
});

const AlimentacaoSchema = z.object({
    apresentaQueixaAlimentacao: simNaoSchema.optional().nullable(),
    seAlimentaSozinho: simNaoSchema.optional().nullable(),
    eSeletivoQuantoAlimentos: simNaoSchema.optional().nullable(),
    passaDiaInteiroSemComer: simNaoSchema.optional().nullable(),
    apresentaRituaisParaAlimentar: simNaoSchema.optional().nullable(),
    estaAbaixoOuAcimaPeso: simNaoSchema.optional().nullable(),

    estaAbaixoOuAcimaPesoDescricao: z.string().optional().nullable(),

    temHistoricoAnemia: simNaoSchema.optional().nullable(),
    temHistoricoAnemiaDescricao: z.string().optional().nullable(),

    rotinaAlimentarEProblemaFamilia: simNaoSchema.optional().nullable(),
    rotinaAlimentarEProblemaFamiliaDescricao: z.string().optional().nullable(),

    observacoes: z.string().optional().nullable(),
});

const DesenvolvimentoSocialSchema = z.object({
    possuiAmigosMesmaIdadeEscola: simNaoSchema.optional().nullable(),
    possuiAmigosMesmaIdadeForaEscola: simNaoSchema.optional().nullable(),
    fazUsoFuncionalBrinquedos: simNaoSchema.optional().nullable(),
    brincaProximoAosColegas: simNaoSchema.optional().nullable(),
    brincaConjuntaComColegas: simNaoSchema.optional().nullable(),
    procuraColegasEspontaneamente: simNaoSchema.optional().nullable(),
    seVerbalIniciaConversa: simNaoSchema.optional().nullable(),
    seVerbalRespondePerguntasSimples: simNaoSchema.optional().nullable(),
    fazPedidosQuandoNecessario: simNaoSchema.optional().nullable(),
    estabeleceContatoVisualAdultos: simNaoSchema.optional().nullable(),
    estabeleceContatoVisualCriancas: simNaoSchema.optional().nullable(),
    observacoes: z.string().optional().nullable(),
});

const DesenvolvimentoAcademicoSchema = z.object({
    ano: z.number().optional().nullable(),
    periodo: z.string().optional().nullable(),
    direcao: z.string().optional().nullable(),
    coordenacao: z.string().optional().nullable(),
    professoraPrincipal: z.string().optional().nullable(),
    professoraAssistente: z.string().optional().nullable(),

    frequentaEscolaRegular: simNaoSchema.optional().nullable(),
    frequentaEscolaEspecial: simNaoSchema.optional().nullable(),
    acompanhaTurmaDemandasPedagogicas: simNaoSchema.optional().nullable(),
    segueRegrasRotinaSalaAula: simNaoSchema.optional().nullable(),
    necessitaApoioAT: simNaoSchema.optional().nullable(),
    necessitaAdaptacaoMateriais: simNaoSchema.optional().nullable(),
    necessitaAdaptacaoCurricular: simNaoSchema.optional().nullable(),
    houveReprovacaoRetencao: simNaoSchema.optional().nullable(),
    escolaPossuiEquipeInclusao: simNaoSchema.optional().nullable(),
    haIndicativoDeficienciaIntelectual: simNaoSchema.optional().nullable(),
    escolaApresentaQueixaComportamental: simNaoSchema.optional().nullable(),

    adaptacaoEscolar: z.string().optional().nullable(),
    dificuldadesEscolares: z.string().optional().nullable(),
    relacionamentoComColegas: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable(),
});

const EstereotipiasRituaisSchema = z.object({
    balancaMaosLadoCorpoOuFrente: simNaoSchema.optional().nullable(),
    balancaCorpoFrenteParaTras: simNaoSchema.optional().nullable(),
    pulaOuGiraEmTornoDeSi: simNaoSchema.optional().nullable(),
    repeteSonsSemFuncaoComunicativa: simNaoSchema.optional().nullable(),
    repeteMovimentosContinuos: simNaoSchema.optional().nullable(),
    exploraAmbienteLambendoTocando: simNaoSchema.optional().nullable(),
    procuraObservarObjetosCantoOlho: simNaoSchema.optional().nullable(),
    organizaObjetosLadoALado: simNaoSchema.optional().nullable(),
    realizaTarefasSempreMesmaOrdem: simNaoSchema.optional().nullable(),
    apresentaRituaisDiarios: simNaoSchema.optional().nullable(),

    observacoesTopografias: z.string().optional().nullable(),
});

const ProblemasComportamentoSchema = z.object({
    apresentaComportamentosAutoLesivos: simNaoSchema.optional().nullable(),
    autoLesivosQuais: z.string().optional().nullable(),

    apresentaComportamentosHeteroagressivos: simNaoSchema.optional().nullable(),
    heteroagressivosQuais: z.string().optional().nullable(),

    apresentaDestruicaoPropriedade: simNaoSchema.optional().nullable(),
    destruicaoDescrever: z.string().optional().nullable(),

    necessitouContencaoMecanica: simNaoSchema.optional().nullable(),

    observacoesTopografias: z.string().optional().nullable(),
});

// SCHEMAS

export const CabecalhoSchema = z.object({
    dataEntrevista: z
        .string()
        .min(1, "Data da entrevista é obrigatória."),
    clienteId: z
        .uuid("ID de cliente inválido."),
    informante: z
        .string()
        .min(1, "Nome do informante é obrigatório."),
    parentesco: z
        .string()
        .min(1, "Parentesco é obrigatório."),
    quemIndicou: z.string().optional().nullable(),
    profissionalId: z
        .uuid("ID de profissional inválido."),
    parentescoDescricao: z.string().optional().nullable(),
});

export const QueixaDiagnosticoSchema = z.object({
    queixaPrincipal: z
        .string()
        .min(1, "Queixa principal é obrigatória."),
    diagnosticoPrevio: z.string().optional().nullable(),
    suspeitaCondicaoAssociada: z.string().optional().nullable(),
    especialidadesConsultadas: z
        .array(EspecialidadeConsultadaSchema)
        .optional().nullable(),
    medicamentosEmUso: z
        .array(MedicamentoEmUsoSchema)
        .optional().nullable(),
    examesPrevios: z
        .array(ExamePrevioSchema)
        .optional().nullable(),
    terapiasPrevias: z
        .array(TerapiaPreviaSchema)
        .optional().nullable(),
});

export const ContextoFamiliarRotinaSchema = z.object({
    historicosFamiliares: z.array(HistoricoFamiliarSchema).optional().nullable(),
    atividadesRotina: z.array(AtividadeRotinaSchema).optional().nullable(),
});

export const DesenvolvimentoInicialSchema = z.object({
    gestacaoParto: GestacaoPartoSchema,
    neuropsicomotor: NeuropsicomotorSchema,
    falaLinguagem: FalaLinguagemSchema,
});

export const AtividadesVidaDiariaSchema = z.object({
    desfralde: DesfraldeSchema.optional().nullable(),
    sono: SonoSchema.optional().nullable(),
    habitosHigiene: HabitosHigieneSchema.optional().nullable(),
    alimentacao: AlimentacaoSchema.optional().nullable(),
});

export const SocialAcademicoSchema = z.object({
    desenvolvimentoSocial: DesenvolvimentoSocialSchema,
    desenvolvimentoAcademico: DesenvolvimentoAcademicoSchema,
});

export const ComportamentoSchema = z.object({
    estereotipiasRituais: EstereotipiasRituaisSchema,
    problemasComportamento: ProblemasComportamentoSchema,
});

export const FinalizacaoSchema = z.object({
    outrasInformacoesRelevantes: z.string().optional().nullable(),
    observacoesImpressoesTerapeuta: z.string().optional().nullable(),
    expectativasFamilia: z.string().optional().nullable(),
});

export const AnamneseSchema = z.object({
  cabecalho: CabecalhoSchema,
  queixaDiagnostico: QueixaDiagnosticoSchema,
  contextoFamiliarRotina: ContextoFamiliarRotinaSchema,
  desenvolvimentoInicial: DesenvolvimentoInicialSchema,
  atividadesVidaDiaria: AtividadesVidaDiariaSchema,
  socialAcademico: SocialAcademicoSchema,
  comportamento: ComportamentoSchema,
  finalizacao: FinalizacaoSchema,
});

export type AnamnesePayload = z.infer<typeof AnamneseSchema>;