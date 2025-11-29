import { prisma } from "../../../config/database.js";
import { R2UploadService } from "../../file/r2/r2-upload.js";
import type { CreateProgramPayload, CreateSessionInput, CreateToSessionInput } from "../types/olp.types.js";

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

export async function TOSession(input: CreateToSessionInput) {
    const { programId, patientId, therapistId, notes, attempts, files = [] } = input;

    const ocp = await prisma.ocp.findUnique({
        where: { id: programId },
        include: { estimulo_ocp: true }
    });

    if (!ocp) {
        throw new Error('Programa não encontrado.');
    }

    const trialsData = attempts.map((a) => {
        const vinculo = ocp.estimulo_ocp.find(
            (v) => v.id_estimulo === Number(a.activityId)
        );

        if (!vinculo) {
            throw new Error(`A atividade ${a.activityId} não pertence a este programa.`);
        }

        return {
            estimulos_ocp_id: vinculo.id,
            ordem: a.attemptNumber,
            resultado: a.type,
            timestamp: new Date(a.timestamp),
            duracao_minutos: a.durationMinutes ?? null
        };
    });

    const uploadedFiles = [];

    for (const file of files) {
        const uploaded = await R2UploadService.uploadFile({
            buffer: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname,
            programId,
            patientId
        });

        uploadedFiles.push({
            nome: file.originalname,
            caminho: uploaded.key
        });
    }

    const session = await prisma.sessao_to.create({
        data: {
            ocp_id: programId,
            cliente_id: patientId,
            terapeuta_id: therapistId,
            observacoes: notes?.trim() || null,

            trials: {
                create: trialsData
            },

            arquivos: {
                create: uploadedFiles
            }
        },

        include: {
            trials: true,
            arquivos: true
        }
    });

    return session;
}