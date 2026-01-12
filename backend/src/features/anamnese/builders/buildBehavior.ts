import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';
import { mapSimNao } from './helpers.js';

type BehaviorPayload = AnamnesePayload['comportamento'];

type BehaviorCreateInput = Pick<Prisma.anamneseCreateInput, 'comportamento'>;

export function buildBehavior(behavior: BehaviorPayload): BehaviorCreateInput {
    return {
        comportamento: {
            create: {
                // estereotipias / rituais
                balanca_maos_lado_corpo_ou_frente: mapSimNao(
                    behavior.estereotipiasRituais.balancaMaosLadoCorpoOuFrente,
                ),
                balanca_corpo_frente_para_tras: mapSimNao(
                    behavior.estereotipiasRituais.balancaCorpoFrenteParaTras,
                ),
                pula_ou_gira_em_torno_de_si: mapSimNao(
                    behavior.estereotipiasRituais.pulaOuGiraEmTornoDeSi,
                ),
                repete_sons_sem_funcao_comunicativa: mapSimNao(
                    behavior.estereotipiasRituais.repeteSonsSemFuncaoComunicativa,
                ),
                repete_movimentos_continuos: mapSimNao(
                    behavior.estereotipiasRituais.repeteMovimentosContinuos,
                ),
                explora_ambiente_lambendo_tocando: mapSimNao(
                    behavior.estereotipiasRituais.exploraAmbienteLambendoTocando,
                ),
                procura_observar_objetos_canto_olho: mapSimNao(
                    behavior.estereotipiasRituais.procuraObservarObjetosCantoOlho,
                ),
                organiza_objetos_lado_a_lado: mapSimNao(
                    behavior.estereotipiasRituais.organizaObjetosLadoALado,
                ),
                realiza_tarefas_sempre_mesma_ordem: mapSimNao(
                    behavior.estereotipiasRituais.realizaTarefasSempreMesmaOrdem,
                ),
                apresenta_rituais_diarios: mapSimNao(behavior.estereotipiasRituais.apresentaRituaisDiarios),

                estereotipias_rituais_observacoes_topografias:
                    behavior.estereotipiasRituais.observacoesTopografias ?? null,

                // PROBLEMAS DE COMPORTAMENTO
                apresenta_comportamentos_auto_lesivos: mapSimNao(
                    behavior.problemasComportamento.apresentaComportamentosAutoLesivos,
                ),
                auto_lesivos_quais: behavior.problemasComportamento.autoLesivosQuais ?? null,

                apresenta_comportamentos_heteroagressivos: mapSimNao(
                    behavior.problemasComportamento.apresentaComportamentosHeteroagressivos,
                ),
                heteroagressivos_quais: behavior.problemasComportamento.heteroagressivosQuais ?? null,

                apresenta_destruicao_propriedade: mapSimNao(
                    behavior.problemasComportamento.apresentaDestruicaoPropriedade,
                ),
                destruicao_descrever: behavior.problemasComportamento.destruicaoDescrever ?? null,

                necessitou_contencao_mecanica: mapSimNao(
                    behavior.problemasComportamento.necessitouContencaoMecanica,
                ),

                problemas_comportamento_observacoes_topografias:
                    behavior.problemasComportamento.observacoesTopografias ?? null,
            },
        },
    };
}