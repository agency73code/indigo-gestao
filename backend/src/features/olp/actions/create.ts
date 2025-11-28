import { prisma } from "../../../config/database.js";
import type { CreateProgramPayload, CreateSessionInput } from "../types/olp.types.js";

export async function program(data: CreateProgramPayload) {
    const isTO = data.area === 'terapia-ocupacional';

    return prisma.ocp.create({
        data: {
            cliente: { connect: { id: data.patientId } },
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
                    descricao: s.description ?? null,
                    estimulo: {
                        connectOrCreate: {
                            where: { nome: s.label },
                            create: { 
                                nome: s.label,
                                descricao: s.description ?? null
                            },
                        },
                    },
                })),
            },
            area: data.area,
            desempenho_atual: isTO
                ? data.currentPerformanceLevel ?? null
                : null,
        },
    });
}

export async function session(input: CreateSessionInput) {
    const { programId, patientId, therapistId, notes, attempts } = input;

    const ocp = await prisma.ocp.findUnique({
        where: { id: Number(programId) },
        include: { estimulo_ocp: true },
    });

    if (!ocp) {
        throw new Error('Programa não encontrado.');
    }

    const trialsData = attempts.map((a) => {
        const vinculo = ocp.estimulo_ocp.find(
        (v) => v.id_estimulo === Number(a.stimulusId)
        );

        if (!vinculo) {
        throw new Error(`O estímulo ${a.stimulusId} não pertence a este programa.`);
        }

        return {
            estimulos_ocp_id: vinculo.id,
            ordem: a.attemptNumber,
            resultado: a.type,
        };
    });

    return await prisma.sessao.create({
        data: {
            ocp_id: programId,
            cliente_id: patientId,
            terapeuta_id: therapistId,
            data_criacao: new Date(),
            observacoes_sessao: notes?.trim() || null,
            trials: {
                create: trialsData,
            },
            area: 'fonoaudiologia',
        },
    });
}