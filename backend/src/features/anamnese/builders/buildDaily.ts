import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';
import { mapSimNao } from './helpers.js';

type DailyPayload = AnamnesePayload['atividadesVidaDiaria'];

type DailyCreateInput = Pick<Prisma.anamneseCreateInput, 'atividades_vida_diaria'>;

export function buildDaily(daily: DailyPayload): DailyCreateInput {
    return {
        atividades_vida_diaria: {
            create: {
                // desfralde
                desfralde_diurno_urina_anos: daily.desfralde?.desfraldeDiurnoUrina?.anos ?? null,
                desfralde_diurno_urina_meses: daily.desfralde?.desfraldeDiurnoUrina?.meses ?? null,
                desfralde_diurno_urina_utiliza_fralda:
                    daily.desfralde?.desfraldeDiurnoUrina?.utilizaFralda ?? null,

                desfralde_noturno_urina_anos: daily.desfralde?.desfraldeNoturnoUrina?.anos ?? null,
                desfralde_noturno_urina_meses: daily.desfralde?.desfraldeNoturnoUrina?.meses ?? null,
                desfralde_noturno_urina_utiliza_fralda:
                    daily.desfralde?.desfraldeNoturnoUrina?.utilizaFralda ?? null,

                desfralde_fezes_anos: daily.desfralde?.desfraldeFezes?.anos ?? null,
                desfralde_fezes_meses: daily.desfralde?.desfraldeFezes?.meses ?? null,
                desfralde_fezes_utiliza_fralda: daily.desfralde?.desfraldeFezes?.utilizaFralda ?? null,

                se_limpa_sozinho_urinar: mapSimNao(daily.desfralde?.seLimpaSozinhoUrinar),
                se_limpa_sozinho_defecar: mapSimNao(daily.desfralde?.seLimpaSozinhoDefecar),
                lava_as_maos_apos_uso_banheiro: mapSimNao(
                    daily.desfralde?.lavaAsMaosAposUsoBanheiro,
                ),
                apresenta_alteracao_habito_intestinal: mapSimNao(
                    daily.desfralde?.apresentaAlteracaoHabitoIntestinal,
                ),
                desfralde_observacoes: daily.desfralde?.observacoes ?? null,

                // sono
                dormem_media_horas_noite: daily.sono?.dormemMediaHorasNoite ?? null,
                dormem_media_horas_dia: daily.sono?.dormemMediaHorasDia ?? null,
                periodo_sono_dia: daily.sono?.periodoSonoDia ?? null,

                tem_dificuldade_iniciar_sono: mapSimNao(daily.sono?.temDificuldadeIniciarSono),
                acorda_de_madrugada: mapSimNao(daily.sono?.acordaDeMadrugada),
                dorme_na_propria_cama: mapSimNao(daily.sono?.dormeNaPropriaCama),
                dorme_no_proprio_quarto: mapSimNao(daily.sono?.dormeNoProprioQuarto),
                apresenta_sono_agitado: mapSimNao(daily.sono?.apresentaSonoAgitado),
                e_sonambulo: mapSimNao(daily.sono?.eSonambulo),

                sono_observacoes: daily.sono?.observacoes ?? null,

                // habitos de higiene
                toma_banho_lava_corpo_todo: daily.habitosHigiene?.tomaBanhoLavaCorpoTodo ?? null,
                seca_corpo_todo: daily.habitosHigiene?.secaCorpoTodo ?? null,
                retira_todas_pecas_roupa: daily.habitosHigiene?.retiraTodasPecasRoupa ?? null,
                coloca_todas_pecas_roupa: daily.habitosHigiene?.colocaTodasPecasRoupa ?? null,
                poe_calcados_sem_cadarco: daily.habitosHigiene?.poeCalcadosSemCadarco ?? null,
                poe_calcados_com_cadarco: daily.habitosHigiene?.poeCalcadosComCadarco ?? null,
                escova_os_dentes: daily.habitosHigiene?.escovaOsDentes ?? null,
                penteia_o_cabelo: daily.habitosHigiene?.penteiaOCabelo ?? null,

                habitos_higiene_observacoes: daily.habitosHigiene?.observacoes ?? null,

                // alimentacao
                apresenta_queixa_alimentacao: mapSimNao(daily.alimentacao?.apresentaQueixaAlimentacao),
                se_alimenta_sozinho: mapSimNao(daily.alimentacao?.seAlimentaSozinho),
                e_seletivo_quanto_alimentos: mapSimNao(daily.alimentacao?.eSeletivoQuantoAlimentos),
                passa_dia_inteiro_sem_comer: mapSimNao(daily.alimentacao?.passaDiaInteiroSemComer),
                apresenta_rituais_para_alimentar: mapSimNao(
                    daily.alimentacao?.apresentaRituaisParaAlimentar,
                ),
                esta_abaixo_ou_acima_peso: mapSimNao(daily.alimentacao?.estaAbaixoOuAcimaPeso),

                esta_abaixo_ou_acima_peso_descricao:
                    daily.alimentacao?.estaAbaixoOuAcimaPesoDescricao ?? null,

                tem_historico_anemia: mapSimNao(daily.alimentacao?.temHistoricoAnemia),
                tem_historico_anemia_descricao: daily.alimentacao?.temHistoricoAnemiaDescricao ?? null,

                rotina_alimentar_problema_familia: mapSimNao(
                    daily.alimentacao?.rotinaAlimentarEProblemaFamilia,
                ),
                rotina_alimentar_problema_familia_desc:
                    daily.alimentacao?.rotinaAlimentarEProblemaFamiliaDescricao ?? null,

                alimentacao_observacoes: daily.alimentacao?.observacoes ?? null,
            },
        },
    };
}
