/**
 * Tipos para consulta de anamnese
 */

import type { SimNao, SimNaoComAjuda } from '../../Cadastro/types/anamnese.types';

type ID = string;

// ============================================
// DADOS RESUMIDOS PARA LISTAGEM
// ============================================

export interface AnamneseResumo {
    id: ID;
    clienteId: ID;
    clienteNome: string;
    clienteAvatarUrl?: string;
    dataNascimento?: string;
    dataEntrevista: string;
    profissionalId: ID;
    profissionalNome: string;
    status: 'ATIVO' | 'INATIVO';
}

// ============================================
// DADOS COMPLETOS PARA CONSULTA
// ============================================

// Tipo para cuidadores do cliente
export interface CuidadorDetalhe {
    id: ID;
    nome: string;
    relacao: string;
    descricaoRelacao?: string;
    cpf: string;
    dataNascimento?: string;
    telefone: string;
    email: string;
    escolaridade?: string;
    profissao?: string;
}

export interface AnamneseDetalhe {
    id: ID;
    
    // Cabeçalho / Identificação
    cabecalho: {
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
        cuidadores: CuidadorDetalhe[];
    };

    // Queixa e Diagnóstico
    queixaDiagnostico: {
        queixaPrincipal: string;
        diagnosticoPrevio: string;
        suspeitaCondicaoAssociada: string;
        especialidadesConsultadas: EspecialidadeConsultadaDetalhe[];
        medicamentosEmUso: MedicamentoDetalhe[];
        examesPrevios: ExameDetalhe[];
        terapiasPrevias: TerapiaDetalhe[];
    };

    // Contexto Familiar e Rotina
    contextoFamiliarRotina: {
        historicoFamiliar: HistoricoFamiliarDetalhe[];
        rotinaDiaria: AtividadeRotinaDetalhe[];
        cuidadoresPrincipais: string;
        tempoTela: string;
    };

    // Desenvolvimento Inicial
    desenvolvimentoInicial: {
        gestacaoParto: GestacaoPartoDetalhe;
        neuropsicomotor: NeuropsicomotorDetalhe;
        falaLinguagem: FalaLinguagemDetalhe;
    };

    // Atividades de Vida Diária
    atividadesVidaDiaria: {
        desfralde: DesfraldeDetalhe;
        sono: SonoDetalhe;
        habitosHigiene: HabitosHigieneDetalhe;
        alimentacao: AlimentacaoDetalhe;
    };

    // Social e Acadêmico
    socialAcademico: {
        interacaoSocial: InteracaoSocialDetalhe;
        vidaEscolar: VidaEscolarDetalhe;
    };

    // Comportamento
    comportamento: {
        estereotipiasRituais: EstereotipiasRituaisDetalhe;
        problemasComportamento: ProblemasComportamentoDetalhe;
    };

    // Finalização
    finalizacao: {
        expectativasFamilia: string;
        informacoesAdicionais: string;
        observacoesFinais: string;
    };

    status: 'ATIVO' | 'INATIVO';
    createdAt: string;
    updatedAt: string;
}

// ============================================
// TIPOS AUXILIARES DETALHADOS
// ============================================

export interface EspecialidadeConsultadaDetalhe {
    id: ID;
    especialidade: string;
    nome: string;
    data: string;
    observacao?: string;
    ativo: boolean;
}

export interface MedicamentoDetalhe {
    id: ID;
    nome: string;
    dosagem: string;
    dataInicio: string;
    motivo: string;
}

export interface ArquivoAnexoDetalhe {
    id: ID;
    nome: string;
    tipo: string;
    tamanho: number;
    url?: string;
}

export interface ExameDetalhe {
    id: ID;
    nome: string;
    data: string;
    resultado: string;
    arquivos?: ArquivoAnexoDetalhe[];
}

export interface TerapiaDetalhe {
    id: ID;
    profissional: string;
    especialidadeAbordagem: string;
    tempoIntervencao: string;
    observacao?: string;
    ativo: boolean;
}

export interface HistoricoFamiliarDetalhe {
    id: ID;
    parentesco: string;
    condicao: string;
    observacao?: string;
}

export interface AtividadeRotinaDetalhe {
    id: ID;
    horario: string;
    atividade: string;
    responsavel: string;
    frequencia?: string;
    observacao?: string;
}

export interface GestacaoPartoDetalhe {
    tipoParto: string;
    semanas: string;
    apgar1min: string;
    apgar5min: string;
    intercorrencias: string;
}

export interface MarcoDesenvolvimento {
    meses: string;
    status: 'realizado' | 'naoRealiza' | 'naoSoubeInformar';
}

export interface NeuropsicomotorDetalhe {
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

export interface FalaLinguagemDetalhe {
    balbuciou: MarcoDesenvolvimento;
    primeirasPalavras: MarcoDesenvolvimento;
    primeirasFrases: MarcoDesenvolvimento;
    apontouParaFazerPedidos: MarcoDesenvolvimento;
    fazUsoDeGestos: SimNao;
    fazUsoDeGestosQuais: string;
    audicao: string;
    teveOtiteDeRepeticao: SimNao;
    otiteDetalhes: string;
    fazOuFezUsoTuboVentilacao: SimNao;
    tuboVentilacaoObservacao: string;
    fazOuFezUsoObjetoOral: SimNao;
    objetoOralEspecificar: string;
    usaMamadeira: SimNao;
    mamadeiraDetalhes: string;
    comunicacaoAtual: string;
}

// Item 13 - Desfralde
export interface DesfraldeTempo {
    anos: string;
    meses: string;
    utilizaFralda: boolean;
}

export interface DesfraldeDetalhe {
    desfraldeDiurnoUrina: DesfraldeTempo;
    desfraldeNoturnoUrina: DesfraldeTempo;
    desfraldeFezes: DesfraldeTempo;
    seLimpaSozinhoUrinar: SimNao;
    seLimpaSozinhoDefecar: SimNao;
    lavaAsMaosAposUsoBanheiro: SimNao;
    apresentaAlteracaoHabitoIntestinal: SimNao;
    observacoes: string;
}

// Item 14 - Sono
export interface SonoDetalhe {
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
export interface HabitosHigieneDetalhe {
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
export interface AlimentacaoDetalhe {
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

export interface InteracaoSocialDetalhe {
    brincaComOutrasCriancas: SimNao;
    tipoBrincadeira: string;
    mantemContatoVisual: SimNao;
    respondeAoChamar: SimNao;
    compartilhaInteresses: SimNao;
    compreendeSentimentos: SimNao;
}

export interface VidaEscolarDetalhe {
    // Dados da escola
    escola: string;
    ano: string;
    periodo: string;
    direcao: string;
    coordenacao: string;
    professoraPrincipal: string;
    professoraAssistente: string;
    // Campos Sim/Não
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

// Item 19 - Estereotipias, Tiques, Rituais e Rotinas
export interface EstereotipiasRituaisDetalhe {
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
export interface ProblemasComportamentoDetalhe {
    apresentaComportamentosAutoLesivos: SimNao;
    autoLesivosQuais: string;
    apresentaComportamentosHeteroagressivos: SimNao;
    heteroagressivosQuais: string;
    apresentaDestruicaoPropriedade: SimNao;
    destruicaoDescrever: string;
    necessitouContencaoMecanica: SimNao;
    observacoesTopografias: string;
}
