import { prisma } from "../../../config/database.js";
import type { UpdateProgramInput } from "../types/olp.types.js";

export async function programUpdate(programId: number, input: UpdateProgramInput) {
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
            data: {
                nome_programa: input.name,
                data_inicio: new Date(input.prazoInicio),
                data_fim: new Date(input.prazoFim),
                objetivo_programa: input.goalTitle,
                objetivo_descricao: input.goalDescription,
                objetivo_curto: input.shortTermGoalDescription,
                descricao_aplicacao: input.stimuliApplicationDescription,
                status: input.status === "active" ? "ativado" : "arquivado",
                criterio_aprendizagem: input.criteria,
                observacao_geral: input.notes,
            },
        });

        return ocp;
    });
}