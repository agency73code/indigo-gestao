import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { AppError } from "../../../errors/AppError.js";
import type { PsychoPayload, queryType } from "./psychotherapy.schema.js";
import { calculateAge } from "../../../utils/calculateAge.js";
import { toDateOnly } from "../../../utils/toDateOnly.js";
import { buildAvatarUrl } from "../../../utils/avatar-url.js";
import { getVisibilityScope } from "../../../utils/visibilityFilter.js";

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

        const familyNucleus = payload.nucleo_familiar;
        const familyNucleusNews = familyNucleus.filter((family) => family.origem_banco === false);

        const clientAddress = await tx.cliente_endereco.findFirst({
            where: { clienteId: payload.cliente_id },
            select: { enderecoId: true },
        });

        let familyNucleusCreate:
            | Prisma.BatchPayload
            | null = null;

        try {
            familyNucleusCreate = await tx.cuidador.createMany({
                data: familyNucleusNews.map((fn) => ({
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

        } catch (err) {
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002' &&
                err.meta?.target === 'cuidador_clienteId_cpf_key'
            ) {
                throw new AppError(
                    'DUPLICATE_FAMILY_MEMBER',
                    'Já existe um familiar cadastrado com este CPF para este cliente.',
                    409
                );
            }

            throw err;
        }

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
            familyNucleusCreate,
            previousTherapiesNewCreate, 
            previousTherapiesOldsUpdate, 
            previousTherapiesDelete,
        };
    });
}

export async function searchMedicalRecordByClient(clientId: string) {
    const medicalRecord = await prisma.ocp_prontuario.findFirst({
        where: { cliente_id: clientId },
        select: {
            id: true,
            cliente_id: true,
            terapeuta_id: true,
            clientes: {
                select: {
                    id: true,
                    nome: true,
                    dataNascimento: true,
                    genero: true,
                    nivel_escolaridade: true,
                    dadosEscola: {
                        select: {
                            nome: true,
                        },
                    },
                    cuidadores: {
                        select: {
                            id: true,
                            nome: true,
                            cpf: true,
                            relacao: true,
                            descricaoRelacao: true,
                            dataNascimento: true,
                            profissao: true,
                        },
                    },
                    anamneses: {
                        select: {
                            queixa_diagnostico: {
                                select: {
                                    terapias_previas: {
                                        select: {
                                            id: true,
                                            profissional: true,
                                            especialidade_abordagem: true,
                                            tempo_intervencao: true,
                                            observacao: true,
                                            ativo: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    arquivos: {
                        where: { tipo: 'fotoPerfil' },
                        select: {
                            arquivo_id: true,
                        },
                        take: 1,
                    }
                },
            },
            profissao_ocupacao: true,
            observacao_educacional: true,
            observacoes_nucleo_familiar: true,
            encaminhado_por: true,
            motivo_busca_atendimento: true,
            atendimentos_anteriores: true,
            observacao_demanda: true,
            objetivos_trabalho: true,
            avaliacao_atendimento: true,
            status: true,
            criado_em: true,
            atualizado_em: true,
            terapeutas: {
                select: {
                    id: true,
                    nome: true,
                    registro_profissional: {
                        select: {
                            numero_conselho: true,
                        },
                    },
                    arquivos: {
                        where: { tipo: 'fotoPerfil' },
                        select: {
                            arquivo_id: true,
                        },
                        take: 1,
                    },
                },
            },
        }
    });

    if (!medicalRecord) {
        throw new AppError(
            'MEDICAL_RECORD_NOT_FOUND',
            'Prontuário do cliente não encontrado',
            404,
        )
    };

    return {
        id: medicalRecord.id,
        cliente_id: medicalRecord.cliente_id,
        terapeuta_id: medicalRecord.terapeuta_id,

        // Informações Educacionais
        informacoes_educacionais: {
            nivel_escolaridade: medicalRecord.clientes.nivel_escolaridade,
            instituicao_formacao: medicalRecord.clientes.dadosEscola?.nome,
            profissao_ocupacao: medicalRecord.profissao_ocupacao,
            observacoes: medicalRecord.observacao_educacional,
        },

        // Núcleo Familiar
        nucleo_familiar: medicalRecord.clientes.cuidadores.map((c) => ({
            id: String(c.id),
            nome: c.nome,
            cpf: c.cpf ?? undefined,
            parentesco: c.relacao,
            descricao_relacao: c.descricaoRelacao ?? undefined,
            data_nascimento: toDateOnly(c.dataNascimento) ?? undefined,
            idade: c.dataNascimento ? calculateAge(c.dataNascimento) : undefined,
            ocupacao: c.profissao ?? undefined,
            origem_banco: true,
        })),
        observacoes_nucleo_familiar: medicalRecord.observacoes_nucleo_familiar,

        // Avaliação da Demanda
        avaliacao_demanda: {
            encaminhado_por: medicalRecord.encaminhado_por,
            motivo_busca_atendimento: medicalRecord.motivo_busca_atendimento,
            atendimentos_anteriores: medicalRecord.atendimentos_anteriores,
            observacoes: medicalRecord.observacao_demanda,
            terapias_previas: medicalRecord.clientes.anamneses
                .flatMap((a) => a.queixa_diagnostico?.terapias_previas ?? [])
                .map((tp) => ({
                    id: String(tp.id),
                    profissional: tp.profissional ?? 'Não informado',
                    especialidade_abordagem: tp.especialidade_abordagem ?? 'Não informado',
                    tempo_intervencao: tp.tempo_intervencao ?? 'Não informado',
                    observacao: tp.observacao ?? undefined,
                    ativo: tp.ativo,
                    origem_anamnese: true,
                })),
        },

        // Objetivos e Avaliação
        objetivos_trabalho: medicalRecord.objetivos_trabalho,
        avaliacao_atendimento: medicalRecord.avaliacao_atendimento,

        // Evoluções
        evolucoes: [], // TODO

        // Metadados
        status: medicalRecord.status ? 'ativo' : 'inativo',
        criado_em: medicalRecord.criado_em,
        atualizado_em: medicalRecord.atualizado_em ?? undefined,

        // Relacionamentos expandidos (quando incluídos)
        cliente: {
            id: medicalRecord.cliente_id,
            nome: medicalRecord.clientes.nome,
            data_nascimento: toDateOnly(medicalRecord.clientes.dataNascimento),
            genero: medicalRecord.clientes.genero ?? undefined,
            foto_url: buildAvatarUrl(medicalRecord.clientes.arquivos),
        },
        terapeuta: {
            id: medicalRecord.terapeuta_id,
            nome: medicalRecord.terapeutas.nome,
            crp: medicalRecord.terapeutas.registro_profissional[0]?.numero_conselho ?? undefined,
            foto_url: buildAvatarUrl(medicalRecord.terapeutas.arquivos),
        },
    };
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

    const items = result.map((r) => ({
        id: r.id,
        cliente_id: r.cliente_id,
        cliente_nome: r.clientes.nome,
        cliente_idade: calculateAge(r.clientes.dataNascimento),
        terapeuta_nome: r.terapeutas.nome,
        terapeuta_crp: r.terapeutas.registro_profissional[0]?.numero_conselho,
        total_evolucoes: 0, // TODO
        ultima_evolucao: undefined, // isso é data retornar com toDateOnly
        status: r.status ? 'ativo' : 'inativo',
        criado_em: toDateOnly(r.criado_em),
    }));

    return {
        items,
        total,
        page,
        pageSize: page_size,
        totalPages: Math.ceil(total / page_size),
    }
}