import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';
import { mapMarco, mapSimNao } from './helpers.js';

type InitialDevelopmentPayload = AnamnesePayload['desenvolvimentoInicial'];

type InitialDevelopmentCreateInput = Pick<
    Prisma.anamneseCreateInput,
    'desenvolvimento_inicial'
>;

type MarcoSet = ReturnType<typeof mapMarco>;

function buildNeuropsychomotorMarcos(neuropsicomotor: InitialDevelopmentPayload['neuropsicomotor']) {
    return {
        headHeld: mapMarco(neuropsicomotor.sustentouCabeca),
        rolled: mapMarco(neuropsicomotor.rolou),
        sat: mapMarco(neuropsicomotor.sentou),
        crawled: mapMarco(neuropsicomotor.engatinhou),
        walkedWithSupport: mapMarco(neuropsicomotor.andouComApoio),
        walkedWithoutSupport: mapMarco(neuropsicomotor.andouSemApoio),
        ran: mapMarco(neuropsicomotor.correu),
        scooter: mapMarco(neuropsicomotor.andouDeMotoca),
        bicycle: mapMarco(neuropsicomotor.andouDeBicicleta),
        stairs: mapMarco(neuropsicomotor.subiuEscadasSozinho),
    };
}

function buildSpeechMarcos(falaLinguagem: InitialDevelopmentPayload['falaLinguagem']) {
    return {
        babbled: mapMarco(falaLinguagem.balbuciou),
        firstWords: mapMarco(falaLinguagem.primeirasPalavras),
        firstSentences: mapMarco(falaLinguagem.primeirasFrases),
        pointing: mapMarco(falaLinguagem.apontouParaFazerPedidos),
    };
}

function buildMarcoFields(prefix: string, marco: MarcoSet) {
    return {
        [`${prefix}_meses`]: marco.months,
        [`${prefix}_nao_realiza`]: marco.notPerform,
        [`${prefix}_nao_soube_informar`]: marco.didntKnow,
    } as const;
}

function buildSpeechMarcoFields(prefix: string, marco: MarcoSet) {
    return {
        [`${prefix}_meses`]: marco.months,
        [`${prefix}_nao`]: marco.notPerform,
        [`${prefix}_nao_soube_informar`]: marco.didntKnow,
    } as const;
}

export function buildInitialDevelopment(
    initialDevelopment: InitialDevelopmentPayload,
): InitialDevelopmentCreateInput {
    const neuropsicomotorMarcos = buildNeuropsychomotorMarcos(
        initialDevelopment.neuropsicomotor,
    );
    const speechMarcos = buildSpeechMarcos(initialDevelopment.falaLinguagem);
    console.log(speechMarcos.pointing);
    return {
        desenvolvimento_inicial: {
            create: {
                // gestação / parto
                tipo_parto: initialDevelopment.gestacaoParto.tipoParto,
                semanas: initialDevelopment.gestacaoParto.semanas,
                apgar_1_min: initialDevelopment.gestacaoParto.apgar1min,
                apgar_5_min: initialDevelopment.gestacaoParto.apgar5min,
                intercorrencias: initialDevelopment.gestacaoParto.intercorrencias ?? null,

                // neuropsicomotor
                ...buildMarcoFields('sustentou_cabeca', neuropsicomotorMarcos.headHeld),
                ...buildMarcoFields('rolou', neuropsicomotorMarcos.rolled),
                ...buildMarcoFields('sentou', neuropsicomotorMarcos.sat),
                ...buildMarcoFields('engatinhou', neuropsicomotorMarcos.crawled),
                ...buildMarcoFields('andou_com_apoio', neuropsicomotorMarcos.walkedWithSupport),
                ...buildMarcoFields('andou_sem_apoio', neuropsicomotorMarcos.walkedWithoutSupport),
                ...buildMarcoFields('correu', neuropsicomotorMarcos.ran),
                ...buildMarcoFields('andou_de_motoca', neuropsicomotorMarcos.scooter),
                ...buildMarcoFields('andou_de_bicicleta', neuropsicomotorMarcos.bicycle),
                ...buildMarcoFields('subiu_escadas_sozinho', neuropsicomotorMarcos.stairs),

                motricidade_fina: initialDevelopment.neuropsicomotor.motricidadeFina ?? null,

                // fala / linguagem - marcos (meses + flags)
                ...buildSpeechMarcoFields('balbuciou', speechMarcos.babbled),
                ...buildSpeechMarcoFields('primeiras_palavras', speechMarcos.firstWords),
                ...buildSpeechMarcoFields('primeiras_frases', speechMarcos.firstSentences),
                ...buildSpeechMarcoFields('apontou_para_fazer_pedidos', speechMarcos.pointing),

                // demais campos de fala/linguagem
                faz_uso_de_gestos: mapSimNao(initialDevelopment.falaLinguagem.fazUsoDeGestos),
                faz_uso_de_gestos_quais: initialDevelopment.falaLinguagem.fazUsoDeGestosQuais ?? null,

                audicao: initialDevelopment.falaLinguagem.audicao ?? null,

                teve_otite_de_repeticao: mapSimNao(initialDevelopment.falaLinguagem.teveOtiteDeRepeticao),
                otite_vezes: initialDevelopment.falaLinguagem.otiteVezes ?? null,
                otite_periodo_meses: initialDevelopment.falaLinguagem.otitePeriodoMeses ?? null,
                otite_frequencia: initialDevelopment.falaLinguagem.otiteFrequencia ?? null,

                faz_ou_fez_uso_tubo_ventilacao: mapSimNao(
                    initialDevelopment.falaLinguagem.fazOuFezUsoTuboVentilacao,
                ),
                tubo_ventilacao_observacao:
                    initialDevelopment.falaLinguagem.tuboVentilacaoObservacao ?? null,

                faz_ou_fez_uso_objeto_oral: mapSimNao(
                    initialDevelopment.falaLinguagem.fazOuFezUsoObjetoOral,
                ),
                objeto_oral_especificar: initialDevelopment.falaLinguagem.objetoOralEspecificar ?? null,

                usa_mamadeira: mapSimNao(initialDevelopment.falaLinguagem.usaMamadeira),
                mamadeira_ha: initialDevelopment.falaLinguagem.mamadeiraHa ?? null,
                mamadeira_vezes_ao_dia: initialDevelopment.falaLinguagem.mamadeiraVezesAoDia ?? null,

                comunicacao_atual: initialDevelopment.falaLinguagem.comunicacaoAtual ?? null,
            },
        },
    };
}
