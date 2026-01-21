import { prisma } from "../../../config/database.js";
import { AppError } from "../../../errors/AppError.js";
import type { PsychoPayload } from "./psychotherapy.schema.js";

export async function createPsychotherapyRecord(payload: PsychoPayload, userId: string) {
    return await prisma.$transaction(async (tx) => {
        const anamnese = await tx.anamnese.findFirst({
            where: { cliente_id: payload.cliente_id },
            select: { id: true },
        });

        if (!anamnese) throw new AppError('ANAMNESE_REQUIRED', 'Cliente precisa ter anamnese antes de criar prontuário.', 409);

        const medicalRecord =  await tx.ocp_prontuario.create({
            data: {
                cliente_id: payload.cliente_id,
                terapeuta_id: userId,
                profissao_ocupacao: payload.informacoes_educacionais.profissao_ocupacao,
                observacao_educacional: payload.informacoes_educacionais.observacoes,
    
                observacoes_nucleo_familiar: payload.observacoes_nucleo_familiar,
                
                encaminhado_por: payload.avaliacao_demanda.encaminhado_por,
                motivo_busca_atendimento: payload.avaliacao_demanda.motivo_busca_atendimento,
                atendimentos_anteriores: payload.avaliacao_demanda.atendimentos_anteriores,
                observacao_demanda: payload.avaliacao_demanda.observacoes,
    
                objetivos_trabalho: payload.objetivos_trabalho,
                avaliacao_atendimento: payload.avaliacao_atendimento,
            }
        });

        const levelSchooling = await tx.cliente.updateMany({
            where: { 
                id: payload.cliente_id,
                OR:  [
                    { nivel_escolaridade: { not: payload.informacoes_educacionais.nivel_escolaridade } },
                    { nivel_escolaridade: null },
                ],
            },
            data: { nivel_escolaridade: payload.informacoes_educacionais.nivel_escolaridade },
        });

        const trainingInstitution = await tx.dados_escola.updateMany({
            where: { 
                clienteId: payload.cliente_id,
                nome: { not: payload.informacoes_educacionais.instituicao_formacao },
            },
            data: {
                nome: payload.informacoes_educacionais.instituicao_formacao,
            }
        });

        const previousTherapies = payload.avaliacao_demanda.terapias_previas;
        const previousTherapiesNews = previousTherapies.filter((therapy) => typeof therapy.id === 'string');
        const previousTherapiesOlds = previousTherapies.filter((therapy) => typeof therapy.id === 'number');
        const previousTherapiesOnDelete = previousTherapiesOlds.map((pt) => pt.id as number);

        const previousTherapiesOldsUpdate = await Promise.all(
            previousTherapiesOlds.map((pt) =>
                tx.anamnese_terapia_previa.updateMany({
                    where: { 
                        id: pt.id as number,
                        anamnese_id: anamnese.id,
                        OR: [
                            { profissional: {not: pt.profissional } },
                            { especialidade_abordagem: { not: pt.especialidade_abordagem } },
                            { tempo_intervencao: { not: pt.tempo_intervencao } },
                            { observacao: { not: pt.observacao } },
                            { ativo: { not: pt.ativo } },
                        ]
                    },
                    data: {
                        profissional: pt.profissional,
                        especialidade_abordagem: pt.especialidade_abordagem,
                        tempo_intervencao: pt.tempo_intervencao,
                        observacao: pt.observacao,
                        ativo: pt.ativo,
                    },
                })
            )
        );

        const previousTherapiesDelete = await tx.anamnese_terapia_previa.deleteMany({
            where: {
                anamnese_id: anamnese.id,
                id: { notIn: previousTherapiesOnDelete },
            },
        });

        const previousTherapiesNewCreate = await tx.anamnese_terapia_previa.createMany({
            data: previousTherapiesNews.map((pt) => ({
                anamnese_id: anamnese.id,
                profissional: pt.profissional,
                especialidade_abordagem: pt.especialidade_abordagem,
                tempo_intervencao: pt.tempo_intervencao,
                observacao: pt.observacao,
                ativo: pt.ativo,
            })),
        });

        return {
            medicalRecord,
            levelSchooling,
            trainingInstitution,
            previousTherapiesNewCreate, 
            previousTherapiesOldsUpdate, 
            previousTherapiesDelete,
        };
    });
}