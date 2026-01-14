import request from 'supertest';
import { describe, it, expect, afterAll } from 'vitest';
import app from '../src/server';
import { prisma } from '../src/config/database.js';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';
import { ensureTestClientAndTherapist } from './helpers/ensureTestActors.js';

const ENDPOINT = '/api/anamneses';

describe(`POST ${ENDPOINT}`, () => {
    it('deve criar uma anamnese com payload completo', async () => {
        const { cliente, terapeuta } = await ensureTestClientAndTherapist();

        // 1) Gerar um token válido para o seu middleware
        const fakeUserId = 'test-user-id-123';
        const token = jwt.sign(
        {
            sub: fakeUserId,
            perfil_acesso: 'ADMIN',
        },
        env.JWT_SECRET,
        { expiresIn: '1h' },
        );

        const payload = {
            cabecalho: {
                dataEntrevista: '2026-01-04',
                clienteId: cliente.id,
                clienteNome: 'Alexandre Moraes',
                dataNascimento: '2021-04-03T16:02:26.786Z',
                idade: '4 anos e 9 meses',
                informante: 'Gabriel Xavier',
                parentesco: 'pai',
                quemIndicou: 'Kaio',
                profissionalId: terapeuta.id,
                profissionalNome: 'Marcela Moreira',
                cuidadores: [
                    {
                        id: '',
                        nome: 'Gabriel Xavier',
                        relacao: 'pai',
                        descricaoRelacao: '',
                        telefone: '(52) 67423-6674',
                        email: 'Gabriel.Xavier@example.com',
                        profissao: 'International Operações Administrador',
                        escolaridade: 'Ensino Médio Completo',
                        dataNascimento: '1979-01-14T00:00:00.000Z',
                    },
                ],
                escolaCliente: 'Escola Estadual Pereira',
                parentescoDescricao: '',
            },
            queixaDiagnostico: {
                queixaPrincipal: 'Teste',
                diagnosticoPrevio: 'Teste',
                suspeitaCondicaoAssociada: 'Teste',
                especialidadesConsultadas: [
                    {
                        id: 'a1b7a72a-f0a0-4c55-9024-f44b486090c7',
                        especialidade: 'Pediatra',
                        nome: 'Teste',
                        data: '12/2024',
                        observacao: 'Teste',
                        ativo: true,
                    },
                ],
                medicamentosEmUso: [
                    {
                        id: '2b0cf6c0-81cb-4b0b-bbd8-67bc057f862f',
                        nome: 'Teste',
                        dosagem: '10mg',
                        dataInicio: '2026-01-04',
                        motivo: 'Teste',
                    },
                ],
                examesPrevios: [
                    {
                        id: '2f0f2ec1-4b66-4919-b4df-ac3946595711',
                        nome: 'Teste',
                        data: '2026-01-04',
                        resultado: 'Teste',
                        arquivos: [
                            {
                                id: '1237a9c2-3a4f-4a3b-92be-ac8433cf056c',
                                nome: 'Atendimento_CIP_35.001.003.25.0913760',
                                tipo: 'application/pdf',
                                tamanho: 627859,
                                file: {},
                            },
                        ],
                    },
                ],
                terapiasPrevias: [
                    {
                        id: '952cf98f-bae9-4523-a799-d7c67b1e26c4',
                        profissional: 'Teste',
                        especialidadeAbordagem: 'Teste',
                        tempoIntervencao: '1 ano',
                        observacao: 'Teste',
                        ativo: true,
                    },
                ],
            },
            contextoFamiliarRotina: {
                historicosFamiliares: [
                    {
                        id: 'e37fde43-3723-4269-b914-4f4f28aba154',
                        condicaoDiagnostico: 'Teste',
                        parentesco: 'Pai',
                        observacao: 'Teste',
                    },
                ],
                atividadesRotina: [
                    {
                        id: '027f3d69-8c6c-4bed-b202-4aaa8a00d800',
                        atividade: 'Teste',
                        horario: '14:00-15:00',
                        responsavel: 'Pai',
                        frequencia: '2x/semana',
                        observacao: 'Teste',
                    },
                ],
            },
            desenvolvimentoInicial: {
                gestacaoParto: {
                    tipoParto: 'natural',
                    semanas: 150,
                    apgar1min: 1,
                    apgar5min: 5,
                    intercorrencias: 'Teste',
                },
                neuropsicomotor: {
                    sustentouCabeca: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    rolou: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    sentou: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    engatinhou: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    andouComApoio: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    andouSemApoio: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    correu: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    andouDeMotoca: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    andouDeBicicleta: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    subiuEscadasSozinho: { meses: '', naoRealiza: false, naoSoubeInformar: true },
                    motricidadeFina: 'Teste',
                },
                falaLinguagem: {
                    balbuciou: { meses: '', nao: false, naoSoubeInformar: true },
                    primeirasPalavras: { meses: '', nao: false, naoSoubeInformar: true },
                    primeirasFrases: { meses: '', nao: false, naoSoubeInformar: true },
                    apontouParaFazerPedidos: { meses: '', nao: false, naoSoubeInformar: true },
                    fazUsoDeGestos: 'nao',
                    fazUsoDeGestosQuais: '',
                    audicao: 'boa',
                    teveOtiteDeRepeticao: 'nao',
                    otiteVezes: null,
                    otitePeriodoMeses: null,
                    otiteFrequencia: '',
                    fazOuFezUsoTuboVentilacao: 'nao',
                    tuboVentilacaoObservacao: '',
                    fazOuFezUsoObjetoOral: 'nao',
                    objetoOralEspecificar: '',
                    usaMamadeira: 'sim',
                    mamadeiraHa: '2 anos',
                    mamadeiraVezesAoDia: 3,
                    comunicacaoAtual: 'Teste',
                },
            },
            atividadesVidaDiaria: {
                desfralde: {
                    desfraldeDiurnoUrina: { anos: '', meses: '', utilizaFralda: true },
                    desfraldeNoturnoUrina: { anos: '', meses: '', utilizaFralda: true },
                    desfraldeFezes: { anos: '', meses: '', utilizaFralda: true },
                    seLimpaSozinhoUrinar: 'nao',
                    seLimpaSozinhoDefecar: 'nao',
                    lavaAsMaosAposUsoBanheiro: 'nao',
                    apresentaAlteracaoHabitoIntestinal: 'nao',
                    observacoes: 'Teste',
                },
                sono: {
                    dormemMediaHorasNoite: '6',
                    dormemMediaHorasDia: '6',
                    periodoSonoDia: 'tarde',
                    temDificuldadeIniciarSono: 'nao',
                    acordaDeMadrugada: 'nao',
                    dormeNaPropriaCama: 'nao',
                    dormeNoProprioQuarto: 'nao',
                    apresentaSonoAgitado: 'nao',
                    eSonambulo: 'nao',
                    observacoes: 'Teste',
                },
                habitosHigiene: {
                    tomaBanhoLavaCorpoTodo: 'nao',
                    secaCorpoTodo: 'nao',
                    retiraTodasPecasRoupa: 'nao',
                    colocaTodasPecasRoupa: 'nao',
                    poeCalcadosSemCadarco: 'nao',
                    poeCalcadosComCadarco: 'nao',
                    escovaOsDentes: 'nao',
                    penteiaOCabelo: 'nao',
                    observacoes: 'Teste',
                },
                alimentacao: {
                    apresentaQueixaAlimentacao: 'nao',
                    seAlimentaSozinho: 'nao',
                    eSeletivoQuantoAlimentos: 'nao',
                    passaDiaInteiroSemComer: 'nao',
                    apresentaRituaisParaAlimentar: 'nao',
                    estaAbaixoOuAcimaPeso: 'nao',
                    estaAbaixoOuAcimaPesoDescricao: '',
                    temHistoricoAnemia: 'nao',
                    temHistoricoAnemiaDescricao: '',
                    rotinaAlimentarEProblemaFamilia: 'nao',
                    rotinaAlimentarEProblemaFamiliaDescricao: '',
                    observacoes: 'Teste',
                },
            },
            socialAcademico: {
                desenvolvimentoSocial: {
                    possuiAmigosMesmaIdadeEscola: 'nao',
                    possuiAmigosMesmaIdadeForaEscola: 'nao',
                    fazUsoFuncionalBrinquedos: 'nao',
                    brincaProximoAosColegas: 'nao',
                    brincaConjuntaComColegas: 'nao',
                    procuraColegasEspontaneamente: 'nao',
                    seVerbalIniciaConversa: 'nao',
                    seVerbalRespondePerguntasSimples: 'nao',
                    fazPedidosQuandoNecessario: 'nao',
                    estabeleceContatoVisualAdultos: 'nao',
                    estabeleceContatoVisualCriancas: 'nao',
                    observacoes: 'Teste',
                },
                desenvolvimentoAcademico: {
                    escola: 'Escola Estadual Pereira',
                    ano: 2024,
                    periodo: 'Teste',
                    direcao: 'Teste',
                    coordenacao: 'Teste',
                    professoraPrincipal: 'Teste',
                    professoraAssistente: 'Teste',
                    frequentaEscolaRegular: 'nao',
                    frequentaEscolaEspecial: 'nao',
                    acompanhaTurmaDemandasPedagogicas: 'nao',
                    segueRegrasRotinaSalaAula: 'nao',
                    necessitaApoioAT: 'nao',
                    necessitaAdaptacaoMateriais: 'nao',
                    necessitaAdaptacaoCurricular: 'nao',
                    houveReprovacaoRetencao: 'nao',
                    escolaPossuiEquipeInclusao: 'nao',
                    haIndicativoDeficienciaIntelectual: 'nao',
                    escolaApresentaQueixaComportamental: 'nao',
                    adaptacaoEscolar: 'Teste',
                    dificuldadesEscolares: 'Teste',
                    relacionamentoComColegas: 'Teste',
                    observacoes: 'Teste',
                },
            },
            comportamento: {
                estereotipiasRituais: {
                    balancaMaosLadoCorpoOuFrente: 'nao',
                    balancaCorpoFrenteParaTras: 'nao',
                    pulaOuGiraEmTornoDeSi: 'nao',
                    repeteSonsSemFuncaoComunicativa: 'nao',
                    repeteMovimentosContinuos: 'nao',
                    exploraAmbienteLambendoTocando: 'nao',
                    procuraObservarObjetosCantoOlho: 'nao',
                    organizaObjetosLadoALado: 'nao',
                    realizaTarefasSempreMesmaOrdem: 'nao',
                    apresentaRituaisDiarios: 'nao',
                    observacoesTopografias: 'Teste',
                },
                problemasComportamento: {
                    apresentaComportamentosAutoLesivos: 'nao',
                    autoLesivosQuais: '',
                    apresentaComportamentosHeteroagressivos: 'nao',
                    heteroagressivosQuais: '',
                    apresentaDestruicaoPropriedade: 'nao',
                    destruicaoDescrever: '',
                    necessitouContencaoMecanica: 'nao',
                    observacoesTopografias: 'Teste',
                },
            },
            finalizacao: {
                outrasInformacoesRelevantes: 'Teste',
                observacoesImpressoesTerapeuta: 'Teste',
                expectativasFamilia: 'Teste',
            },
        };

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', `Bearer ${token}`)
            .field('payload', JSON.stringify(payload));

        // Status
        expect(res.status).toBe(201);

        // Estrutura básica
        expect(res.body).toEqual(
            expect.objectContaining({
                success: true,
                message: 'Anamnese criada com sucesso.',
                data: expect.any(Object),
            }),
        );

        const created = res.body.data;

        // Tem id?
        expect(created).toHaveProperty('id');
        expect(typeof created.id).toBe('number');

        // Campos que devem bater com o payload
        expect(created).toEqual(
            expect.objectContaining({
                cliente_id: payload.cabecalho.clienteId,
                terapeuta_id: payload.cabecalho.profissionalId,
                informante: payload.cabecalho.informante,
                parentesco: payload.cabecalho.parentesco,
                quem_indicou: payload.cabecalho.quemIndicou,
            }),
        );

        await prisma.anamnese.delete({
            where: { id: created.id },
        });
    });
});

// Fecha conexão com o banco no fim dos testes
afterAll(async () => {
    await prisma.$disconnect();
});
