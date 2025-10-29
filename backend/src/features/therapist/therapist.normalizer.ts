import { AppError } from '../../errors/AppError.js';
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
            complemento: db.endereco?.complemento ?? '',
            bairro: db.endereco?.bairro ?? '',
            cidade: db.endereco?.cidade ?? '',
            estado: db.endereco?.uf ?? '',
        },
        
        dataInicio: db.data_entrada!,
        dataFim: db.data_saida ?? null,
        formacao: db.formacao
            ? {
                graduacao: db.formacao.graduacao ?? '',
                instituicaoGraduacao: db.formacao.instituicao_graduacao ?? '',
                anoFormatura: db.formacao.ano_formatura?.toString() ?? '',
                posGraduacoes: db.formacao.pos_graduacao?.map((p) => ({
                    tipo: p.tipo ?? '',
                    curso: p.curso ?? '',
                    instituicao: p.instituicao ?? '',
                    conclusao: p.conclusao ?? '',
                })) ?? [],
                participacaoCongressosDescricao: db.formacao.participacao_congressos ?? '',
                publicacoesLivrosDescricao: db.formacao.publicacoes_descricao ?? '',
                }
            : {
                graduacao: '',
                instituicaoGraduacao: '',
                anoFormatura: '',
                posGraduacoes: [],
                participacaoCongressosDescricao: '',
                publicacoesLivrosDescricao: '',
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

    const fotoPerfil = (db.arquivos ?? []).find((a) => a.tipo === 'fotoPerfil');

    return {
        id: db.id,
        nome: db.nome,
        email: db.email,
        telefone: db.telefone ?? db.celular,
        status: db.atividade ? 'ATIVO' : 'INATIVO',
        especialidade: db.registro_profissional?.[0]?.area_atuacao?.nome ?? '',
        conselho: 'CRP',
        registroConselho: db.registro_profissional?.[0]?.numero_conselho ?? '',
        avatarUrl: fotoPerfil?.arquivo_id
            ? `/api/arquivos/${fotoPerfil.arquivo_id}/view`
            : '',

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

        formacao: {
            curso: db.formacao?.graduacao,
            instituicao: db.formacao?.instituicao_graduacao,
            ano: db.formacao?.ano_formatura,
        },

        arquivos: db.arquivos?.map((a) => ({
            nome: a.tipo,
            tipo: a.mime_type,
            tamanho: Number(a.tamanho ?? 0),
            data: a.data_upload ? a.data_upload.toISOString() : null,
        })),
        cnpj: db.pessoa_juridica?.cnpj ?? '',
    };
}

export function emptyStringsToNull<T>(value: T, parentKey?: string): T {
  if (Array.isArray(value)) {
    return value.map(v => emptyStringsToNull(v, parentKey)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, emptyStringsToNull(v, k)]);
    return Object.fromEntries(entries) as unknown as T;
  }

  if (parentKey === 'complemento' && value === '') {
    return '' as unknown as T;
  }

  return (value === '' ? null : value) as unknown as T;
}