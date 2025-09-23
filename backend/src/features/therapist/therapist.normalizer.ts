import * as TherapistTypes from "./therapist.types.js";

export function normalizeTherapistForm(db: TherapistTypes.TherapistDB): TherapistTypes.TherapistDetails {
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
        valorHoraAcordado: db.valor_hora?.toString() ?? '',
        professorUnindigo: db.professor_uni ? 'Sim' : 'Não',
        disciplinaUniindigo: 'teste',
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
            publicacoesLivrosDescricao: db.formacao?.[0]?.participacao_congressos ?? '',
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
            areaAtuacao: r.area_atuacao ?? '',
            cargo: r.cargo ?? '',
            numeroConselho: r.numero_conselho ?? '',
        })) ?? [],
        arquivos: db.documentos_terapeuta?.map((d) => ({
            id: d.id.toString() ?? '',
            nome: d.view_url ?? '',
            tipo: d.tipo_documento ?? '',
            tamanho: 0,
            data: d.data_upload?.toISOString(),
        })) ?? [],
    }
}

export function normalizeTherapistSession(db: TherapistTypes.TherapistDB): TherapistTypes.TherapistSession {
    return {
        id: db.id,
        nome: db.nome,
        email: db.email,
        telefone: db.telefone ?? db.celular,
        status: db.atividade ? 'ATIVO' : 'INATIVO',
        especialidade: db.registro_profissional?.[0]?.area_atuacao ?? '',
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
            especialidades: db.registro_profissional?.map(d => d.area_atuacao) ?? ['Presencial'],
            valorConsulta: Number(db.valor_hora),
            formasAtendimento: ['Presencial'],
        },
        formacao: db.formacao?.map(f => ({
            curso: f.graduacao ?? '',
            instituicao: f.instituicao_graduacao ?? '',
            ano: f.ano_formatura ?? 2020,
        })) ?? [],
        arquivos: db.documentos_terapeuta?.map(doc => ({
            id: doc.id,
            nome: doc.tipo_documento,
            data: doc.data_upload.toISOString(),
            tipo: "",
            tamanho: 1,
        })) ?? [],
        cnpj: db.pessoa_juridica?.cnpj ?? '',
    };
}