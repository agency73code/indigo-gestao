import { z } from 'zod';

const simNaoSchema = z.enum(['sim', 'nao']).nullable().optional();
const simNaoComAjudaSchema = z.enum(['sim', 'nao', 'com_ajuda']).nullable().optional();

export const marcoDesenvolvimentoSchema = z
    .object({
        meses: z.string().optional(),
        status: z.string().optional(),
        naoRealiza: z.boolean().optional(),
        naoSoubeInformar: z.boolean().optional(),
        nao: z.boolean().optional(),
    });

const cuidadorSchema = z
    .object({
        id: z.string().optional(),
    });

const especialidadeConsultadaSchema = z
    .object({
        id: z.string().optional(),
        especialidade: z.string().optional(),
        nome: z.string().optional(),
        data: z.string().optional(),
        observacao: z.string().optional(),
        ativo: z.boolean().optional(),
    });

const medicamentoEmUsoSchema = z
    .object({
        id: z.string().optional(),
        nome: z.string().optional(),
        dosagem: z.string().optional(),
        dataInicio: z.string().optional(),
        motivo: z.string().optional(),
    });

const arquivoAnexoSchema = z
    .object({
        id: z.string().optional(),
        nome: z.string().optional(),
        tipo: z.string().optional(),
        tamanho: z.number().optional(),
        url: z.string().optional(),
        file: z.unknown().optional(),
    });

const examePrevioSchema = z
    .object({
        id: z.string().optional(),
        nome: z.string().optional(),
        data: z.string().optional(),
        resultado: z.string().optional(),
        arquivos: z.array(arquivoAnexoSchema).optional(),
    });

const terapiaPreviaSchema = z
    .object({
        id: z.string().optional(),
        profissional: z.string().optional(),
        especialidadeAbordagem: z.string().optional(),
        tempoIntervencao: z.string().optional(),
        observacao: z.string().optional(),
        ativo: z.boolean().optional(),
    });

const historicoFamiliarSchema = z
    .object({
        id: z.string().optional(),
        condicaoDiagnostico: z.string().optional(),
        condicao: z.string().optional(),
        parentesco: z.string().optional(),
        observacao: z.string().optional(),
    });

const atividadeRotinaSchema = z
    .object({
        id: z.string().optional(),
        atividade: z.string().optional(),
        horario: z.string().optional(),
        responsavel: z.string().optional(),
        frequencia: z.string().optional(),
        observacao: z.string().optional(),
    });

const desenvolvimentoSocialSchema = z
    .object({
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
        observacoes: z.string().optional(),
        brincaComOutrasCriancas: simNaoSchema,
        tipoBrincadeira: z.string().optional(),
        mantemContatoVisual: simNaoSchema,
        respondeAoChamar: simNaoSchema,
        compartilhaInteresses: simNaoSchema,
        compreendeSentimentos: simNaoSchema,
    });

const desenvolvimentoAcademicoSchema = z
    .object({
        escola: z.string().optional(),
        ano: z.union([z.number(), z.string(), z.null()]).optional(),
        periodo: z.string().optional(),
        direcao: z.string().optional(),
        coordenacao: z.string().optional(),
        professoraPrincipal: z.string().optional(),
        professoraAssistente: z.string().optional(),
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
        adaptacaoEscolar: z.string().optional(),
        dificuldadesEscolares: z.string().optional(),
        relacionamentoComColegas: z.string().optional(),
        observacoes: z.string().optional(),
    });

export const AnamneseSchema = z.object({
    id: z.string().optional(),
    status: z.string().nullable().optional(),
    cabecalho: z
        .object({
            dataEntrevista: z.string().optional(),
            clienteId: z.string().optional(),
            clienteNome: z.string().optional(),
            clienteAvatarUrl: z.string().optional(),
            dataNascimento: z.string().optional(),
            idade: z.string().optional(),
            informante: z.string().optional(),
            parentesco: z.string().optional(),
            parentescoDescricao: z.string().optional(),
            quemIndicou: z.string().optional(),
            profissionalId: z.string().optional(),
            profissionalNome: z.string().optional(),
            cuidadores: z.array(cuidadorSchema).optional(),
            escolaCliente: z.string().nullable().optional(),
        }),
    queixaDiagnostico: z
        .object({
            queixaPrincipal: z.string().optional(),
            diagnosticoPrevio: z.string().optional(),
            suspeitaCondicaoAssociada: z.string().optional(),
            especialidadesConsultadas: z.array(especialidadeConsultadaSchema).optional(),
            medicamentosEmUso: z.array(medicamentoEmUsoSchema).optional(),
            examesPrevios: z.array(examePrevioSchema).optional(),
            terapiasPrevias: z.array(terapiaPreviaSchema).optional(),
        }),
    contextoFamiliarRotina: z
        .object({
            historicosFamiliares: z.array(historicoFamiliarSchema).optional(),
            historicoFamiliar: z.array(historicoFamiliarSchema).optional(),
            atividadesRotina: z.array(atividadeRotinaSchema).optional(),
            rotinaDiaria: z.array(atividadeRotinaSchema).optional(),
            cuidadoresPrincipais: z.string().optional(),
            tempoTela: z.string().optional(),
        }),
    desenvolvimentoInicial: z
        .object({
            gestacaoParto: z
                .object({
                    tipoParto: z.string().nullable().optional(),
                    semanas: z.number().nullable().optional(),
                    apgar1min: z.number().nullable().optional(),
                    apgar5min: z.number().nullable().optional(),
                    intercorrencias: z.string().optional(),
                }),
            neuropsicomotor: z
                .object({
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
                    motricidadeFina: z.string().optional(),
                }),
            falaLinguagem: z
                .object({
                    balbuciou: marcoDesenvolvimentoSchema,
                    primeirasPalavras: marcoDesenvolvimentoSchema,
                    primeirasFrases: marcoDesenvolvimentoSchema,
                    apontouParaFazerPedidos: marcoDesenvolvimentoSchema,
                    fazUsoDeGestos: simNaoSchema,
                    fazUsoDeGestosQuais: z.string().optional(),
                    audicao: z.string().nullable().optional(),
                    teveOtiteDeRepeticao: simNaoSchema,
                    otiteVezes: z.number().nullable().optional(),
                    otitePeriodoMeses: z.number().nullable().optional(),
                    otiteFrequencia: z.string().optional(),
                    otiteDetalhes: z.string().optional(),
                    fazOuFezUsoTuboVentilacao: simNaoSchema,
                    tuboVentilacaoObservacao: z.string().optional(),
                    fazOuFezUsoObjetoOral: simNaoSchema,
                    objetoOralEspecificar: z.string().optional(),
                    usaMamadeira: simNaoSchema,
                    mamadeiraHa: z.string().optional(),
                    mamadeiraVezesAoDia: z.number().nullable().optional(),
                    mamadeiraDetalhes: z.string().optional(),
                    comunicacaoAtual: z.string().optional(),
                }),
        }),
    atividadesVidaDiaria: z
        .object({
            desfralde: z
                .object({
                    desfraldeDiurnoUrina: z
                        .object({
                            anos: z.string().optional(),
                            meses: z.string().optional(),
                            utilizaFralda: z.boolean().optional(),
                        })
                        .optional(),
                    desfraldeNoturnoUrina: z
                        .object({
                            anos: z.string().optional(),
                            meses: z.string().optional(),
                            utilizaFralda: z.boolean().optional(),
                        })
                        .optional(),
                    desfraldeFezes: z
                        .object({
                            anos: z.string().optional(),
                            meses: z.string().optional(),
                            utilizaFralda: z.boolean().optional(),
                        })
                        .optional(),
                    seLimpaSozinhoUrinar: simNaoSchema,
                    seLimpaSozinhoDefecar: simNaoSchema,
                    lavaAsMaosAposUsoBanheiro: simNaoSchema,
                    apresentaAlteracaoHabitoIntestinal: simNaoSchema,
                    observacoes: z.string().optional(),
                })
                .optional(),
            sono: z
                .object({
                    dormemMediaHorasNoite: z.string().optional(),
                    dormemMediaHorasDia: z.string().optional(),
                    periodoSonoDia: z.string().nullable().optional(),
                    temDificuldadeIniciarSono: simNaoSchema,
                    acordaDeMadrugada: simNaoSchema,
                    dormeNaPropriaCama: simNaoSchema,
                    dormeNoProprioQuarto: simNaoSchema,
                    apresentaSonoAgitado: simNaoSchema,
                    eSonambulo: simNaoSchema,
                    observacoes: z.string().optional(),
                })
                .optional(),
            habitosHigiene: z
                .object({
                    tomaBanhoLavaCorpoTodo: simNaoComAjudaSchema,
                    secaCorpoTodo: simNaoComAjudaSchema,
                    retiraTodasPecasRoupa: simNaoComAjudaSchema,
                    colocaTodasPecasRoupa: simNaoComAjudaSchema,
                    poeCalcadosSemCadarco: simNaoComAjudaSchema,
                    poeCalcadosComCadarco: simNaoComAjudaSchema,
                    escovaOsDentes: simNaoComAjudaSchema,
                    penteiaOCabelo: simNaoComAjudaSchema,
                    observacoes: z.string().optional(),
                })
                .optional(),
            alimentacao: z
                .object({
                    apresentaQueixaAlimentacao: simNaoSchema,
                    seAlimentaSozinho: simNaoSchema,
                    eSeletivoQuantoAlimentos: simNaoSchema,
                    passaDiaInteiroSemComer: simNaoSchema,
                    apresentaRituaisParaAlimentar: simNaoSchema,
                    estaAbaixoOuAcimaPeso: simNaoSchema,
                    estaAbaixoOuAcimaPesoDescricao: z.string().optional(),
                    temHistoricoAnemia: simNaoSchema,
                    temHistoricoAnemiaDescricao: z.string().optional(),
                    rotinaAlimentarEProblemaFamilia: simNaoSchema,
                    rotinaAlimentarEProblemaFamiliaDescricao: z.string().optional(),
                    observacoes: z.string().optional(),
                })
                .optional(),
        }),
    socialAcademico: z
        .object({
            desenvolvimentoSocial: desenvolvimentoSocialSchema,
            interacaoSocial: desenvolvimentoSocialSchema,
            desenvolvimentoAcademico: desenvolvimentoAcademicoSchema,
            vidaEscolar: desenvolvimentoAcademicoSchema,
        }),
    comportamento: z
        .object({
            estereotipiasRituais: z
                .object({
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
                    observacoesTopografias: z.string().optional(),
                })
                .optional(),
            problemasComportamento: z
                .object({
                    apresentaComportamentosAutoLesivos: simNaoSchema,
                    autoLesivosQuais: z.string().optional(),
                    apresentaComportamentosHeteroagressivos: simNaoSchema,
                    heteroagressivosQuais: z.string().optional(),
                    apresentaDestruicaoPropriedade: simNaoSchema,
                    destruicaoDescrever: z.string().optional(),
                    necessitouContencaoMecanica: simNaoSchema,
                    observacoesTopografias: z.string().optional(),
                })
                .optional(),
        }),
    finalizacao: z
        .object({
            outrasInformacoesRelevantes: z.string().optional(),
            informacoesAdicionais: z.string().optional(),
            observacoesImpressoesTerapeuta: z.string().optional(),
            observacoesFinais: z.string().optional(),
            expectativasFamilia: z.string().optional(),
        }),
});

export type AnamnesePayload = z.infer<typeof AnamneseSchema>;