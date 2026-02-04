import { faturamento_tipo_atendimento, type Prisma } from "@prisma/client";
import { buildAvatarUrl } from "../../../utils/avatar-url.js";
import { computeDurationMinutes } from "../../atas-reuniao/utils/computeDurationMinutes.js";
import type { BillingListItem } from "../queries/billingListSelect.js";
import { buildLocalSessionTime } from "../utils/buildUtcDate.js";
import { buildBillingFrontId, resolveBillingOrigin } from "../utils/resolveBillingOrigin.js";
import { getBillingRateByType } from "../utils/getBillingRateByType.js";
import { calculateAge } from "../../../utils/calculateAge.js";

export function mapBillingListItem(item: BillingListItem) {
    const time = buildLocalSessionTime(
        item.inicio_em,
        item.fim_em,
    );
    const ref = resolveBillingOrigin(item);
    const values: Record<faturamento_tipo_atendimento, Prisma.Decimal | null> = {
        consultorio: item.terapeuta.valor_sessao_consultorio,
        homecare: item.terapeuta.valor_sessao_homecare,
        reuniao: item.terapeuta.valor_hora_reuniao,
        desenvolvimento_materiais: item.terapeuta.valor_hora_desenvolvimento_materiais,
        supervisao_dada: item.terapeuta.valor_hora_supervisao_dada,
        supervisao_recebida: item.terapeuta.valor_hora_supervisao_recebida,
    };
    const therapistRate = getBillingRateByType(values, item.tipo_atendimento);
    const durationMinutes = computeDurationMinutes(time.start, time.end);
    const clientRate = item.cliente.terapeuta.find((link) => link.terapeuta_id === item.terapeuta_id)?.valor_sessao ?? null;
    const clientRateValue = clientRate ? clientRate.toNumber() : 0;

    return {
        id: buildBillingFrontId(ref),
        origemId: item.id,
        origem: ref.origin,

        terapeutaId: item.terapeuta_id,
        terapeutaNome: item.terapeuta.nome,
        terapeutaAvatarUrl: buildAvatarUrl(item.terapeuta.arquivos),
        clienteId: item.cliente_id,
        clienteNome: item.cliente.nome,
        clienteIdade: calculateAge(item.cliente.dataNascimento),
        clienteAvatarUrl: buildAvatarUrl(item.cliente.arquivos),

        data: time.day,
        horarioInicio: time.start,
        horarioFim: time.end,

        tipoAtividade: item.tipo_atendimento,

        duracaoMinutos: durationMinutes,
        valorHora: therapistRate,
        valorTotal: durationMinutes ? Math.floor(durationMinutes / 60) * therapistRate : 0,

        valorHoraCliente: clientRateValue,
        valorTotalCliente: durationMinutes ? Math.floor(durationMinutes / 60) * clientRateValue : 0,

        status: item.status,
        area: item.sessao?.ocp.area,
        finalidade: item.ata?.finalidade,
        programaNome: item.sessao?.ocp.nome_programa,

        temAjudaCusto: item.ajuda_custo,
        motivoAjudaCusto: item.observacao_faturamento,
        valorAjudaCusto: item.valor_ajuda_custo,
        
        comprovantesAjudaCusto: item.arquivos.map((a) => ({
            id: a.id,
            nome: a.nome,
            url: a.caminho,
            tipo: a.mime_type,
            tamanho: a.tamanho ?? undefined,
        })),
        motivoRejeicao: item.motivo_rejeicao,

        faturamento: {
            dataSessao: time.day,
            horarioInicio: time.start,
            horarioFim: time.end,
            tipoAtendimento: item.tipo_atendimento,
            ajudaCusto: item.valor_ajuda_custo,
            observacaoFaturamento: item.observacao_faturamento,
            arquivosFaturamento: item.arquivos.map((a) => ({
                id: a.id.toString(),
                nome: a.nome,
                tipo: a.mime_type,
                tamanho: a.tamanho,
                url: a.caminho ?? undefined,
                caminho: a.caminho ?? undefined,
                arquivoId: a.caminho ?? undefined,
            })),
        },

        criadoEm: item.criado_em,
    }
}