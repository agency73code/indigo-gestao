/**
 * Tipos para a feature de Anamnese
 * Organizado por Steps conforme formulário modelo
 */

// ============================================
// CONSTANTES E TIPOS AUXILIARES
// ============================================

export const ESPECIALIDADES_MEDICAS = [
    'Pediatra',
    'Neurologista',
    'Psiquiatra',
    'Gastroenterologista',
    'Oftalmologista',
    'Dentista',
    'Psicólogo',
    'Fonoaudiólogo',
    'Terapeuta Ocupacional',
    'Fisioterapeuta',
    'Pedagogo',
    'Outro',
] as const;

export type EspecialidadeMedica = (typeof ESPECIALIDADES_MEDICAS)[number];

// Tipo para campos Sim/Não
export type SimNao = 'sim' | 'nao' | null;

// Tipo para campos com opção "Com ajuda"
export type SimNaoComAjuda = 'sim' | 'nao' | 'com_ajuda' | null;

// ============================================
// STEP 1 - IDENTIFICAÇÃO (CABEÇALHO)
// ============================================

export interface CuidadorAnamnese {
    id: string;
    nome: string;
    relacao: string;
    descricaoRelacao?: string;
    telefone?: string;
    email?: string;
    profissao?: string;
    escolaridade?: string;
    dataNascimento?: string;
}

export interface AnamnseeCabecalho {
    dataEntrevista: string;
    clienteId: string;
    clienteNome: string;
    dataNascimento: string;
    idade: string;
    informante: string;
    parentesco: string;
    parentescoDescricao?: string;
    quemIndicou: string;
    profissionalId: string;
    profissionalNome: string;
    cuidadores?: CuidadorAnamnese[];
}

// ============================================
// STEP 2 - QUEIXA E DIAGNÓSTICO (itens 1-7)
// ============================================

export interface EspecialidadeConsultada {
    id: string;
    especialidade: EspecialidadeMedica;
    nome: string;
    data: string;
    observacao?: string;
    ativo: boolean; // Ainda consulta este profissional?
}

export interface MedicamentoEmUso {
    id: string;
    nome: string;
    dosagem: string;
    dataInicio: string; // Data de início do uso
    motivo: string;
}

export interface ExamePrevio {
    id: string;
    nome: string;
    data: string;
    resultado: string;
    arquivos?: ArquivoAnexo[]; // Fotos/documentos do exame
}

// Tipo para arquivos anexados
export interface ArquivoAnexo {
    id: string;
    nome: string;
    tipo: string; // MIME type
    tamanho: number;
    url?: string; // URL após upload
    file?: File; // Arquivo local antes do upload
}

export interface TerapiaPrevia {
    id: string;
    profissional: string;
    especialidadeAbordagem: string;
    tempoIntervencao: string;
    observacao?: string;
    ativo: boolean; // Ainda realiza esta terapia?
}

export interface AnamneseQueixaDiagnostico {
    queixaPrincipal: string;
    diagnosticoPrevio: string;
    suspeitaCondicaoAssociada: string;
    especialidadesConsultadas: EspecialidadeConsultada[];
    medicamentosEmUso: MedicamentoEmUso[];
    examesPrevios: ExamePrevio[];
    terapiasPrevias: TerapiaPrevia[];
}

// ============================================
// STEP 3 - CONTEXTO FAMILIAR E ROTINA (itens 8, 9)
// ============================================

export interface HistoricoFamiliar {
    id: string;
    condicaoDiagnostico: string;
    parentesco: string;
    observacao: string;
}

export interface AtividadeRotina {
    id: string;
    atividade: string;
    horario: string; // Horário de realização (obrigatório)
    responsavel: string; // Responsável pela atividade
    frequencia: string;
    observacao: string;
}

export interface AnamneseContextoFamiliarRotina {
    historicosFamiliares: HistoricoFamiliar[];
    atividadesRotina: AtividadeRotina[];
}

// ============================================
// STEP 4 - DESENVOLVIMENTO INICIAL (itens 10, 11, 12)
// ============================================

// Item 10 - Gestação e Parto
export interface GestacaoParto {
    tipoParto: 'cesarea' | 'natural' | null;
    semanas: string;
    apgar1min: string;
    apgar5min: string;
    intercorrencias: string;
}

// Item 11 - Desenvolvimento Neuropsicomotor
export interface DesenvolvimentoNeuropsicomotor {
    sustentouCabeca: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    rolou: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    sentou: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    engatinhou: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    andouComApoio: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    andouSemApoio: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    correu: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    andouDeMotoca: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    andouDeBicicleta: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    subiuEscadasSozinho: { meses: string; naoRealiza: boolean; naoSoubeInformar: boolean };
    motricidadeFina: string;
}

// Item 12 - Desenvolvimento da Fala e Linguagem
export interface DesenvolvimentoFalaLinguagem {
    balbuciou: { meses: string; nao: boolean; naoSoubeInformar: boolean };
    primeirasPalavras: { meses: string; nao: boolean; naoSoubeInformar: boolean };
    primeirasFrases: { meses: string; nao: boolean; naoSoubeInformar: boolean };
    apontouParaFazerPedidos: { meses: string; nao: boolean; naoSoubeInformar: boolean };
    fazUsoDeGestos: SimNao;
    fazUsoDeGestosQuais: string;
    // Audição
    audicao: 'boa' | 'ruim' | null;
    teveOtiteDeRepeticao: SimNao;
    otiteVezes: string;
    otitePeriodoMeses: string;
    otiteFrequencia: string;
    fazOuFezUsoTuboVentilacao: SimNao;
    tuboVentilacaoObservacao: string;
    // Hábitos orais
    fazOuFezUsoObjetoOral: SimNao;
    objetoOralEspecificar: string;
    usaMamadeira: SimNao;
    mamadeiraHa: string;
    mamadeiraVezesAoDia: string;
    // Comunicação atual
    comunicacaoAtual: string;
}

export interface AnamneseDesenvolvimentoInicial {
    gestacaoParto: GestacaoParto;
    neuropsicomotor: DesenvolvimentoNeuropsicomotor;
    falaLinguagem: DesenvolvimentoFalaLinguagem;
}

// ============================================
// STEP 5 - ATIVIDADES DE VIDA DIÁRIA (itens 13, 14, 15, 16)
// ============================================

// Item 13 - Desfralde
export interface Desfralde {
    desfraldeDiurnoUrina: { anos: string; meses: string; utilizaFralda: boolean };
    desfraldeNoturnoUrina: { anos: string; meses: string; utilizaFralda: boolean };
    desfraldeFezes: { anos: string; meses: string; utilizaFralda: boolean };
    seLimpaSozinhoUrinar: SimNao;
    seLimpaSozinhoDefecar: SimNao;
    lavaAsMaosAposUsoBanheiro: SimNao;
    apresentaAlteracaoHabitoIntestinal: SimNao;
    observacoes: string;
}

// Item 14 - Sono
export interface Sono {
    dormemMediaHorasNoite: string;
    dormemMediaHorasDia: string;
    periodoSonoDia: 'manha' | 'tarde' | null;
    temDificuldadeIniciarSono: SimNao;
    acordaDeMadrugada: SimNao;
    dormeNaPropriaCama: SimNao;
    dormeNoProprioQuarto: SimNao;
    apresentaSonoAgitado: SimNao;
    eSonambulo: SimNao;
    observacoes: string;
}

// Item 15 - Hábitos Diários de Higiene
export interface HabitosHigiene {
    tomaBanhoLavaCorpoTodo: SimNaoComAjuda;
    secaCorpoTodo: SimNaoComAjuda;
    retiraTodasPecasRoupa: SimNaoComAjuda;
    colocaTodasPecasRoupa: SimNaoComAjuda;
    poeCalcadosSemCadarco: SimNaoComAjuda;
    poeCalcadosComCadarco: SimNaoComAjuda;
    escovaOsDentes: SimNaoComAjuda;
    penteiaOCabelo: SimNaoComAjuda;
    observacoes: string;
}

// Item 16 - Alimentação
export interface Alimentacao {
    apresentaQueixaAlimentacao: SimNao;
    seAlimentaSozinho: SimNao;
    eSeletivoQuantoAlimentos: SimNao;
    passaDiaInteiroSemComer: SimNao;
    apresentaRituaisParaAlimentar: SimNao;
    estaAbaixoOuAcimaPeso: SimNao;
    estaAbaixoOuAcimaPesoDescricao: string;
    temHistoricoAnemia: SimNao;
    temHistoricoAnemiaDescricao: string;
    rotinaAlimentarEProblemaFamilia: SimNao;
    rotinaAlimentarEProblemaFamiliaDescricao: string;
    observacoes: string;
}

export interface AnamneseAtividadesVidaDiaria {
    desfralde: Desfralde;
    sono: Sono;
    habitosHigiene: HabitosHigiene;
    alimentacao: Alimentacao;
}

// ============================================
// STEP 6 - SOCIAL E ACADÊMICO (itens 17, 18)
// ============================================

// Item 17 - Desenvolvimento Social
export interface DesenvolvimentoSocial {
    possuiAmigosMesmaIdadeEscola: SimNao;
    possuiAmigosMesmaIdadeForaEscola: SimNao;
    fazUsoFuncionalBrinquedos: SimNao;
    brincaProximoAosColegas: SimNao;
    brincaConjuntaComColegas: SimNao;
    procuraColegasEspontaneamente: SimNao;
    seVerbalIniciaConversa: SimNao;
    seVerbalRespondePerguntasSimples: SimNao;
    fazPedidosQuandoNecessario: SimNao;
    estabeleceContatoVisualAdultos: SimNao;
    estabeleceContatoVisualCriancas: SimNao;
    observacoes: string;
}

// Item 18 - Desenvolvimento Acadêmico
export interface DesenvolvimentoAcademico {
    escola: string;
    ano: string;
    periodo: string;
    direcao: string;
    coordenacao: string;
    professoraPrincipal: string;
    professoraAssistente: string;
    frequentaEscolaRegular: SimNao;
    frequentaEscolaEspecial: SimNao;
    acompanhaTurmaDemandasPedagogicas: SimNao;
    segueRegrasRotinaSalaAula: SimNao;
    necessitaApoioAT: SimNao;
    necessitaAdaptacaoMateriais: SimNao;
    necessitaAdaptacaoCurricular: SimNao;
    houveReprovacaoRetencao: SimNao;
    escolaPossuiEquipeInclusao: SimNao;
    haIndicativoDeficienciaIntelectual: SimNao;
    escolaApresentaQueixaComportamental: SimNao;
    // Campos descritivos
    adaptacaoEscolar: string;
    dificuldadesEscolares: string;
    relacionamentoComColegas: string;
    observacoes: string;
}

export interface AnamneseSocialAcademico {
    desenvolvimentoSocial: DesenvolvimentoSocial;
    desenvolvimentoAcademico: DesenvolvimentoAcademico;
}

// ============================================
// STEP 7 - COMPORTAMENTO (itens 19, 20)
// ============================================

// Item 19 - Estereotipias, Tiques, Rituais e Rotinas
export interface EstereotipiasRituais {
    balancaMaosLadoCorpoOuFrente: SimNao;
    balancaCorpoFrenteParaTras: SimNao;
    pulaOuGiraEmTornoDeSi: SimNao;
    repeteSonsSemFuncaoComunicativa: SimNao;
    repeteMovimentosContinuos: SimNao;
    exploraAmbienteLambendoTocando: SimNao;
    procuraObservarObjetosCantoOlho: SimNao;
    organizaObjetosLadoALado: SimNao;
    realizaTarefasSempreMesmaOrdem: SimNao;
    apresentaRituaisDiarios: SimNao;
    observacoesTopografias: string;
}

// Item 20 - Problemas de Comportamento
export interface ProblemasComportamento {
    apresentaComportamentosAutoLesivos: SimNao;
    autoLesivosQuais: string;
    apresentaComportamentosHeteroagressivos: SimNao;
    heteroagressivosQuais: string;
    apresentaDestruicaoPropriedade: SimNao;
    destruicaoDescrever: string;
    necessitouContencaoMecanica: SimNao;
    observacoesTopografias: string;
}

export interface AnamneseComportamento {
    estereotipiasRituais: EstereotipiasRituais;
    problemasComportamento: ProblemasComportamento;
}

// ============================================
// STEP 8 - FINALIZAÇÃO (itens 21, 22)
// ============================================

export interface AnamneseFinalizacao {
    outrasInformacoesRelevantes: string;
    observacoesImpressoesTerapeuta: string;
    expectativasFamilia: string;
}

// ============================================
// INTERFACE PRINCIPAL DA ANAMNESE
// ============================================

export interface Anamnese {
    id?: string;
    cabecalho: AnamnseeCabecalho;
    queixaDiagnostico: AnamneseQueixaDiagnostico;
    contextoFamiliarRotina: AnamneseContextoFamiliarRotina;
    desenvolvimentoInicial: AnamneseDesenvolvimentoInicial;
    atividadesVidaDiaria: AnamneseAtividadesVidaDiaria;
    socialAcademico: AnamneseSocialAcademico;
    comportamento: AnamneseComportamento;
    finalizacao: AnamneseFinalizacao;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================
// FORM DATA E STEPS
// ============================================

export interface AnamneseFormData extends Partial<Anamnese> {}

export const ANAMNESE_STEPS = [
    'Identificação',
    'Queixa e Diagnóstico',
    'Contexto Familiar',
    'Desenvolvimento Inicial',
    'Atividades de Vida Diária',
    'Social e Acadêmico',
    'Comportamento',
    'Finalização'
];
