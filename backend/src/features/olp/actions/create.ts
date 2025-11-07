import { prisma } from "../../../config/database.js";
import type { createOCP, CreateSessionInput } from "../types/olp.types.js";

export async function program(data: createOCP) {
    return prisma.ocp.create({
        data: {
            cliente: { connect: { id: data.clientId } },
            terapeuta: { connect: { id: data.therapistId } },
            nome_programa: data.name ?? data.goalTitle,
            data_inicio: new Date(data.prazoInicio),
            data_fim: new Date (data.prazoFim),
            objetivo_programa: data.goalTitle,
            objetivo_descricao: data.goalDescription ?? null,
            criterio_aprendizagem: data.criteria ?? null,
            objetivo_curto: data.shortTermGoalDescription,
            descricao_aplicacao: data.stimuliApplicationDescription,
            observacao_geral: data.notes ?? null,
            estimulo_ocp: {
                create: data.stimuli.map((s) => ({
                    nome: s.label,
                    status: s.active,
                    estimulo: {
                        connectOrCreate: {
                            where: { nome: s.label },
                            create: { nome: s.label },
                        },
                    },
                })),
            },
        },
    });
}

export async function session(input: CreateSessionInput) {
    const { programId, patientId, therapistId, notes, attempts } = input;

    return await prisma.sessao.create({
        data: {
            ocp_id: programId,
            cliente_id: patientId,
            terapeuta_id: therapistId,
            data_criacao: new Date(),
            observacoes_sessao: notes?.trim() || null,
            trials: {
                create: attempts.map((a) => ({
                    estimulos_ocp_id: parseInt(a.stimulusId, 10),
                    ordem: a.attemptNumber,
                    resultado: a.type,
                })),
            },
        },
    });
}