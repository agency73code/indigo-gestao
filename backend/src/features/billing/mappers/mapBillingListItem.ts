import { buildAvatarUrl } from "../../../utils/avatar-url.js";
import { computeDurationMinutes } from "../../atas-reuniao/utils/computeDurationMinutes.js";
import type { BillingListItem } from "../queries/billingListSelect.js";
import { buildLocalSessionTime } from "../utils/buildUtcDate.js";
import { buildBillingFrontId, resolveBillingOrigin } from "../utils/resolveBillingOrigin.js";


export function mapBillingListItem(item: BillingListItem) {
    const time = buildLocalSessionTime(
        item.inicio_em,
        item.fim_em,
    );
    const ref = resolveBillingOrigin(item);

    return {
        id: buildBillingFrontId(ref),
        origemId: item.id,
        origem: ref.origin,

        terapeutaId: item.terapeuta_id,
        terapeutaNome: item.terapeuta.nome,
        terapeutaAvatarUrl: buildAvatarUrl(item.terapeuta.arquivos),
        clienteId: item.cliente_id,
        clienteNome: item.cliente.nome,
        clienteAvatarUrl: buildAvatarUrl(item.cliente.arquivos),

        data: time.day,
        horarioInicio: time.start,
        horarioFim: time.end,

        tipoAtividade: item.tipo_atendimento,

        duracaoMinutos: computeDurationMinutes(time.start, time.end),
        valorHora: 0,
        valorTotal: 0,

        status: item.status,
        area: item.sessao?.ocp.area,
        finalidade: item.ata?.finalidade,
        programaNome: item.sessao?.ocp.nome_programa,

        temAjudaCusto: item.ajuda_custo,
        motivoAjudaCusto: item.observacao_faturamento,
        valorAjudaCusto: item.valor_ajuda_custo,
        
        comprovantesAjudaCusto: [],
        motivoRejeicao: item.motivo_rejeicao,

        faturamento: {
            dataSessao: time.day,
            horarioInicio: time.start,
            horarioFim: time.end,
            tipoAtendimento: item.tipo_atendimento,
            ajudaCusto: item.valor_ajuda_custo,
            observacaoFaturamento: item.observacao_faturamento,
            arquivosFaturamento: [],
        },

        criadoEm: item.criado_em,
    }
}