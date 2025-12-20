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
        quemIndicou: string;
        profissionalId: ID;
        profissionalNome: string;
    };

    // Queixa e Diagnóstico
    queixaDiagnostico: {
        queixaPrincipal: string;
        diagnosticoPrevio: string;
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
        alimentacao: AlimentacaoDetalhe;
        higiene: HigieneDetalhe;
        vestuario: VestuarioDetalhe;
        sono: SonoDetalhe;
    };

    // Social e Acadêmico
    socialAcademico: {
        interacaoSocial: InteracaoSocialDetalhe;
        vidaEscolar: VidaEscolarDetalhe;
    };

    // Comportamento
    comportamento: {
        aspectosComportamentais: string;
        interessesRestritos: string;
        estereotipias: string;
        sensibilidadesSensoriais: string;
        autoRegulacao: string;
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

export interface ExameDetalhe {
    id: ID;
    nome: string;
    data: string;
    resultado: string;
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
    fazOuFezUsoObjetoOral: SimNao;
    objetoOralEspecificar: string;
    usaMamadeira: SimNao;
    mamadeiraDetalhes: string;
    comunicacaoAtual: string;
}

export interface AlimentacaoDetalhe {
    amamentacao: string;
    introducaoAlimentar: string;
    alimentacaoAtual: string;
    restricoesAlimentares: string;
    seletividadeAlimentar: string;
    usaTalheres: SimNaoComAjuda;
    comeAlone: SimNaoComAjuda;
}

export interface HigieneDetalhe {
    desfralde: string;
    controlaEsfincterDiurno: SimNao;
    controlaEsfincterNoturno: SimNao;
    tomaBANHOSozinho: SimNaoComAjuda;
    escovaD: SimNaoComAjuda;
}

export interface VestuarioDetalhe {
    vesteSozinho: SimNaoComAjuda;
    calcaSapatos: SimNaoComAjuda;
    abotoaSozinho: SimNaoComAjuda;
    preferenciasRoupas: string;
}

export interface SonoDetalhe {
    dormeOnde: string;
    horarioDormir: string;
    horarioAcordar: string;
    qualidadeSono: string;
    dificuldadesParaDormir: string;
    acordaDuranteNoite: SimNao;
    pesadelos: SimNao;
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
    frequentaEscola: SimNao;
    nomeEscola: string;
    serie: string;
    periodo: string;
    temAcompanhante: SimNao;
    adaptacaoEscolar: string;
    dificuldadesEscolares: string;
    relacionamentoComColegas: string;
}
