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
  nome: z.string().optional(),
  tipo: z.string().optional(),
  tamanho: z.number().optional(),
  file: z.unknown().optional(),
});

const ExamePrevioSchema = z.object({
  nome: z.string().optional(),
  data: z.string().optional(),
  resultado: z.string().optional(),
  arquivos: z.array(ArquivoAnexoSchema).optional(),
});

const MedicamentoEmUsoSchema = z.object({
  nome: z.string().optional(),
  dosagem: z.string().optional(),
  dataInicio: z.string().optional(),
  motivo: z.string().optional(),
});

const TerapiaPreviaSchema = z.object({
  profissional: z.string().optional(),
  especialidadeAbordagem: z.string().optional(),
  tempoIntervencao: z.string().optional(),
  observacao: z.string().optional(),
  ativo: z.boolean().optional(),
});

const EspecialidadeConsultadaSchema = z.object({
  especialidade: z.string().optional(),
  nome: z.string().optional(),
  data: z.string().optional(),
  observacao: z.string().optional(),
  ativo: z.boolean().optional(),
});

const HistoricoFamiliarSchema = z.object({
  condicaoDiagnostico: z.string().optional(),
  parentesco: z.string().optional(),
  observacao: z.string().optional(),
});

const AtividadeRotinaSchema = z.object({
  atividade: z.string().optional(),
  horario: z.string().optional(),
  responsavel: z.string().optional(),
  frequencia: z.string().optional(),
  observacao: z.string().optional(),
});

const MarcoDesenvolvimentoSchema = z.object({
  meses: z.string().optional(),
  naoRealiza: z.boolean().optional(),
  naoSoubeInformar: z.boolean().optional(),
});

const MarcoFalaSchema = z.object({
  meses: z.string().optional(),
  nao: z.boolean().optional(),
  naoSoubeInformar: z.boolean().optional(),
});

const GestacaoPartoSchema = z.object({
  tipoParto: z
    .enum(["natural", "cesarea"], "Tipo de parto é obrigatório."),
  semanas: z.number("Número de semanas da gestação é obrigatório."),
  apgar1min: z.number("Apgar de 1 minuto é obrigatório."),
  apgar5min: z.number("Apgar de 5 minutos é obrigatório."),
  intercorrencias: z.string().optional(),
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
  motricidadeFina: z.string().optional(),
});

const FalaLinguagemSchema = z.object({
  balbuciou: MarcoFalaSchema,
  primeirasPalavras: MarcoFalaSchema,
  primeirasFrases: MarcoFalaSchema,
  apontouParaFazerPedidos: MarcoFalaSchema,

  fazUsoDeGestos: simNaoSchema.optional(),
  fazUsoDeGestosQuais: z.string().optional(),
  
  comunicacaoAtual: z.string().optional(),

  audicao: z.enum(["boa", "ruim"]).optional(),

  teveOtiteDeRepeticao: simNaoSchema.optional(),
  otiteVezes: optionalNumberFromString,
  otitePeriodoMeses: optionalNumberFromString,
  otiteFrequencia: z.string().optional(),

  fazOuFezUsoTuboVentilacao: simNaoSchema.optional(),
  tuboVentilacaoObservacao: z.string().optional(),

  fazOuFezUsoObjetoOral: simNaoSchema.optional(),
  objetoOralEspecificar: z.string().optional(),

  usaMamadeira: simNaoSchema.optional(),
  mamadeiraHa: z.string().optional(),
  mamadeiraVezesAoDia: optionalNumberFromString,
});

const DesfraldeItemSchema = z.object({
    anos: z.string().optional(),
    meses: z.string().optional(),
    utilizaFralda: z.boolean().optional(),
});

const DesfraldeSchema = z.object({
    desfraldeDiurnoUrina: DesfraldeItemSchema,
    desfraldeNoturnoUrina: DesfraldeItemSchema,
    desfraldeFezes: DesfraldeItemSchema,

    seLimpaSozinhoUrinar: simNaoSchema.optional(),
    seLimpaSozinhoDefecar: simNaoSchema.optional(),
    lavaAsMaosAposUsoBanheiro: simNaoSchema.optional(),
    apresentaAlteracaoHabitoIntestinal: simNaoSchema.optional(),

    observacoes: z.string().optional(),
});

const SonoSchema = z.object({
    dormemMediaHorasNoite: z.string().optional(),
    dormemMediaHorasDia: z.string().optional(),

    periodoSonoDia: z.enum(["manha", "tarde"]).optional(),

    temDificuldadeIniciarSono: simNaoSchema.optional(),
    acordaDeMadrugada: simNaoSchema.optional(),
    dormeNaPropriaCama: simNaoSchema.optional(),
    dormeNoProprioQuarto: simNaoSchema.optional(),
    apresentaSonoAgitado: simNaoSchema.optional(),
    eSonambulo: simNaoSchema.optional(),

    observacoes: z.string().optional(),
});

const HabitosHigieneSchema = z.object({
    tomaBanhoLavaCorpoTodo: simNaoComAjudaSchema.optional(),
    secaCorpoTodo: simNaoComAjudaSchema.optional(),
    retiraTodasPecasRoupa: simNaoComAjudaSchema.optional(),
    colocaTodasPecasRoupa: simNaoComAjudaSchema.optional(),
    poeCalcadosSemCadarco: simNaoComAjudaSchema.optional(),
    poeCalcadosComCadarco: simNaoComAjudaSchema.optional(),
    escovaOsDentes: simNaoComAjudaSchema.optional(),
    penteiaOCabelo: simNaoComAjudaSchema.optional(),

    observacoes: z.string().optional(),
});

const AlimentacaoSchema = z.object({
    apresentaQueixaAlimentacao: simNaoSchema.optional(),
    seAlimentaSozinho: simNaoSchema.optional(),
    eSeletivoQuantoAlimentos: simNaoSchema.optional(),
    passaDiaInteiroSemComer: simNaoSchema.optional(),
    apresentaRituaisParaAlimentar: simNaoSchema.optional(),
    estaAbaixoOuAcimaPeso: simNaoSchema.optional(),

    estaAbaixoOuAcimaPesoDescricao: z.string().optional(),

    temHistoricoAnemia: simNaoSchema.optional(),
    temHistoricoAnemiaDescricao: z.string().optional(),

    rotinaAlimentarEProblemaFamilia: simNaoSchema.optional(),
    rotinaAlimentarEProblemaFamiliaDescricao: z.string().optional(),

    observacoes: z.string().optional(),
});

const DesenvolvimentoSocialSchema = z.object({
    possuiAmigosMesmaIdadeEscola: simNaoSchema.optional(),
    possuiAmigosMesmaIdadeForaEscola: simNaoSchema.optional(),
    fazUsoFuncionalBrinquedos: simNaoSchema.optional(),
    brincaProximoAosColegas: simNaoSchema.optional(),
    brincaConjuntaComColegas: simNaoSchema.optional(),
    procuraColegasEspontaneamente: simNaoSchema.optional(),
    seVerbalIniciaConversa: simNaoSchema.optional(),
    seVerbalRespondePerguntasSimples: simNaoSchema.optional(),
    fazPedidosQuandoNecessario: simNaoSchema.optional(),
    estabeleceContatoVisualAdultos: simNaoSchema.optional(),
    estabeleceContatoVisualCriancas: simNaoSchema.optional(),
    observacoes: z.string().optional(),
});

const DesenvolvimentoAcademicoSchema = z.object({
    ano: z.number().optional(),
    periodo: z.string().optional(),
    direcao: z.string().optional(),
    coordenacao: z.string().optional(),
    professoraPrincipal: z.string().optional(),
    professoraAssistente: z.string().optional(),

    frequentaEscolaRegular: simNaoSchema.optional(),
    frequentaEscolaEspecial: simNaoSchema.optional(),
    acompanhaTurmaDemandasPedagogicas: simNaoSchema.optional(),
    segueRegrasRotinaSalaAula: simNaoSchema.optional(),
    necessitaApoioAT: simNaoSchema.optional(),
    necessitaAdaptacaoMateriais: simNaoSchema.optional(),
    necessitaAdaptacaoCurricular: simNaoSchema.optional(),
    houveReprovacaoRetencao: simNaoSchema.optional(),
    escolaPossuiEquipeInclusao: simNaoSchema.optional(),
    haIndicativoDeficienciaIntelectual: simNaoSchema.optional(),
    escolaApresentaQueixaComportamental: simNaoSchema.optional(),

    adaptacaoEscolar: z.string().optional(),
    dificuldadesEscolares: z.string().optional(),
    relacionamentoComColegas: z.string().optional(),
    observacoes: z.string().optional(),
});

const EstereotipiasRituaisSchema = z.object({
    balancaMaosLadoCorpoOuFrente: simNaoSchema.optional(),
    balancaCorpoFrenteParaTras: simNaoSchema.optional(),
    pulaOuGiraEmTornoDeSi: simNaoSchema.optional(),
    repeteSonsSemFuncaoComunicativa: simNaoSchema.optional(),
    repeteMovimentosContinuos: simNaoSchema.optional(),
    exploraAmbienteLambendoTocando: simNaoSchema.optional(),
    procuraObservarObjetosCantoOlho: simNaoSchema.optional(),
    organizaObjetosLadoALado: simNaoSchema.optional(),
    realizaTarefasSempreMesmaOrdem: simNaoSchema.optional(),
    apresentaRituaisDiarios: simNaoSchema.optional(),

    observacoesTopografias: z.string().optional(),
});

const ProblemasComportamentoSchema = z.object({
    apresentaComportamentosAutoLesivos: simNaoSchema.optional(),
    autoLesivosQuais: z.string().optional(),

    apresentaComportamentosHeteroagressivos: simNaoSchema.optional(),
    heteroagressivosQuais: z.string().optional(),

    apresentaDestruicaoPropriedade: simNaoSchema.optional(),
    destruicaoDescrever: z.string().optional(),

    necessitouContencaoMecanica: simNaoSchema.optional(),

    observacoesTopografias: z.string().optional(),
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
    quemIndicou: z.string().optional(),
    profissionalId: z
        .uuid("ID de profissional inválido."),
    parentescoDescricao: z.string().optional(),
});

export const QueixaDiagnosticoSchema = z.object({
    queixaPrincipal: z
        .string()
        .min(1, "Queixa principal é obrigatória."),
    diagnosticoPrevio: z.string().optional(),
    suspeitaCondicaoAssociada: z.string().optional(),
    especialidadesConsultadas: z
        .array(EspecialidadeConsultadaSchema)
        .optional(),
    medicamentosEmUso: z
        .array(MedicamentoEmUsoSchema)
        .optional(),
    examesPrevios: z
        .array(ExamePrevioSchema)
        .optional(),
    terapiasPrevias: z
        .array(TerapiaPreviaSchema)
        .optional(),
});

export const ContextoFamiliarRotinaSchema = z.object({
    historicosFamiliares: z.array(HistoricoFamiliarSchema).optional(),
    atividadesRotina: z.array(AtividadeRotinaSchema).optional(),
});

export const DesenvolvimentoInicialSchema = z.object({
    gestacaoParto: GestacaoPartoSchema,
    neuropsicomotor: NeuropsicomotorSchema,
    falaLinguagem: FalaLinguagemSchema,
});

export const AtividadesVidaDiariaSchema = z.object({
    desfralde: DesfraldeSchema.optional(),
    sono: SonoSchema.optional(),
    habitosHigiene: HabitosHigieneSchema.optional(),
    alimentacao: AlimentacaoSchema.optional(),
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
    outrasInformacoesRelevantes: z.string().optional(),
    observacoesImpressoesTerapeuta: z.string().optional(),
    expectativasFamilia: z.string().optional(),
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