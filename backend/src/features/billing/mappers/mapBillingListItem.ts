import { faturamento_tipo_atendimento, Prisma } from "@prisma/client";
import { buildAvatarUrl } from "../../../utils/avatar-url.js";
import { computeDurationMinutes } from "../../atas-reuniao/utils/computeDurationMinutes.js";
import type { BillingListItem } from "../queries/billingListSelect.js";
import { buildLocalSessionTime } from "../utils/buildUtcDate.js";
import { buildBillingFrontId, resolveBillingOrigin } from "../utils/resolveBillingOrigin.js";
import { getBillingRateByType } from "../utils/getBillingRateByType.js";
import { calculateAge } from "../../../utils/calculateAge.js";

/** Mapa de áreas em minúsculo para formato capitalizado */
const AREA_DISPLAY_NAMES: Record<string, string> = {
    'fonoaudiologia': 'Fonoaudiologia',
    'fisioterapia': 'Fisioterapia',
    'terapia ocupacional': 'Terapia Ocupacional',
    'terapia-ocupacional': 'Terapia Ocupacional',
    'psicologia': 'Psicologia',
    'musicoterapia': 'Musicoterapia',
    'terapia aba': 'Terapia ABA',
    'neuropsicologia': 'Neuropsicologia',
    'psicopedagogia': 'Psicopedagogia',
    'nutrição': 'Nutrição',
    'educador físico': 'Educador Físico',
    'pedagogia': 'Pedagogia',
    'psicomotricidade': 'Psicomotricidade',
};

/** Normaliza o nome da área para exibição consistente */
function normalizeAreaName(area: string | null | undefined): string | undefined {
    if (!area) return undefined;
    // Se já está no mapa normalizado, retorna o valor capitalizado
    const normalized = AREA_DISPLAY_NAMES[area.toLowerCase()];
    if (normalized) return normalized;
    // Se não encontrar, retorna como está (pode já estar capitalizado)
    return area;
}

/**
 * Busca o registro profissional do terapeuta para a área específica
 * Compara a área do lançamento com as áreas de atuação do terapeuta
 */
function getRegistroProfissional(
    registros: Array<{ numero_conselho: string | null; area_atuacao: { nome: string } }> | undefined,
    areaLancamento: string | null | undefined
): string | undefined {
    if (!registros || registros.length === 0) return undefined;
    
    // Se só tem um registro, retornar ele
    if (registros.length === 1) {
        return registros[0]?.numero_conselho ?? undefined;
    }
    
    // Se tem área específica, buscar o registro correspondente
    if (areaLancamento) {
        const areaLower = areaLancamento.toLowerCase();
        const registro = registros.find(r => 
            r.area_atuacao.nome.toLowerCase() === areaLower ||
            AREA_DISPLAY_NAMES[r.area_atuacao.nome.toLowerCase()] === areaLancamento
        );
        if (registro?.numero_conselho) {
            return registro.numero_conselho;
        }
    }
    
    // Fallback: retornar o primeiro registro que tiver número
    const primeiroComNumero = registros.find(r => r.numero_conselho);
    return primeiroComNumero?.numero_conselho ?? undefined;
}

export function mapBillingListItem(item: BillingListItem) {
    const time = buildLocalSessionTime(
        item.inicio_em,
        item.fim_em,
    );
    const ref = resolveBillingOrigin(item);
    const link = item.cliente.terapeuta.find((l) => l.terapeuta_id === item.terapeuta_id);
    const values: Record<faturamento_tipo_atendimento, Prisma.Decimal | null> = {
        consultorio: link?.valor_sessao_consultorio ?? null,
        homecare: link?.valor_sessao_homecare ?? null,
        reuniao: link?.valor_hora_reuniao ?? null,
        desenvolvimento_materiais: link?.valor_hora_desenvolvimento_materiais ?? null,
        supervisao_dada: link?.valor_hora_supervisao_dada ?? null,
        supervisao_recebida: link?.valor_hora_supervisao_recebida ?? null,
    };
    const therapistRate = getBillingRateByType(values, item.tipo_atendimento);
    const durationMinutes = computeDurationMinutes(time.start, time.end);

    const hours = durationMinutes
        ? new Prisma.Decimal(Math.floor(durationMinutes / 60))
        : new Prisma.Decimal(0);
    
    const totalHoursValue = hours.mul(therapistRate);

    const totalValue = item.valor_ajuda_custo
        ? totalHoursValue.plus(item.valor_ajuda_custo)
        : totalHoursValue;

    const totalValueNumber = totalValue.toNumber();
    const clientRate = item.cliente.terapeuta.find((l) => l.terapeuta_id === item.terapeuta_id)?.valor_cliente_sessao ?? null;
    const clientRateValue = clientRate ? clientRate.toNumber() : 0;

    // Buscar área do lançamento e registro profissional correspondente
    const areaLancamento = item.sessao?.ocp?.area ?? item.ata?.cabecalho_area_atuacao;
    const registroProfissional = getRegistroProfissional(
        item.terapeuta.registro_profissional,
        areaLancamento
    );

    return {
        id: buildBillingFrontId(ref),
        origemId: item.id,
        origem: ref.origin,

        terapeutaId: item.terapeuta_id,
        terapeutaNome: item.terapeuta.nome,
        terapeutaAvatarUrl: buildAvatarUrl(item.terapeuta.arquivos),
        terapeutaRegistroProfissional: registroProfissional,
        clienteId: item.cliente_id,
        clienteNome: item.cliente.nome,
        clienteIdade: calculateAge(item.cliente.dataNascimento),
        clienteDataNascimento: item.cliente.dataNascimento,
        clienteAvatarUrl: buildAvatarUrl(item.cliente.arquivos),

        data: time.day,
        horarioInicio: time.start,
        horarioFim: time.end,

        tipoAtividade: item.tipo_atendimento,

        duracaoMinutos: durationMinutes,
        valorHora: therapistRate,
        valorTotal: totalValueNumber,

        valorHoraCliente: clientRateValue,
        valorTotalCliente: durationMinutes ? Math.floor(durationMinutes / 60) * clientRateValue : 0,

        status: item.status,
        area: normalizeAreaName(item.sessao?.ocp.area ?? item.ata?.cabecalho_area_atuacao),
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