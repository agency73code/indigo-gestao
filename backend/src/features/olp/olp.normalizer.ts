import type * as OcpTypes from "./types/olp.types.js";
import { differenceInYears } from 'date-fns';

export function mapOcpDetail(dto: OcpTypes.OcpDetailDTO) {
    return {
        id: dto.id.toString(),
        name: dto.nome_programa,
        patientId: dto.cliente_id,
        patientName: dto.cliente.nome,
        patientGuardian: dto.cliente.cuidadores?.[0]?.nome,
        patientAge: differenceInYears(new Date(), dto.cliente.dataNascimento!),
        patientPhotoUrl: null,
        prazoInicio: dto.data_inicio,
        prazoFim: dto.data_fim,
        therapistId: dto.terapeuta_id,
        therapistName: dto.terapeuta.nome,
        therapistPhotoUrl: null,
        createdAt: dto.criado_em.toISOString(),
        goalTitle: dto.objetivo_programa ?? "",
        goalDescription: dto.objetivo_descricao,
        longTermGoalDescription: dto.objetivo_descricao,
        shortTermGoalDescription: dto.objetivo_curto,
        stimuliApplicationDescription: dto.descricao_aplicacao,
        stimuli: dto.estimulo_ocp?.map((s: OcpTypes.OcpStimuloDTO, idx: number) => ({
            id: s.id_estimulo.toString(),
            order: idx + 1,
            label: s.nome ?? "",
            active: s.status,
            description: s.descricao ?? null,
        })) ?? [],
        criteria: dto.criterio_aprendizagem,
        notes: dto.observacao_geral ?? "",
        status: dto.status === 'ativado' ? "active" : "archived",
        currentPerformanceLevel: dto.desempenho_atual ?? null,
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
        observacoes: s.observacoes_sessao ?? null,
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
    const guardianName = dto.cuidadores?.[0]?.nome ?? null;
    return {
        id: dto.id,
        name: dto.nome,
        birthDate: dto.dataNascimento,
        guardianName,
    };
}

export function mapOcpReturn(dto: OcpTypes.ProgramRowDTO) {
    return {
        id: dto.id.toString(),
        title: dto.nome_programa,
        objective: dto.objetivo_programa,
        status: dto.status === 'ativado' ? 'active' : 'archived',
        lastSession: dto.atualizado_em.toISOString(),
        patientId: dto.cliente_id,
    };
}

export function mapOcpProgramSession(dto: OcpTypes.ProgramSelectResult) {
    return {
        id: String(dto.id),
        name: dto.nome_programa,
        patientId: dto.cliente.id,
        patientName: dto.cliente.nome,
        patientGuardian: dto.cliente.cuidadores[0]?.nome,
        patientAge: new Date().getFullYear() - dto.cliente.dataNascimento!.getFullYear(),
        patientPhotoUrl: null,
        therapistId: dto.terapeuta.id,
        therapistName: dto.terapeuta.nome,
        createdAt: dto.criado_em.toISOString(),
        prazoInicio: dto.data_inicio.toISOString(),
        prazoFim: dto.data_fim.toISOString(),
        goalTitle: dto.objetivo_programa,
        goalDescription: dto.objetivo_descricao,
        stimuli: dto.estimulo_ocp.map((e, idx) => ({
            id: String(e.id),
            order: idx + 1,
            label: e.nome ?? '',
            active: e.status,
        })),
        status: dto.status,
    }
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