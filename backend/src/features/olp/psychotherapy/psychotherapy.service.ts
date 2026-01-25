import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { AppError } from "../../../errors/AppError.js";
import type { CreateEvolutionType, PsychoPayload, PsychoUpdatePayload, queryType } from "./psychotherapy.schema.js";
import { calculateAge } from "../../../utils/calculateAge.js";
import { toDateOnly } from "../../../utils/toDateOnly.js";
import { getVisibilityScope } from "../../../utils/visibilityFilter.js";
import { queryPsychologicalRecord } from "./querys/queryPsychologicalRecord.js";
import { mapPsychologicalRecord } from "./mappers/mapPsychologicalRecord.js";
import { canAccessThis } from "../../../authorization/resourceAccess.policy.js";
import { forbidden } from "../../../errors/forbidden.js";
import type { ParsedFile } from "../../../utils/parseMultipartFiles.js";
import { R2GenericUploadService } from "../../file/r2/r2-upload-generic.js";
import { inferFileType } from "./util/inferFileType.js";
import { getLastEvolution } from "./util/lastEvolution.js";

export async function createPsychotherapyRecord(payload: PsychoPayload, userId: string) {
    return await prisma.$transaction(async (tx) => {
        const anamnese = await tx.anamnese.findFirst({
            where: { cliente_id: payload.cliente_id },
            select: { id: true },
        });

        if (!anamnese) throw new AppError('ANAMNESE_REQUIRED', 'Cliente precisa ter anamnese antes de criar prontuário.', 409);

        const medicalRecord = await tx.ocp_prontuario.create({
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

        await tx.cliente.updateMany({
            where: { 
                id: payload.cliente_id,
                OR:  [
                    { nivel_escolaridade: { not: payload.informacoes_educacionais.nivel_escolaridade } },
                    { nivel_escolaridade: null },
                ],
            },
            data: { nivel_escolaridade: payload.informacoes_educacionais.nivel_escolaridade },
        });

        await tx.dados_escola.updateMany({
            where: { 
                clienteId: payload.cliente_id,
                nome: { not: payload.informacoes_educacionais.instituicao_formacao },
            },
            data: {
                nome: payload.informacoes_educacionais.instituicao_formacao,
            }
        });

        const familyNucleus = payload.nucleo_familiar.filter((family) => family.origem_banco === false);

        if (familyNucleus.length > 0) {
            const seen = new Set<string>();

            for (const family of familyNucleus) {
                if (seen.has(family.cpf)) {
                    throw new AppError(
                        'DUPLICATE_FAMILY_MEMBER',
                        'CPF repetido na lista de familiares.',
                        400
                    );
                }
                seen.add(family.cpf);
            }

            const existingFamily = await tx.cuidador.findFirst({
                where: {
                    clienteId: payload.cliente_id,
                    cpf: { in: familyNucleus.map(family => family.cpf) },
                },
                select: { cpf: true },
            });
    
            if (existingFamily) {
                throw new AppError(
                    'DUPLICATE_FAMILY_MEMBER',
                    'Já existe um familiar cadastrado com este CPF para este cliente.',
                    409
                );
            }
    
            const clientAddress = await tx.cliente_endereco.findFirst({
                where: { clienteId: payload.cliente_id },
                select: { enderecoId: true },
            });
    
            await tx.cuidador.createMany({
                data: familyNucleus.map((fn) => ({
                    relacao: fn.parentesco,
                    descricaoRelacao: fn.descricao_relacao,
                    nome: fn.nome,
                    cpf: fn.cpf,
                    profissao: fn.ocupacao,
                    clienteId: payload.cliente_id,
                    enderecoId: clientAddress?.enderecoId ?? null,
                    dataNascimento: fn.data_nascimento,
                })),
            });
        }

        const previousTherapies = payload.avaliacao_demanda.terapias_previas.filter((therapy) => typeof therapy.id === 'string');

        if (previousTherapies.length > 0) {
            await tx.anamnese_terapia_previa.createMany({
                data: previousTherapies.map((pt) => ({
                    anamnese_id: anamnese.id,
                    profissional: pt.profissional,
                    especialidade_abordagem: pt.especialidade_abordagem,
                    tempo_intervencao: pt.tempo_intervencao,
                    observacao: pt.observacao,
                    ativo: pt.ativo,
                })),
            });
        }

        return {
            id: medicalRecord.id,
        };
    });
}

export async function searchMedicalRecordByClient(clientId: string, userId: string) {
    const medicalRecord = await prisma.ocp_prontuario.findFirst({
        where: { cliente_id: clientId },
        select: queryPsychologicalRecord,
    });

    if (!medicalRecord) {
        throw new AppError(
            'MEDICAL_RECORD_NOT_FOUND',
            'Prontuário do cliente não encontrado',
            404,
        )
    };

    const visibility = await getVisibilityScope(userId);
    const ownership = {
        clientId: medicalRecord.cliente_id,
        therapistId: medicalRecord.terapeuta_id,
    };
    const allowed = await canAccessThis({ ownership, userId, visibility });
    if (!allowed) throw forbidden();

    return mapPsychologicalRecord(medicalRecord);
}

export async function listMedicalRecords(query: queryType, userId: string) {
    const { q, status, page, page_size } = query;

    const visibility = await getVisibilityScope(userId);
    if (visibility.scope === 'none') throw new AppError('FORBIDDEN', 'Acesso negado para consultar prontuários', 403);

    const where: Prisma.ocp_prontuarioWhereInput = {};

    if (q) where.clientes = { nome: { contains: q } };
    if (status !== undefined) where.status = status;
    if (visibility.scope === 'partial') where.terapeuta_id = { in: visibility.therapistIds };

    const [total, result] = await prisma.$transaction([
        prisma.ocp_prontuario.count({ where }),
        prisma.ocp_prontuario.findMany({
            where,
            select: {
                id: true,
                cliente_id: true,
                clientes: {
                    select: {
                        nome: true,
                        dataNascimento: true,
                    },
                },
                terapeuta_id: true,
                terapeutas: {
                    select: {
                        nome: true,
                        registro_profissional: {
                            select: {
                                numero_conselho: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { evolucoes: true },
                },
                evolucoes: {
                    select: {
                        data_evolucao: true,
                    },
                },
                status: true,
                criado_em: true,
            },
            take: page_size,
            skip: (page - 1) * page_size,
            orderBy: { criado_em: 'desc' },
        }),
    ]);

    if (result.length === 0) {
        return {
            items: [],
            total,
            page,
            pageSize: page_size,
            totalPages: Math.ceil(total / page_size),
        }
    };

    const items = result.map((r) => {
        const lastEvolution = getLastEvolution(r.evolucoes.map((e) => e.data_evolucao));

        return {
            id: r.id,
            cliente_id: r.cliente_id,
            cliente_nome: r.clientes.nome,
            cliente_idade: calculateAge(r.clientes.dataNascimento),
            terapeuta_nome: r.terapeutas.nome,
            terapeuta_crp: r.terapeutas.registro_profissional[0]?.numero_conselho,
            total_evolucoes: r._count.evolucoes,
            ultima_evolucao: toDateOnly(lastEvolution) ?? undefined,
            status: r.status ? 'ativo' : 'inativo',
            criado_em: toDateOnly(r.criado_em),
        }
    });

    return {
        items,
        total,
        page,
        pageSize: page_size,
        totalPages: Math.ceil(total / page_size),
    }
}

export async function searchMedicalRecordById(medicalRecordId: number, userId: string) {
    const medicalRecord = await prisma.ocp_prontuario.findUnique({
        where: { id: medicalRecordId },
        select: queryPsychologicalRecord,
    });

    if (!medicalRecord) {
        throw new AppError(
            'MEDICAL_RECORD_NOT_FOUND',
            'Prontuário do cliente não encontrado',
            404,
        )
    };

    const visibility = await getVisibilityScope(userId);
    const ownership = {
        clientId: medicalRecord.cliente_id,
        therapistId: medicalRecord.terapeuta_id,
    };
    const allowed = await canAccessThis({ ownership, userId, visibility });
    if (!allowed) throw forbidden();

    return mapPsychologicalRecord(medicalRecord);
}

export async function createEvolution(
    payload: CreateEvolutionType, 
    attachments: ParsedFile[], 
    medicalRecordId: number, 
    _userId: string
) {
    return await prisma.$transaction(async (tx) => {
        const medicalRecord = await tx.ocp_prontuario.findUnique({
            where: { id: medicalRecordId },
            select: { id: true },
        });

        if (!medicalRecord) {
            throw new AppError(
                'NOT_FOUND',
                'Prontuário não encontrado',
                404,
            );
        };

        const evolution = await tx.prontuario_evolucao.create({
            data: {
                prontuario_id: medicalRecordId,
                data_evolucao: payload.data_evolucao,
                descricao_sessao: payload.descricao_sessao,
            },
            select: { id: true },
        });

        if (attachments.length === 0) return;

        const uploaded = await R2GenericUploadService.uploadMany({
            prefix: `prontuarios/${medicalRecordId}/evolucoes/${evolution.id}`,
            files: attachments.map((a) => ({
                buffer: a.buffer,
                mimetype: a.mime_type,
                originalname: a.original_name,
                size: a.size,
            })),
        });

        await tx.prontuario_evolucao_anexo.createMany({
            data: attachments.map((a, i) => {
                const upload = uploaded[i];

                if (!upload) {
                    throw new AppError(
                        'UPLOAD_FAILED',
                        'Falha ao mapear upload de anexo',
                        500
                    );
                }

                return {
                    evolucao_id: evolution.id,
                    nome: a.name,
                    caminho: upload.key,
                    tipo: a.mime_type,
                    tamanho: a.size,
                };
            }),
        });
    })
}

export async function listEvolutions(medicalRecordId: number, userId: string) {
    const where: Prisma.prontuario_evolucaoWhereInput = {};

    const visibility = await getVisibilityScope(userId);
    if (visibility.scope === 'partial') where.prontuario = { terapeuta_id : { in: visibility.therapistIds } };
    if (medicalRecordId) where.prontuario_id = medicalRecordId;

    const results = await prisma.prontuario_evolucao.findMany({
        where,
        select: {
            id: true,
            data_evolucao: true,
            descricao_sessao: true,
            anexos: {
                select: {
                    id: true,
                    nome: true,
                    tipo: true,
                    tamanho: true,
                    caminho: true,
                },
            },
            criado_em: true,
            atualizado_em: true,
        }
    });

    if (results.length === 0) return [];

    return results.map((r, i) => ({
        id: String(r.id),
        numero_sessao: i + 1,
        data_evolucao: r.data_evolucao,
        descricao_sessao: r.descricao_sessao,
        arquivos: r.anexos.map((a) => ({
            id: a.id,
            nome: a.nome,
            tipo: inferFileType(a.tipo),
            mime_type: a.tipo ?? undefined,
            tamanho: a.tamanho,
            url: a.caminho ?? undefined,
            caminho: a.caminho ?? undefined,
            arquivo_id: a.caminho ?? undefined,
        })),
        criado_em: r.criado_em,
        atualizado_em: r.atualizado_em,
    }));
}

export async function updateMedicalRecord(payload: PsychoUpdatePayload, medicalRecordId: number, _userId: string) {
    await prisma.$transaction(async (tx) => {
        const medicalRecord = await tx.ocp_prontuario.findUnique({
            where: { id: medicalRecordId },
        });
    
        if (!medicalRecord) {
            throw new AppError(
                'MEDICAL_RECORD_NOT_FOUND',
                'Prontuário do cliente não encontrado',
                404,
            )
        };

        const anamnese = await tx.anamnese.findFirst({
            where: { cliente_id: payload.clienteId },
            select: { id: true },
        });

        if (!anamnese) throw new AppError('ANAMNESE_REQUIRED', 'Cliente precisa ter anamnese antes de criar prontuário.', 409);

        await tx.ocp_prontuario.update({
            where: { id: medicalRecordId },
            data: {
                clientes: {
                    update: {
                        genero: payload.genero,
                        nivel_escolaridade: payload.nivelEscolaridade,
                        dadosEscola: {
                            update: {
                                nome: payload.instituicaoFormacao,
                            },
                        },
                    },
                },
                profissao_ocupacao: payload.profissaoOcupacao,
                observacao_educacional: payload.observacoesEducacao,
                observacoes_nucleo_familiar: payload.observacoesNucleoFamiliar,
                encaminhado_por: payload.encaminhadoPor,
                motivo_busca_atendimento: payload.motivoBuscaAtendimento,
                atendimentos_anteriores: payload.atendimentosAnteriores,
                observacao_demanda: payload.observacoesAvaliacao,
                objetivos_trabalho: payload.objetivosTrabalho,
                avaliacao_atendimento: payload.avaliacaoAtendimento,
            },
        });

        const familyNucleus = payload.nucleoFamiliar.filter((family) => family.origemBanco === false);

        if (familyNucleus.length > 0) {
            const seen = new Set<string>();
            for (const family of familyNucleus) {
                if (seen.has(family.cpf)) {
                    throw new AppError(
                        'DUPLICATE_FAMILY_MEMBER',
                        'CPF repetido na lista de familiares.',
                        400
                    );
                }
                seen.add(family.cpf);
            }
    
            const existingFamily = await tx.cuidador.findFirst({
                where: {
                    clienteId: payload.clienteId,
                    cpf: { in: familyNucleus.map(family => family.cpf) },
                },
                select: { cpf: true },
            });
    
            if (existingFamily) {
                throw new AppError(
                    'DUPLICATE_FAMILY_MEMBER',
                    'Já existe um familiar cadastrado com este CPF para este cliente.',
                    409
                );
            }
    
            const clientAddress = await tx.cliente_endereco.findFirst({
                where: { clienteId: payload.clienteId },
                select: { enderecoId: true },
            });
    
            await tx.cuidador.createMany({
                data: familyNucleus.map((fn) => ({
                    relacao: fn.parentesco,
                    descricaoRelacao: fn.descricaoRelacao,
                    nome: fn.nome,
                    cpf: fn.cpf,
                    profissao: fn.ocupacao,
                    clienteId: payload.clienteId,
                    enderecoId: clientAddress?.enderecoId ?? null,
                    dataNascimento: fn.dataNascimento,
                })),
            });
        };

        const previousTherapies = payload.terapiasPrevias.filter((pt) => pt.origemAnamnese === false);

        if (previousTherapies.length > 0) {
            await tx.anamnese_terapia_previa.createMany({
                data: previousTherapies.map((pt) => ({
                    anamnese_id: anamnese.id,
                    profissional: pt.profissional,
                    especialidade_abordagem: pt.especialidadeAbordagem,
                    tempo_intervencao: pt.tempoIntervencao,
                    observacao: pt.observacao,
                    ativo: pt.ativo,
                })),
            });
        }
    });

    return { id: medicalRecordId };
}