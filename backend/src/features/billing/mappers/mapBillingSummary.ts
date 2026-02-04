import type { Prisma, faturamento_tipo_atendimento } from "@prisma/client";
import { buildLocalSessionTime } from "../utils/buildUtcDate.js";
import { computeDurationMinutes } from "../../atas-reuniao/utils/computeDurationMinutes.js";
import { getBillingRateByType } from "../utils/getBillingRateByType.js";
import type { BillingSummaryItem } from "../types/BillingSummaryItem.js";

const tipoAtividadeLabels: Record<faturamento_tipo_atendimento, { tipo: string; label: string }> = {
    consultorio: { tipo: "consultorio", label: "Consultório" },
    homecare: { tipo: "homecare", label: "Homecare" },
    hora_reuniao: { tipo: "reuniao", label: "de Reuniões" },
    hora_supervisao_recebida: { tipo: "supervisao_recebida", label: "Supervisão Recebida" },
    hora_supervisao_dada: { tipo: "supervisao_dada", label: "Supervisão Dada" },
    hora_desenvolvimento_materiais: { tipo: "desenvolvimento_materiais", label: "Desenv. Materiais" },
};

export function mapBillingSummary(data: BillingSummaryItem[]) {
    const porTipoMap = new Map<string, { minutos: number; quantidade: number; valor: number; label: string }>();

    let totalMinutos = 0;
    let totalValor = 0;

    for (const item of data) {
        const time = buildLocalSessionTime(item.inicio_em, item.fim_em);
        const durationMinutes = computeDurationMinutes(time.start, time.end) ?? 0;

        const values: Record<faturamento_tipo_atendimento, Prisma.Decimal | null> = {
            consultorio: item.terapeuta.valor_sessao_consultorio,
            homecare: item.terapeuta.valor_sessao_homecare,
            hora_reuniao: item.terapeuta.valor_hora_reuniao,
            hora_desenvolvimento_materiais: item.terapeuta.valor_hora_desenvolvimento_materiais,
            hora_supervisao_dada: item.terapeuta.valor_hora_supervisao_dada,
            hora_supervisao_recebida: item.terapeuta.valor_hora_supervisao_recebida,
        };
        const rate = getBillingRateByType(values, item.tipo_atendimento);
        const valor = durationMinutes ? Math.floor(durationMinutes / 60) * rate : 0;

        totalMinutos += durationMinutes;
        totalValor += valor;

        const tipoInfo = tipoAtividadeLabels[item.tipo_atendimento];
        const current = porTipoMap.get(tipoInfo.tipo) ?? {
            minutos: 0,
            quantidade: 0,
            valor: 0,
            label: tipoInfo.label,
        };
        porTipoMap.set(tipoInfo.tipo, {
            minutos: current.minutos + durationMinutes,
            quantidade: current.quantidade + 1,
            valor: current.valor + valor,
            label: tipoInfo.label,
        });
    }

    const horas = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    const totalHoras = mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;

    return {
        totalMinutos,
        totalHoras,
        totalValor,
        totalLancamentos: data.length,
        porStatus: {
            pendentes: data.filter((p) => p.status === "pendente").length,
            aprovados: data.filter((p) => p.status === "aprovado").length,
            rejeitados: data.filter((p) => p.status === "rejeitado").length,
        },
        porTipoAtividade: Array.from(porTipoMap.entries()).map(([tipo, entry]) => ({
            tipo,
            label: entry.label,
            minutos: entry.minutos,
            quantidade: entry.quantidade,
            valor: entry.valor,
        })),
    };
}