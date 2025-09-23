import type * as OcpTypes from "./ocp.types.js";
import { differenceInYears } from 'date-fns';

export function mapOcpDetail(dto: OcpTypes.OcpDetailDTO): OcpTypes.getOCP {
    return {
        id: dto.id.toString(),
        name: dto.nome_programa,
        patientId: dto.cliente_id,
        patientName: dto.cliente.nome,
        patientGuardian: dto.cliente.cliente_responsavel?.[0]?.responsaveis.nome,
        patientAge: differenceInYears(new Date(), dto.cliente.data_nascimento),
        patientPhotoUrl: null,
        therapistId: dto.criador_id,
        therapistName: dto.criador.nome,
        createdAt: dto.criado_em.toISOString(),
        goalTitle: dto.objetivo_programa ?? "",
        goalDescription: dto.objetivo_descricao ?? "",
        stimuli: dto.estimulo_ocp?.map((s: OcpTypes.OcpStimuloDTO, idx: number) => ({
            id: s.id_estimulo.toString(),
            order: idx + 1,
            label: s.nome ?? '',
            description: s.descricao ?? '',
            active: s.status,
        })) ?? [],
        criteria: dto.dominio_criterio ?? '',
        notes: dto.observacao_geral ?? '',
        status: dto.status as "active" | "archived",
    }
}

export function mapSessionList(dto: OcpTypes.SessionDTO[]): OcpTypes.Session[] {
    return dto.map((s) => ({
        id: s.id.toString(),
        pacienteId: s.cliente_id,
        terapeutaId: s.terapeuta_id,
        data: s.data_criacao.toISOString(),
        programa: s.ocp?.nome_programa ?? '',
        objetivo: s.ocp?.objetivo_programa ?? '',
        prazoInicio: s.ocp?.criado_em.toISOString(),
        prazoFim: null,
        registros: s.trials.map((t) => ({
            tentativa: t.ordem,
            resultado: translateResult(t.resultado),
            stimulusId: t.estimulosOcp?.id.toString(),
            stimulusLabel: t.estimulosOcp?.nome ?? undefined,
        })),
    }));
}

export function mapSessionReturn(session: OcpTypes.UnmappedSession) {
    const totalTrials = session.trials.length;
    const correctTrials = session.trials.filter(t => t.resultado !== 'error').length;
    const independentTrials = session.trials.filter(t => t.resultado === 'independent').length;

    return {
        id: session.id.toString(),
        date: session.data_criacao.toISOString(),
        therapistName: session.terapeuta?.nome,
        overallScore: totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : null,
        independenceRate: totalTrials > 0 ? Math.round((independentTrials / totalTrials) * 100) : null,
        preview: session.trials.map(t => t.resultado as 'error' | 'prompted' | 'independent'),
    };
}

export function mapClientReturn(dto: OcpTypes.ClientRowDTO) {
    const guardianName = dto.cliente_responsavel?.[0]?.responsaveis?.nome ?? null;
    return {
        id: dto.id,
        name: dto.nome,
        birthDate: dto.data_nascimento,
        guardianName,
    };
}

export function mapOcpReturn(dto: OcpTypes.ProgramRowDTO) {
    return {
        id: dto.id.toString(),
        title: dto.nome_programa,
        objective: dto.objetivo_programa,
        status: dto.status as 'active' | 'archived',
        lastSession: dto.atualizado_em.toISOString(),
        patientId: dto.cliente_id,
    };
}

function translateResult(result: string): 'acerto' | 'erro' | 'ajuda' {
    switch (result) {
        case 'independent':
            return 'acerto';
        case 'error':
            return 'erro';
        case 'prompted':
            return 'ajuda';
        default:
            return 'erro';
    }
}