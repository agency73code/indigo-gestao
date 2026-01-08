/**
 * Tipos centralizados para feature de Anamnese
 * 
 * Este arquivo contém todas as interfaces base.
 * Cadastro, Consulta e Tabela devem importar daqui.
 */

// ============================================
// TIPOS PRIMITIVOS E CONSTANTES
// ============================================

export type ID = string;

export type SimNao = 'sim' | 'nao' | null;

export type SimNaoComAjuda = 'sim' | 'nao' | 'com_ajuda' | null;

export type Status = 'ATIVO' | 'INATIVO';

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

export const ANAMNESE_STEPS = [
    'Identificação',
    'Queixa e Diagnóstico',
    'Contexto Familiar',
    'Desenvolvimento Inicial',
    'Atividades de Vida Diária',
    'Social e Acadêmico',
    'Comportamento',
    'Finalização'
] as const;

// ============================================
// CUIDADOR
// ============================================

export interface Cuidador {
    id: ID;
    nome: string;
    relacao: string;
    descricaoRelacao?: string;
    cpf?: string;
    telefone?: string;
    email?: string;
    profissao?: string;
    escolaridade?: string;
    dataNascimento?: string;
}

// ============================================
// CABEÇALHO / IDENTIFICAÇÃO
// ============================================

export interface AnamnseeCabecalho {
    dataEntrevista: string;
    clienteId: ID;
    clienteNome: string;
    clienteAvatarUrl?: string;
    dataNascimento: string;
    idade: string;
    informante: string;
    parentesco: string;
    parentescoDescricao?: string;
    quemIndicou: string;
    profissionalId: ID;
    profissionalNome: string;
    cuidadores?: Cuidador[];
    escolaCliente?: string | null;
}

// ============================================
// QUEIXA E DIAGNÓSTICO
// ============================================

export interface EspecialidadeConsultada {
    id: ID;
    especialidade: string;
    nome: string;
    data: string;
    observacao?: string;
    ativo: boolean;
}

export interface MedicamentoEmUso {
    id: ID;
    nome: string;
    dosagem: string;
    dataInicio: string;
    motivo: string;
}

export interface ArquivoAnexo {
    id: ID;
    nome: string;
    tipo: string;
    tamanho: number;
    url?: string;
    file?: File;
}

export interface ExamePrevio {
    id: ID;
    nome: string;
    data: string;
    resultado: string;
    arquivos?: ArquivoAnexo[];
}

export interface TerapiaPrevia {
    id: ID;
    profissional: string;
    especialidadeAbordagem: string;
    tempoIntervencao: string;
    observacao?: string;
    ativo: boolean;
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
// CONTEXTO FAMILIAR E ROTINA
// ============================================

export interface HistoricoFamiliar {
    id: ID;
    condicaoDiagnostico?: string;
    condicao?: string; // alias para compatibilidade
    parentesco: string;
    observacao?: string;
}

export interface AtividadeRotina {
    id: ID;
    atividade: string;
    horario: string;
    responsavel?: string;
    frequencia?: string;
    observacao?: string;
}

export interface AnamneseContextoFamiliarRotina {
    historicosFamiliares?: HistoricoFamiliar[];
    historicoFamiliar?: HistoricoFamiliar[]; // alias para compatibilidade
    atividadesRotina?: AtividadeRotina[];
    rotinaDiaria?: AtividadeRotina[]; // alias para compatibilidade
    cuidadoresPrincipais?: string;
    tempoTela?: string;
}

// ============================================
// DESENVOLVIMENTO INICIAL
// ============================================

export interface GestacaoParto {
    tipoParto: 'cesarea' | 'natural' | string | null;
    semanas: number | null;
    apgar1min: number | null;
    apgar5min: number | null;
    intercorrencias: string;
}

export interface MarcoDesenvolvimento {
    meses: string;
    status?: 'realizado' | 'naoRealiza' | 'naoSoubeInformar';
    naoRealiza?: boolean;
    naoSoubeInformar?: boolean;
    nao?: boolean; // alias para compatibilidade com falaLinguagem
}

export interface DesenvolvimentoNeuropsicomotor {
    sustentouCabeca: MarcoDesenvolvimento;
    rolou: MarcoDesenvolvimento;
    sentou: MarcoDesenvolvimento;
    engatinhou: MarcoDesenvolvimento;
    andouComApoio: MarcoDesenvolvimento;
    andouSemApoio: MarcoDesenvolvimento;
    correu: MarcoDesenvolvimento;
    andouDeMotoca: MarcoDesenvolvimento;
    andouDeBicicleta: MarcoDesenvolvimento;
    subiuEscadasSozinho: MarcoDesenvolvimento;
    motricidadeFina: string;
}

export interface DesenvolvimentoFalaLinguagem {
    balbuciou: MarcoDesenvolvimento;
    primeirasPalavras: MarcoDesenvolvimento;
    primeirasFrases: MarcoDesenvolvimento;
    apontouParaFazerPedidos: MarcoDesenvolvimento;
    fazUsoDeGestos: SimNao;
    fazUsoDeGestosQuais: string;
    audicao: 'boa' | 'ruim' | string | null;
    teveOtiteDeRepeticao: SimNao;
    otiteVezes?: number | null;
    otitePeriodoMeses?: number | null;
    otiteFrequencia?: string;
    otiteDetalhes?: string; // alias consolidado
    fazOuFezUsoTuboVentilacao: SimNao;
    tuboVentilacaoObservacao: string;
    fazOuFezUsoObjetoOral: SimNao;
    objetoOralEspecificar: string;
    usaMamadeira: SimNao;
    mamadeiraHa?: string;
    mamadeiraVezesAoDia?: number | null;
    mamadeiraDetalhes?: string; // alias consolidado
    comunicacaoAtual: string;
}

export interface AnamneseDesenvolvimentoInicial {
    gestacaoParto: GestacaoParto;
    neuropsicomotor: DesenvolvimentoNeuropsicomotor;
    falaLinguagem: DesenvolvimentoFalaLinguagem;
}

// ============================================
// ATIVIDADES DE VIDA DIÁRIA
// ============================================

export interface DesfraldeTempo {
    anos: string;
    meses: string;
    utilizaFralda: boolean;
}

export interface Desfralde {
    desfraldeDiurnoUrina: DesfraldeTempo;
    desfraldeNoturnoUrina: DesfraldeTempo;
    desfraldeFezes: DesfraldeTempo;
    seLimpaSozinhoUrinar: SimNao;
    seLimpaSozinhoDefecar: SimNao;
    lavaAsMaosAposUsoBanheiro: SimNao;
    apresentaAlteracaoHabitoIntestinal: SimNao;
    observacoes: string;
}

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
// SOCIAL E ACADÊMICO
// ============================================

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

export interface DesenvolvimentoAcademico {
    escola: string;
    ano: number | string | null;
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
    adaptacaoEscolar: string;
    dificuldadesEscolares: string;
    relacionamentoComColegas: string;
    observacoes: string;
}

export interface AnamneseSocialAcademico {
    desenvolvimentoSocial?: DesenvolvimentoSocial;
    desenvolvimentoAcademico?: DesenvolvimentoAcademico;
}

// ============================================
// COMPORTAMENTO
// ============================================

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
// FINALIZAÇÃO
// ============================================

export interface AnamneseFinalizacao {
    outrasInformacoesRelevantes?: string;
    observacoesImpressoesTerapeuta?: string;
    expectativasFamilia: string;
}

// ============================================
// INTERFACE PRINCIPAL DA ANAMNESE
// ============================================

export interface AnamneseBase {
    id?: ID;
    cabecalho: AnamnseeCabecalho;
    queixaDiagnostico: AnamneseQueixaDiagnostico;
    contextoFamiliarRotina: AnamneseContextoFamiliarRotina;
    desenvolvimentoInicial: AnamneseDesenvolvimentoInicial;
    atividadesVidaDiaria: AnamneseAtividadesVidaDiaria;
    socialAcademico: AnamneseSocialAcademico;
    comportamento: AnamneseComportamento;
    finalizacao: AnamneseFinalizacao;
    status?: Status;
    createdAt?: string;
    updatedAt?: string;
}

// Alias para compatibilidade com código existente
export type Anamnese = AnamneseBase;

// ============================================
// TIPOS PARA LISTAGEM
// ============================================

export interface AnamneseListItem {
    id: ID;
    clienteId: ID;
    clienteNome: string;
    clienteAvatarUrl?: string;
    telefone?: string;
    dataNascimento?: string;
    responsavel?: string;
    dataEntrevista: string;
    profissionalNome: string;
    status: Status;
}

export interface AnamneseResumo {
    id: ID;
    clienteId: ID;
    clienteNome: string;
    clienteAvatarUrl?: string;
    dataNascimento?: string;
    dataEntrevista: string;
    profissionalId: ID;
    profissionalNome: string;
    status: Status;
}

// ============================================
// TIPOS PARA API
// ============================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface AnamneseResponse {
    success: boolean;
    data?: Anamnese;
    message?: string;
    errors?: ValidationError[];
}

export interface AnamneseListResponse {
    success: boolean;
    data: Anamnese[];
    total: number;
    page: number;
    limit: number;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

export interface SortState {
    field: string;
    direction: 'asc' | 'desc';
}
