import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';
import { mapSimNao } from './helpers.js';

type SocialAcademicPayload = AnamnesePayload['socialAcademico'];

type SocialAcademicCreateInput = Pick<Prisma.anamneseCreateInput, 'social_academico'>;

export function buildSocialAcademic(socialAcademic: SocialAcademicPayload): SocialAcademicCreateInput {
    return {
        social_academico: {
            create: {
                // desenvolvimento social
                possui_amigos_mesma_idade_escola: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.possuiAmigosMesmaIdadeEscola,
                ),
                possui_amigos_mesma_idade_fora_escola: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.possuiAmigosMesmaIdadeForaEscola,
                ),
                faz_uso_funcional_brinquedos: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.fazUsoFuncionalBrinquedos,
                ),
                brinca_proximo_aos_colegas: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.brincaProximoAosColegas,
                ),
                brinca_conjunta_com_colegas: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.brincaConjuntaComColegas,
                ),
                procura_colegas_espontaneamente: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.procuraColegasEspontaneamente,
                ),
                se_verbal_inicia_conversa: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.seVerbalIniciaConversa,
                ),
                se_verbal_responde_perguntas_simples: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.seVerbalRespondePerguntasSimples,
                ),
                faz_pedidos_quando_necessario: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.fazPedidosQuandoNecessario,
                ),
                estabelece_contato_visual_adultos: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.estabeleceContatoVisualAdultos,
                ),
                estabelece_contato_visual_criancas: mapSimNao(
                    socialAcademic.desenvolvimentoSocial.estabeleceContatoVisualCriancas,
                ),

                desenvolvimento_social_observacoes: socialAcademic.desenvolvimentoSocial.observacoes ?? null,

                // DESENVOLVIMENTO ACADÊMICO
                ano: socialAcademic.desenvolvimentoAcademico.ano ?? null,
                periodo: socialAcademic.desenvolvimentoAcademico.periodo ?? null,
                direcao: socialAcademic.desenvolvimentoAcademico.direcao ?? null,
                coordenacao: socialAcademic.desenvolvimentoAcademico.coordenacao ?? null,
                professora_principal: socialAcademic.desenvolvimentoAcademico.professoraPrincipal ?? null,
                professora_assistente: socialAcademic.desenvolvimentoAcademico.professoraAssistente ?? null,

                frequenta_escola_regular: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.frequentaEscolaRegular,
                ),
                frequenta_escola_especial: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.frequentaEscolaEspecial,
                ),
                acompanha_turma_demandas_pedagogicas: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.acompanhaTurmaDemandasPedagogicas,
                ),
                segue_regras_rotina_sala_aula: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.segueRegrasRotinaSalaAula,
                ),
                necessita_apoio_at: mapSimNao(socialAcademic.desenvolvimentoAcademico.necessitaApoioAT),
                necessita_adaptacao_materiais: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.necessitaAdaptacaoMateriais,
                ),
                necessita_adaptacao_curricular: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.necessitaAdaptacaoCurricular,
                ),
                houve_reprovacao_retencao: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.houveReprovacaoRetencao,
                ),
                escola_possui_equipe_inclusao: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.escolaPossuiEquipeInclusao,
                ),
                ha_indicativo_deficiencia_intelectual: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.haIndicativoDeficienciaIntelectual,
                ),
                escola_apresenta_queixa_comportamental: mapSimNao(
                    socialAcademic.desenvolvimentoAcademico.escolaApresentaQueixaComportamental,
                ),

                adaptacao_escolar: socialAcademic.desenvolvimentoAcademico.adaptacaoEscolar ?? null,
                dificuldades_escolares: socialAcademic.desenvolvimentoAcademico.dificuldadesEscolares ?? null,
                relacionamento_com_colegas:
                    socialAcademic.desenvolvimentoAcademico.relacionamentoComColegas ?? null,
                desenvolvimento_academico_observacoes:
                    socialAcademic.desenvolvimentoAcademico.observacoes ?? null,
            },
        },
    };
}
