import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database.js';
import type { UpdateMusicProgramInput, UpdateProgramInput } from '../types/olp.types.js';

export async function programUpdate(programId: number, input: UpdateProgramInput) {
    const {
        name,
        prazoInicio,
        prazoFim,
        goalTitle,
        goalDescription,
        shortTermGoalDescription,
        stimuliApplicationDescription,
        currentPerformanceLevel,
        status,
        criteria,
        notes,
    } = input;

    const data: Prisma.ocpUpdateInput = {};

    if (name) data.nome_programa = name;
    if (prazoInicio) data.data_inicio = new Date(prazoInicio);
    if (prazoFim) data.data_fim = new Date(prazoFim);
    if (goalTitle) data.objetivo_programa = goalTitle;
    if (goalDescription) data.objetivo_descricao = goalDescription;
    if (shortTermGoalDescription) data.objetivo_curto = shortTermGoalDescription;
    if (stimuliApplicationDescription) data.descricao_aplicacao = stimuliApplicationDescription;
    if (currentPerformanceLevel) data.desempenho_atual = currentPerformanceLevel;
    if (status) data.status = status === 'active' ? 'ativado' : 'arquivado';
    if (criteria) data.criterio_aprendizagem = criteria;
    if (notes) data.observacao_geral = notes;

    return await prisma.$transaction(async (tx) => {
        const newStimuliIds = input.stimuli
            .filter((s) => s.id) // só pega os que têm id
            .map((s) => Number(s.id));

        // Desativar os vínculos que não estão mais no input
        await tx.estimulo_ocp.updateMany({
            where: {
                id_ocp: programId,
                id_estimulo: { notIn: newStimuliIds },
            },
            data: { status: false },
        });

        // Fazer upsert (atualiza se existe, cria se não)
        for (const s of input.stimuli) {
            let stimulusId: number;

            if (!s.id) {
                // Criar novo estímulo base
                const newStimulus = await tx.estimulo.create({
                    data: {
                        nome: s.label,
                        descricao: s.description ?? null,
                    },
                });

                stimulusId = newStimulus.id;
            } else {
                stimulusId = Number(s.id);
            }

            // Criar ou atualizar vínculo com OCP
            await tx.estimulo_ocp.upsert({
                where: {
                    id_estimulo_id_ocp: {
                        id_estimulo: stimulusId,
                        id_ocp: programId,
                    },
                },
                update: {
                    nome: s.label,
                    status: s.active,
                    descricao: s.description ?? null,
                },
                create: {
                    id_estimulo: stimulusId,
                    id_ocp: programId,
                    nome: s.label,
                    status: s.active,
                },
            });
        }

        // Atualizar dados do OCP
        const ocp = await tx.ocp.update({
            where: { id: programId },
            data,
        });

        return ocp;
    });
}

export async function programMusicUpdate(programId: number, input: UpdateMusicProgramInput) {
    const {
        goalTitle,
        goalDescription,
        stimuli,
        notes,
        status,
        prazoInicio,
        prazoFim,
    } = input;

    const data: Prisma.ocpUpdateInput = {};

    if (goalTitle) data.objetivo_programa = goalTitle;
    if (goalDescription) data.objetivo_descricao = goalDescription;
    if (notes) data.observacao_geral = notes;
    if (status) data.status = status === 'active' ? 'ativado' : 'arquivado';
    if (prazoInicio) data.data_inicio = prazoInicio;
    if (prazoFim) data.data_fim = prazoFim;

    return await prisma.$transaction(async (tx) => {
        const newStimuliIds = stimuli
            .filter((s) => s.id) // só pega os que têm id
            .map((s) => Number(s.id));

        // Desativar os vínculos que não estão mais no input
        await tx.estimulo_ocp.updateMany({
            where: {
                id_ocp: programId,
                id_estimulo: { notIn: newStimuliIds },
            },
            data: { status: false },
        });

        // Fazer upsert (atualiza se existe, cria se não)
        for (const s of stimuli) {
            let stimulusId: number;

            if (!s.id) {
                // Criar novo estímulo base
                const newStimulus = await tx.estimulo.create({
                    data: {
                        nome: s.objetivo,
                        descricao: s.objetivoEspecifico ?? null,
                    },
                });

                stimulusId = newStimulus.id;
            } else {
                stimulusId = Number(s.id);
            }

            // Criar ou atualizar vínculo com OCP
            await tx.estimulo_ocp.upsert({
                where: {
                    id_estimulo_id_ocp: {
                        id_estimulo: stimulusId,
                        id_ocp: programId,
                    },
                },
                update: {
                    nome: s.objetivo,
                    status: s.active,
                    descricao: s.objetivoEspecifico ?? null,
                    metodos: s.metodos ?? null,
                    tecnicas_procedimentos: s.tecnicasProcedimentos ?? null,
                },
                create: {
                    id_estimulo: stimulusId,
                    id_ocp: programId,
                    nome: s.objetivo,
                    status: s.active,
                    descricao: s.objetivoEspecifico ?? null,
                    metodos: s.metodos ?? null,
                    tecnicas_procedimentos: s.tecnicasProcedimentos ?? null,
                },
            });
        }

        // Atualizar dados do OCP
        const ocp = await tx.ocp.update({
            where: { id: programId },
            data,
        });

        return ocp;
    });
}