import type { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import type { UpdateTherapistSchemaInput } from '../../schemas/therapist.schema.js';
import * as TherapistTypes from "./therapist.types.js";

export function normalizeTherapistNullableString(value: string | null | undefined) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function normalizeTherapistDate(
    value: Date | string | number | null | undefined,
) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new AppError('INVALID_DATE', 'Formato de data inválido', 400);
    }
    return parsed;
}

export function normalizeTherapistEnderecoUpdate(
    endereco: UpdateTherapistSchemaInput['endereco'],
): {
    hasChanges: boolean;
    create: Prisma.enderecoCreateInput;
    update: Prisma.enderecoUpdateInput;
} {
    const create: Prisma.enderecoCreateInput = {};
    const update: Prisma.enderecoUpdateInput = {};
    let hasChanges = false;

    if (!endereco) {
        return { hasChanges, create, update };
    }

    const assign = (key: TherapistTypes.EnderecoStringKeys, value: string | null | undefined) => {
        if (value === undefined) return;
        hasChanges = true;
        const normalized = normalizeTherapistNullableString(value);

        (update as Record<
            TherapistTypes.EnderecoStringKeys,
            string | Prisma.NullableStringFieldUpdateOperationsInput | null
        >)[key] = normalized ?? null;

        (create as Record<TherapistTypes.EnderecoStringKeys, string | null>)[key] = normalized ?? null;
    };

    assign('cep', endereco.cep);
    assign('rua', endereco.rua);
    assign('numero', endereco.numero);
    assign('complemento', endereco.complemento);
    assign('bairro', endereco.bairro);
    assign('cidade', endereco.cidade);
    assign('uf', endereco.estado);

    return { hasChanges, create, update };
}

export function normalizeTherapistForm(db: TherapistTypes.TherapistDB) {
    return {
        nome: db.nome,
        email: db.email,
        emailIndigo: db.email_indigo,
        telefone: db.telefone ?? '',
        celular: db.celular,
        cpf: db.cpf,
        dataNascimento: db.data_nascimento.toISOString(),
        possuiVeiculo: db.possui_veiculo ? 'Sim' : 'Não',
        placaVeiculo: db.placa_veiculo ?? '',
        modeloVeiculo: db.modelo_veiculo ?? '',
        banco: db.banco ?? '',
        agencia: db.agencia ?? '',
        conta: db.conta ?? '',
        chavePix: db.chave_pix ?? '',
        pixTipo: db.pix_tipo ?? '',
        valorHoraAcordado: db.valor_hora?.toString() ?? '',
        professorUnindigo: db.professor_uni ? 'Sim' : 'Não',
        disciplinaUniindigo: db.disciplina?.map((d) => d.nome).join(", ") ?? "",
        endereco: {
            cep: db.endereco?.cep ?? '',
            rua: db.endereco?.rua ?? '',
            numero: db.endereco?.numero ?? '',
            complemento: db.endereco?.numero ?? '',
            bairro: db.endereco?.bairro ?? '',
            cidade: db.endereco?.cidade ?? '',
            estado: db.endereco?.uf ?? '',
        },
        
        dataInicio: db.data_entrada!,
        dataFim: db.data_saida ?? null,
        formacao: {
            graduacao: db.formacao?.[0]?.graduacao ?? '',
            instituicaoGraduacao: db.formacao?.[0]?.instituicao_graduacao ?? '',
            anoFormatura: db.formacao?.[0]?.ano_formatura ?? 0,
            posGraduacoes: db.formacao?.[0]?.pos_graduacao?.map((p) => ({
                tipo: p.tipo!,
                curso: p.curso!,
                instituicao: p.instituicao!,
                conclusao: p.conclusao!,
            })) ?? [],
            participacaoCongressosDescricao: db.formacao?.[0]?.participacao_congressos ?? '',
            publicacoesLivrosDescricao: db.formacao?.[0]?.publicacoes_descricao ?? '',
        },

        cnpj: {
            numero: db.pessoa_juridica?.cnpj ?? '',
            razaoSocial: db.pessoa_juridica?.razao_social ?? '',
            nomeFantasia: '',
            endereco: {
                cep: db.pessoa_juridica?.endereco?.cep ?? '',
                rua: db.pessoa_juridica?.endereco?.rua ?? '',
                numero: db.pessoa_juridica?.endereco?.numero ?? '',
                complemento: db.pessoa_juridica?.endereco?.complemento ?? '',
                bairro: db.pessoa_juridica?.endereco?.bairro ?? '',
                cidade: db.pessoa_juridica?.endereco?.cidade ?? '',
                estado: db.pessoa_juridica?.endereco?.uf ?? '',
            }
        },

        dadosProfissionais: db.registro_profissional?.map((r) => ({
            areaAtuacaoId: r.area_atuacao?.id ?? null,
            areaAtuacao: r.area_atuacao?.nome ?? '',
            cargoId: r.cargo?.id ?? null,
            cargo: r.cargo?.nome ?? '',
            numeroConselho: r.numero_conselho ?? '',
        })) ?? [],

        arquivos: db.arquivos?.map((a) => ({
            nome: a.tipo,
            arquivo_id: a.arquivo_id,
            mime_type: a.mime_type,
            tamanho: Number(a.tamanho ?? 0),
            data: a.data_upload ? a.data_upload.toISOString() : null,
        })),
    }
}

export function normalizeTherapistSession(db: TherapistTypes.TherapistDB) {
    const specialties = (db.registro_profissional
        ?.map((d) => d.area_atuacao?.nome?.trim())
        .filter((value): value is string => Boolean(value && value.length > 0))
    ) ?? [];
    return {
        id: db.id,
        nome: db.nome,
        email: db.email,
        telefone: db.telefone ?? db.celular,
        status: db.atividade ? 'ATIVO' : 'INATIVO',
        especialidade: db.registro_profissional?.[0]?.area_atuacao?.nome ?? '',
        conselho: 'CRP',
        registroConselho: db.registro_profissional?.[0]?.numero_conselho ?? '',
        avatarUrl: '',

        pessoa: {
            cpf: db.cpf,
            dataNascimento: db.data_nascimento?.toISOString(),
            genero: '',
            observacoes: '',
        },

        endereco: {
            cep: db.endereco?.cep ?? '',
            rua: db.endereco?.rua ?? '',
            numero: db.endereco?.numero ?? '',
            complemento: db.endereco?.complemento ?? '',
            bairro: db.endereco?.bairro ?? '',
            cidade: db.endereco?.cidade ?? '',
            uf: db.endereco?.uf ?? '',
        },

        profissional: {
            cargaHorariaSemanal: 0,
            atendeConvenio: false,
            especialidades: specialties.length > 0 ? specialties : ['Presencial'],
            valorConsulta: Number(db.valor_hora),
            formasAtendimento: ['Presencial'],
        },

        formacao: db.formacao?.map(f => ({
            curso: f.graduacao ?? '',
            instituicao: f.instituicao_graduacao ?? '',
            ano: f.ano_formatura ?? 2020,
        })) ?? [],

        arquivos: db.arquivos?.map((a) => ({
            nome: a.tipo,
            tipo: a.mime_type,
            tamanho: Number(a.tamanho ?? 0),
            data: a.data_upload ? a.data_upload.toISOString() : null,
        })),
        cnpj: db.pessoa_juridica?.cnpj ?? '',
    };
}